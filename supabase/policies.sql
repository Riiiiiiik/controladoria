-- ============================================
-- SUPABASE RLS POLICIES - CONTROLADORIA SYSTEM
-- ============================================
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- Database → SQL Editor → New Query → Cole este código

-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. REGISTROS TABLE POLICIES
-- ============================================

-- SELECT: Users can view own registros OR admins can view all
CREATE POLICY "registros_select_own_or_admin" 
ON registros FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- INSERT: Users can only insert their own registros
CREATE POLICY "registros_insert_own" 
ON registros FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update own registros OR admins can update all
CREATE POLICY "registros_update_own_or_admin" 
ON registros FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- DELETE: Users can delete own registros OR admins can delete all
CREATE POLICY "registros_delete_own_or_admin" 
ON registros FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 3. PROFILES TABLE POLICIES (FIXED - No Recursion)
-- ============================================

-- SELECT: Users can view own profile (admins handled in app code)
CREATE POLICY "profiles_select_own" 
ON profiles FOR SELECT
USING (auth.uid() = id);

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT: Block by default (created via triggers/admin only)
-- DELETE: Block by default (admin only via application)

-- ============================================
-- 4. AUDIT LOGS TABLE (OPTIONAL)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_logs_admin_only" 
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Service role key can insert audit logs (for logging from server)
-- No policy needed - service role bypasses RLS

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Run these to verify policies are active:

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('registros', 'profiles', 'audit_logs');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename;

-- ============================================
-- 6. TEST QUERIES (Run as authenticated user)
-- ============================================

-- These should work for authenticated users:
-- SELECT * FROM registros WHERE user_id = auth.uid();
-- INSERT INTO registros (user_id, ...) VALUES (auth.uid(), ...);
-- UPDATE registros SET ... WHERE id = 'xxx' AND user_id = auth.uid();

-- These should FAIL for non-admins:
-- SELECT * FROM registros WHERE user_id != auth.uid();
-- DELETE FROM registros WHERE id = 'xxx';

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- To disable RLS (NOT RECOMMENDED):
-- ALTER TABLE registros DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- To drop all policies:
-- DROP POLICY IF EXISTS "registros_select_own_or_admin" ON registros;
-- DROP POLICY IF EXISTS "registros_insert_own" ON registros;
-- DROP POLICY IF EXISTS "registros_update_own_or_admin" ON registros;
-- DROP POLICY IF EXISTS "registros_delete_admin_only" ON registros;
-- DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
-- DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
-- DROP POLICY IF EXISTS "profiles_insert_admin_only" ON profiles;
-- DROP POLICY IF EXISTS "audit_logs_admin_only" ON audit_logs;
