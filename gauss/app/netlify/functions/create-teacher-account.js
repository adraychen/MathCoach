import { createClient } from '@supabase/supabase-js';

/**
 * Netlify Function: Create Teacher Account
 *
 * Allows an admin to create a teacher account from the Admin Portal.
 * Sends an invitation email to the teacher to set their own password.
 *
 * POST /.netlify/functions/create-teacher-account
 *
 * Headers:
 *   Authorization: Bearer <access_token>
 *
 * Body:
 *   {
 *     "email": "teacher@example.com",
 *     "display_name": "Jane Smith"
 *   }
 */

export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get access token from Authorization header
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or invalid authorization header' }),
    };
  }

  const accessToken = authHeader.replace('Bearer ', '');

  // Verify the requesting user
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData?.user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid or expired access token' }),
    };
  }

  const requestingUserId = userData.user.id;

  // Check if requesting user is an active, approved admin
  const { data: adminProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, active, approval_status')
    .eq('id', requestingUserId)
    .single();

  if (profileError || !adminProfile) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Profile not found' }),
    };
  }

  if (adminProfile.role !== 'admin') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Only admins can create teacher accounts' }),
    };
  }

  if (!adminProfile.active) {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Your account is inactive' }),
    };
  }

  if (adminProfile.approval_status !== 'approved') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Your account is not approved' }),
    };
  }

  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const { email, display_name } = body;

  // Validate required fields
  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Email is required' }),
    };
  }

  if (!display_name || typeof display_name !== 'string' || !display_name.trim()) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Display name is required' }),
    };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedDisplayName = display_name.trim();

  // Check if email already exists in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', trimmedEmail)
    .single();

  if (existingProfile) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'A user with this email already exists' }),
    };
  }

  // Get the origin for redirect URL
  const origin = event.headers.origin || event.headers.Origin || process.env.SITE_URL || '';
  const redirectTo = origin ? `${origin}/reset-password` : undefined;

  // Invite user by email - they will receive an email to set their password
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
    trimmedEmail,
    {
      data: {
        role: 'teacher',
        display_name: trimmedDisplayName,
      },
      redirectTo,
    }
  );

  if (authError) {
    console.error('Auth creation error:', authError.message);

    if (authError.message.includes('already been registered')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'A user with this email already exists' }),
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Failed to create auth user: ${authError.message}` }),
    };
  }

  const newUserId = authData.user.id;

  // Insert profile
  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: newUserId,
      role: 'teacher',
      display_name: trimmedDisplayName,
      email: trimmedEmail,
      username: null,
      login_type: 'email',
      active: true,
      approval_status: 'approved',
      created_by: requestingUserId,
    });

  if (insertError) {
    console.error('Profile insert error:', insertError.message);

    // Rollback: delete the auth user
    await supabase.auth.admin.deleteUser(newUserId);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Failed to create profile: ${insertError.message}` }),
    };
  }

  // Success response
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      teacher: {
        id: newUserId,
        email: trimmedEmail,
        display_name: trimmedDisplayName,
      },
    }),
  };
}
