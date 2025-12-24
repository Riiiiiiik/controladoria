import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Security Tests
 * Run these tests to verify RLS policies are working correctly
 */

// Test credentials (use test account)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function runSecurityTests() {
    console.log('🔒 Starting Supabase Security Tests...\n')

    let passedTests = 0
    let failedTests = 0

    // Test 1: Unauthenticated access should be blocked
    console.log('Test 1: Unauthenticated data access')
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        const { data, error } = await supabase.from('registros').select('*')

        if (error || !data || data.length === 0) {
            console.log('✅ PASS: Unauthenticated users cannot access data')
            passedTests++
        } else {
            console.log('❌ FAIL: Unauthenticated users can access data! RLS NOT CONFIGURED!')
            console.log('   Found', data.length, 'records')
            failedTests++
        }
    } catch (err) {
        console.log('✅ PASS: Request blocked')
        passedTests++
    }
    console.log('')

    // Test 2: Check if RLS is enabled
    console.log('Test 2: RLS enabled check')
    console.log('⚠️  MANUAL: Go to Supabase Dashboard → Database → Tables')
    console.log('   Check if RLS toggle is ON for: registros, profiles')
    console.log('')

    // Test 3: Cross-user data access (requires login)
    console.log('Test 3: Cross-user data access')
    console.log('⚠️  MANUAL TEST REQUIRED:')
    console.log('   1. Login as User A')
    console.log('   2. Get another user ID (User B)')
    console.log('   3. Try: supabase.from("registros").select("*").eq("user_id", USER_B_ID)')
    console.log('   4. Should return empty array')
    console.log('')

    // Test 4: Cookie security flags
    console.log('Test 4: Cookie security')
    console.log('⚠️  MANUAL: Open DevTools → Application → Cookies')
    console.log('   Verify Supabase cookies have:')
    console.log('   - Secure: true')
    console.log('   - HttpOnly: true (for refresh token)')
    console.log('   - SameSite: Lax or Strict')
    console.log('')

    // Test 5: Service role key not exposed
    console.log('Test 5: Service role key exposure')
    console.log('⚠️  MANUAL: Check browser DevTools → Sources')
    console.log('   Search for "SERVICE_ROLE_KEY"')
    console.log('   Should NOT be found in any client bundle')
    console.log('')

    // Summary
    console.log('═══════════════════════════════════')
    console.log('Test Summary:')
    console.log(`✅ Passed: ${passedTests}`)
    console.log(`❌ Failed: ${failedTests}`)
    console.log(`⚠️  Manual: 4`)
    console.log('═══════════════════════════════════')

    if (failedTests > 0) {
        console.log('\n🚨 CRITICAL: Some security tests failed!')
        console.log('   Action required: Implement RLS policies immediately')
        console.log('   File: supabase/policies.sql')
    } else {
        console.log('\n✅ All automated tests passed!')
        console.log('   Complete manual tests to verify full security')
    }
}

// Run tests
runSecurityTests().catch(console.error)
