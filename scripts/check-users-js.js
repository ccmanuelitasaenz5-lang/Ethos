
const fs = require('fs');
const path = require('path');

// Basic env parser
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Manually require using absolute path and correct entry point
const supabaseJsPath = path.join(rootDir, 'node_modules/@supabase/supabase-js/dist/index.cjs');
const { createClient } = require(supabaseJsPath);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
  console.log('--- Checking auth.users ---');
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError.message);
    } else {
      console.log(`Found ${authData.users.length} users in auth.users`);
      authData.users.forEach(u => {
        console.log(`- Email: ${u.email}, ID: ${u.id}, Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`);
      });
    }
  } catch (e) {
    console.error('Unexpected error in auth check:', e.message);
  }

  console.log('\n--- Checking public.users ---');
  try {
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('id, full_name, role, organization_id');

    if (publicError) {
      console.error('Error fetching public users:', publicError.message);
    } else {
      console.log(`Found ${publicUsers.length} users in public.users`);
      publicUsers.forEach(u => {
        console.log(`- Name: ${u.full_name}, ID: ${u.id}, OrgID: ${u.organization_id}, Role: ${u.role}`);
      });
    }
  } catch (e) {
    console.error('Unexpected error in DB check:', e.message);
  }
}

checkUsers();
