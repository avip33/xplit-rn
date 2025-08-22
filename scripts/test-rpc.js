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

async function testRPC() {
  console.log('🧪 Testing user_has_profile RPC function...\n');

  try {
    // Test without authentication (should fail)
    console.log('1. Testing without authentication...');
    const { data: unauthenticatedResult, error: unauthenticatedError } = await supabase.rpc('user_has_profile');
    console.log('Unauthenticated result:', { data: unauthenticatedResult, error: unauthenticatedError });
    
    if (unauthenticatedError) {
      console.log('✅ Expected error for unauthenticated user:', unauthenticatedError.message);
    } else {
      console.log('⚠️  Unexpected: RPC worked without authentication');
    }

    // Test with authentication (sign in with a test user)
    console.log('\n2. Testing with authentication...');
    
    // Try to sign in with a test email (this will fail, but we can test the RPC)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword'
    });
    
    if (signInError) {
      console.log('Sign in failed as expected:', signInError.message);
    }
    
    // Even with failed sign in, let's try the RPC
    const { data: authenticatedResult, error: authenticatedError } = await supabase.rpc('user_has_profile');
    console.log('Authenticated result:', { data: authenticatedResult, error: authenticatedError });
    
    if (authenticatedError) {
      console.log('✅ Expected error for unauthenticated user:', authenticatedError.message);
    } else {
      console.log('⚠️  Unexpected: RPC worked without proper authentication');
    }

    console.log('\n🎉 RPC function test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testRPC();
