const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRPC() {
  console.log('🔍 Debugging user_has_profile RPC function...\n');

  try {
    // Test 1: Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session ? 'Exists' : 'None');
    if (sessionError) console.log('Session error:', sessionError);
    
    // Test 2: Try the RPC function
    console.log('\n2. Testing user_has_profile RPC...');
    const startTime = Date.now();
    const { data: hasProfile, error: profileError } = await supabase.rpc('user_has_profile');
    const endTime = Date.now();
    
    console.log('RPC execution time:', endTime - startTime, 'ms');
    console.log('Result:', { hasProfile, profileError });
    
    // Test 3: Try to access user_profiles table directly
    console.log('\n3. Testing direct table access...');
    const { data: profiles, error: tableError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    console.log('Table access result:', { profiles, tableError });
    
    // Test 4: Check if we can access the view
    console.log('\n4. Testing profiles_public view...');
    const { data: publicProfiles, error: viewError } = await supabase
      .from('profiles_public')
      .select('id')
      .limit(1);
    
    console.log('View access result:', { publicProfiles, viewError });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

debugRPC();
