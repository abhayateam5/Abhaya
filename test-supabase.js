const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('='.repeat(60));
console.log('SUPABASE CONNECTION TEST');
console.log('='.repeat(60));
console.log('\n📋 Configuration Check:\n');
console.log('URL:', supabaseUrl);
console.log('Key (first 30 chars):', supabaseAnonKey?.substring(0, 30) + '...');
console.log('\n🔍 Validation:\n');
console.log('✓ URL exists?', supabaseUrl ? '✅ YES' : '❌ NO');
console.log('✓ Key exists?', supabaseAnonKey ? '✅ YES' : '❌ NO');
console.log('✓ Key starts with "eyJ"?', supabaseAnonKey?.startsWith('eyJ') ? '✅ YES (CORRECT)' : '❌ NO (WRONG FORMAT)');
console.log('✓ Key length:', supabaseAnonKey?.length || 0, 'chars', supabaseAnonKey?.length > 200 ? '✅ GOOD' : '❌ TOO SHORT');

console.log('\n' + '='.repeat(60));

if (!supabaseAnonKey?.startsWith('eyJ')) {
    console.log('\n❌ PROBLEM FOUND: Your anon key has the wrong format!\n');
    console.log('Current key starts with:', supabaseAnonKey?.substring(0, 20));
    console.log('Should start with: eyJ\n');
    console.log('📝 TO FIX:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Open your ABHAYA project');
    console.log('3. Go to Settings → API');
    console.log('4. Copy the "anon public" key (the long one)');
    console.log('5. Update line 5 in your .env file');
    console.log('6. Restart your dev server\n');
    console.log('='.repeat(60));
    process.exit(1);
}

console.log('\n✅ Key format looks correct! Testing connection...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log('❌ Connection FAILED:', error.message);
            console.log('\nThis usually means the key is invalid.');
        } else {
            console.log('✅ Connection SUCCESSFUL!');
            console.log('✅ Your Supabase is configured correctly!');
            console.log('\n📌 The redirect should work now.');
            console.log('   Test: Open http://localhost:3000/ in incognito');
        }
    } catch (err) {
        console.log('❌ Error:', err.message);
    }
    console.log('\n' + '='.repeat(60));
}

testConnection();
