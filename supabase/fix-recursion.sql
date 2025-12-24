-- ============================================
-- SUPABASE RLS POLICIES - FIX INFINITE RECURSION
-- ============================================
-- Execute APENAS esta parte no SQL Editor do Supabase

-- ============================================
-- 1. DROP EXISTING PROFILES POLICIES (com recursão)
-- ============================================

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_admin_only" ON profiles;

-- ============================================
-- 2. CREATE NEW PROFILES POLICIES (sem recursão)
-- ============================================

-- SELECT: Users can ALWAYS view their own profile
-- Admins can view all (but we check this in the application layer, not in RLS)
CREATE POLICY "profiles_select_own" 
ON profiles FOR SELECT
USING (auth.uid() = id);

-- INSERT: Allow service role only (profiles are created via triggers/admin)
-- No RLS check needed - will be blocked by default

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Should show:
-- profiles_select_own
-- profiles_update_own

-- ============================================
-- EXPLANATION
-- ============================================
-- The infinite recursion happened because:
-- 1. registros policy checked: "is user admin?" via profiles table
-- 2. profiles policy ALSO checked: "is user admin?" via profiles table
-- 3. This created a loop: profiles → profiles → profiles...
--
-- Solution:
-- - profiles policies now ONLY check auth.uid() = id (no admin check)
-- - Admin access to all profiles is handled in APPLICATION CODE
-- - This breaks the recursion while maintaining security
