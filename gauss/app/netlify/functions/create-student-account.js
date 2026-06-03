import { createClient } from '@supabase/supabase-js';

/**
 * Netlify Function: Create Student Account
 *
 * Allows an admin to create a student account and assign to a teacher.
 *
 * POST /.netlify/functions/create-student-account
 *
 * Headers:
 *   Authorization: Bearer <access_token>
 *
 * Body:
 *   {
 *     "display_name": "John Doe",
 *     "password": "TempPass123!",
 *     "teacher_id": "uuid-of-teacher",
 *     "login_type": "email" | "username",
 *     "email": "student@example.com",  // required if login_type = "email"
 *     "username": "john_doe"           // required if login_type = "username"
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
      body: JSON.stringify({ error: 'Only admins can create student accounts' }),
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

  const { display_name, password, teacher_id, login_type, email, username } = body;

  // Validate display_name
  if (!display_name || typeof display_name !== 'string' || !display_name.trim()) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Display name is required' }),
    };
  }

  // Validate password
  if (!password || typeof password !== 'string' || password.length < 6) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Password is required and must be at least 6 characters' }),
    };
  }

  // Validate teacher_id
  if (!teacher_id || typeof teacher_id !== 'string' || !teacher_id.trim()) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Teacher ID is required' }),
    };
  }

  // Validate login_type
  if (!login_type || (login_type !== 'email' && login_type !== 'username')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Login type must be either "email" or "username"' }),
    };
  }

  const trimmedDisplayName = display_name.trim();
  let authEmail;
  let trimmedUsername = null;
  let trimmedEmail = null;

  // Validate based on login_type
  if (login_type === 'email') {
    if (!email || typeof email !== 'string' || !email.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email is required for email login type' }),
      };
    }
    trimmedEmail = email.trim().toLowerCase();
    authEmail = trimmedEmail;

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', trimmedEmail)
      .single();

    if (existingEmail) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'A user with this email already exists' }),
      };
    }
  } else {
    // login_type === 'username'
    if (!username || typeof username !== 'string' || !username.trim()) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Username is required for username login type' }),
      };
    }

    trimmedUsername = username.trim().toLowerCase();

    // Validate username format: lowercase letters, numbers, underscores, hyphens
    if (!/^[a-z0-9_-]+$/.test(trimmedUsername)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Username can only contain lowercase letters, numbers, underscores, and hyphens' }),
      };
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Username must be between 3 and 30 characters' }),
      };
    }

    // Create internal email for Supabase auth
    authEmail = `${trimmedUsername}@student.gauss.local`;
    trimmedEmail = authEmail;

    // Check if username already exists
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmedUsername)
      .single();

    if (existingUsername) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'A student with this username already exists' }),
      };
    }
  }

  // Verify teacher exists and is valid
  const { data: teacherProfile, error: teacherError } = await supabase
    .from('profiles')
    .select('id, role, active, approval_status')
    .eq('id', teacher_id)
    .single();

  if (teacherError || !teacherProfile) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Teacher not found' }),
    };
  }

  if (teacherProfile.role !== 'teacher') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Selected user is not a teacher' }),
    };
  }

  if (!teacherProfile.active) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Selected teacher is inactive' }),
    };
  }

  if (teacherProfile.approval_status !== 'approved') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Selected teacher is not approved' }),
    };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'student',
      display_name: trimmedDisplayName,
      username: trimmedUsername,
      login_type,
    },
  });

  if (authError) {
    console.error('Auth creation error:', authError.message);

    if (authError.message.includes('already been registered')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'A user with this email or username already exists' }),
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
      role: 'student',
      display_name: trimmedDisplayName,
      username: trimmedUsername,
      email: trimmedEmail,
      login_type,
      active: true,
      approval_status: 'approved',
      must_change_password: true,
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

  // Insert student_teacher_assignment
  const { error: assignmentError } = await supabase
    .from('student_teacher_assignments')
    .insert({
      student_id: newUserId,
      teacher_id,
      assigned_by: requestingUserId,
      active: true,
    });

  if (assignmentError) {
    console.error('Assignment insert error:', assignmentError.message);

    // Rollback: delete the profile and auth user
    await supabase.from('profiles').delete().eq('id', newUserId);
    await supabase.auth.admin.deleteUser(newUserId);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Failed to create teacher assignment: ${assignmentError.message}` }),
    };
  }

  // Success response (do not return password)
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      student: {
        id: newUserId,
        display_name: trimmedDisplayName,
        username: trimmedUsername,
        email: trimmedEmail,
        login_type,
        teacher_id,
      },
    }),
  };
}
