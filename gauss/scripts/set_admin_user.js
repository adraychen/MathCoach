/**
 * Set an existing Supabase Auth user as admin.
 *
 * Usage:
 *   node scripts/set_admin_user.js <email> <display_name>
 *
 * Example:
 *   node scripts/set_admin_user.js "raychen_email@yahoo.com" "Ray Chen"
 *
 * This script will:
 *   1. Look up the user by email in auth.users
 *   2. Insert or update their profile with role = 'admin'
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
 *   - The user must already exist in Supabase auth.
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

/**
 * Find a user by email with pagination support
 */
async function findUserByEmail(email) {
  const targetEmail = email.toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Error listing users: ${error.message}`);
    }

    const user = data.users.find(u => u.email?.toLowerCase() === targetEmail);
    if (user) {
      return user;
    }

    // No more pages
    if (data.users.length < perPage) {
      return null;
    }

    page++;
  }
}

async function setAdminUser(email, displayName) {
  console.log('');
  console.log('Setting admin user...');
  console.log(`  Email: ${email}`);
  console.log(`  Display name: ${displayName}`);
  console.log('');

  // Look up user by email
  console.log('Looking up user...');

  let user;
  try {
    user = await findUserByEmail(email);
  } catch (err) {
    console.error(err.message);
    return false;
  }

  if (!user) {
    console.error(`Error: No user found with email "${email}"`);
    console.error('');
    console.error('Make sure the user has already signed up or been created in Supabase auth.');
    return false;
  }

  console.log(`  Found user: ${user.id}`);

  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    // Update existing profile
    console.log('Updating existing profile to admin...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        display_name: displayName,
        email: email,
        login_type: 'email',
        active: true,
        approval_status: 'approved',
        must_change_password: false,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError.message);
      return false;
    }

    console.log(`  Profile updated: role changed from "${existingProfile.role}" to "admin"`);
  } else {
    // Create new profile
    console.log('Creating admin profile...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        role: 'admin',
        display_name: displayName,
        email: email,
        login_type: 'email',
        active: true,
        approval_status: 'approved',
        must_change_password: false,
      });

    if (insertError) {
      console.error('Error creating profile:', insertError.message);
      return false;
    }

    console.log('  Admin profile created');
  }

  console.log('');
  console.log('Success!');
  console.log('');
  console.log('Admin user details:');
  console.log(`  Email: ${email}`);
  console.log(`  Display name: ${displayName}`);
  console.log(`  Role: admin`);
  console.log('');

  return true;
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node scripts/set_admin_user.js <email> <display_name>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/set_admin_user.js "raychen_email@yahoo.com" "Ray Chen"');
    console.log('');
    console.log('This will set the user with the given email as an admin.');
    console.log('The user must already exist in Supabase auth.');
    process.exit(1);
  }

  const [email, displayName] = args;

  // Basic email validation
  if (!email.includes('@')) {
    console.error('Error: Please provide a valid email address.');
    process.exit(1);
  }

  const success = await setAdminUser(email, displayName);

  process.exit(success ? 0 : 1);
}

main();
