-- ============================================
-- FIX INFINITE RECURSION - PROFILES POLICIES
-- ============================================

-- First, drop ALL existing policies on profiles table
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON profiles';
    END LOOP;
END $$;

-- Now create the simplified policies (no recursion)
CREATE POLICY "profiles_select_own" 
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
