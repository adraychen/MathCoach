/**
 * Create a student account with username and password.
 *
 * Usage:
 *   node scripts/create_student_account.js <username> <password> <display_name>
 *
 * Example:
 *   node scripts/create_student_account.js raytest01 "TempPass123!" "Ray Test"
 *
 * Requirements:
 *   - Set environment variables:
 *     SUPABASE_URL=https://your-project.supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *
 *   - Or create a .env file in the scripts folder
 *
 * Note:
 *   - This script uses the service role key which has admin privileges.
 *   - Keep this key secure and never expose it in client-side code.
 *   - Never use VITE_SUPABASE_ANON_KEY for this script.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ws from 'ws';

// Load .env from scripts folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

const STUDENT_EMAIL_DOMAIN = '@student.gauss.local';

// Validate environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing environment variables.');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('You can create a .env file in the scripts folder:');
  console.error('  SUPABASE_URL=https://your-project.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws,
  },
});

// Validate username format
function validateUsername(username) {
  const usernameRegex = /^[a-z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return 'Username must contain only lowercase letters, numbers, underscores, or hyphens';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 50) {
    return 'Username must be 50 characters or less';
  }
  return null;
}

// Validate password
function validatePassword(password) {
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

async function createStudentAccount(username, password, displayName) {
  console.log('');
  console.log('Creating student account...');
  console.log(`  Username: ${username}`);
  console.log(`  Display name: ${displayName}`);
  console.log('');

  // Validate inputs
  const usernameError = validateUsername(username);
  if (usernameError) {
    console.error(`Error: ${usernameError}`);
    return false;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`Error: ${passwordError}`);
    return false;
  }

  // Convert username to email
  const email = `${username}${STUDENT_EMAIL_DOMAIN}`;

  // Check if username already exists in student_profiles
  const { data: existingProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existingProfile) {
    console.error(`Error: Username "${username}" already exists.`);
    return false;
  }

  // Create auth user with user_metadata
  console.log('Creating auth user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      display_name: displayName,
      role: 'student',
    },
  });

  if (authError) {
    console.error('Error creating auth user:', authError.message);
    return false;
  }

  const userId = authData.user.id;
  console.log(`  Auth user created: ${userId}`);

  // Create student profile
  console.log('Creating student profile...');
  const { error: profileError } = await supabase
    .from('student_profiles')
    .insert({
      id: userId,
      username,
      display_name: displayName,
      role: 'student',
      active: true,
      must_change_password: true,
    });

  if (profileError) {
    console.error('Error creating student profile:', profileError.message);
    // Clean up: delete the auth user if profile creation failed
    console.log('Rolling back: deleting auth user...');
    await supabase.auth.admin.deleteUser(userId);
    return false;
  }

  console.log('  Student profile created');
  console.log('');
  console.log('Success! Student account created.');
  console.log('');
  console.log('Account details:');
  console.log(`  Username: ${username}`);
  console.log(`  Display name: ${displayName}`);
  console.log('');

  return true;
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: node scripts/create_student_account.js <username> <password> <display_name>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/create_student_account.js raytest01 "TempPass123!" "Ray Test"');
    console.log('');
    console.log('Username rules:');
    console.log('  - Lowercase letters, numbers, underscores, hyphens only');
    console.log('  - 3-50 characters');
    console.log('');
    console.log('Password rules:');
    console.log('  - At least 6 characters');
    process.exit(1);
  }

  const [username, password, displayName] = args;

  const success = await createStudentAccount(
    username.toLowerCase(),
    password,
    displayName
  );

  process.exit(success ? 0 : 1);
}

main();
