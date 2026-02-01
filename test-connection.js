const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Checking Supabase Configuration:\n');
console.log('URL:', url);
console.log('URL length:', url?.length);
console.log('Key starts with eyJ?', key?.startsWith('eyJ') ? '✅' : '❌');
console.log('Key length:', key?.length);

console.log('\n🧪 Testing actual connection...\n');

const supabase = createClient(url, key);

async function test() {
    try {
        // Test 1: Check if we can reach Supabase
        console.log('Test 1: Checking auth endpoint...');
        const { data: session, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('❌ Session check failed:', sessionError.message);
        } else {
            console.log('✅ Session check passed');
        }

        // Test 2: Try to sign up a test user
        console.log('\nTest 2: Testing signup...');
        const testEmail = `test${Date.now()}@example.com`;
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: 'testpassword123',
        });

        if (signupError) {
            console.log('❌ Signup failed:', signupError.message);
            console.log('   Error code:', signupError.code);
            console.log('   Status:', signupError.status);

            if (signupError.message.includes('Failed to fetch')) {
                console.log('\n🔴 "Failed to fetch" means:');
                console.log('   1. The Supabase URL is wrong, OR');
                console.log('   2. The Supabase project doesn\'t exist, OR');
                console.log('   3. Network/CORS issue');
                console.log('\n   Check your Supabase project URL at:');
                console.log('   https://supabase.com/dashboard');
            }
        } else {
            console.log('✅ Signup successful!');
            console.log('   User ID:', signupData.user?.id);
        }

    } catch (err) {
        console.log('\n❌ Unexpected error:', err.message);
    }
}

test();
