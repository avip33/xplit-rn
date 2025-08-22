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

async function testSupabase() {
  console.log('🧪 Testing Supabase connection...\n');

  try {
    // Test 1: Check if we can connect
    console.log('1. Testing connection...');
    const { data, error } = await supabase.from('profiles_public').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Connection successful\n');

    // Test 2: Check if functions exist
    console.log('2. Testing RPC functions...');
    
    // Test handle availability check
    const { data: available, error: availError } = await supabase.rpc('is_handle_available', { p_handle: 'test-handle' });
    if (availError) throw availError;
    console.log('✅ is_handle_available function working');
    
    // Test search function
    const { data: searchResults, error: searchError } = await supabase.rpc('search_profiles', { q: '', limit_count: 5 });
    if (searchError) throw searchError;
    console.log('✅ search_profiles function working');
    
    // Test user_has_profile function (should fail without auth, which is expected)
    const { data: hasProfile, error: hasProfileError } = await supabase.rpc('user_has_profile');
    if (hasProfileError && hasProfileError.message === 'Not authenticated') {
      console.log('✅ user_has_profile function working (properly requires authentication)');
    } else if (hasProfileError) {
      throw hasProfileError;
    } else {
      console.log('⚠️  user_has_profile function worked without authentication (unexpected)');
    }
    console.log('\n');

    // Test 3: Check storage bucket
    console.log('3. Testing storage...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;
    
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    if (avatarsBucket) {
      console.log('✅ Avatars bucket exists');
    } else {
      console.log('⚠️  Avatars bucket not found - this is normal if not created yet');
    }

    console.log('\n🎉 All tests passed! Supabase setup is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSupabase();
