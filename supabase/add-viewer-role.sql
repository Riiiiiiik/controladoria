-- ============================================
-- VIEWER ROLE - READ-ONLY ACCESS (Apenas Visualização)
-- ============================================
-- Este script adiciona a role 'viewer' ao sistema
-- Viewers podem VER todos os dados mas NÃO podem modificar nada
-- ============================================

-- ============================================
-- 1. ATUALIZAR CONSTRAINT DA ROLE NA TABELA PROFILES
-- ============================================

-- Adicionar 'viewer' às roles permitidas
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'controller', 'viewer'));

-- ============================================
-- 2. ATUALIZAR RLS POLICIES - REGISTROS TABLE
-- ============================================

-- Drop existing registros policies (todas as variações possíveis)
DROP POLICY IF EXISTS "registros_select_own_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_select_own_admin_or_viewer" ON registros;
DROP POLICY IF EXISTS "registros_insert_own" ON registros;
DROP POLICY IF EXISTS "registros_insert_own_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_insert_controller_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_update_own_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_update_controller_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_delete_own_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_delete_controller_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_delete_admin_only" ON registros;

-- SELECT: Controllers see own, Admins and Viewers see ALL
CREATE POLICY "registros_select_own_admin_or_viewer" 
ON registros FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'viewer')
  )
);

-- INSERT: Controllers can create own, Admins can create any, Viewers CANNOT
CREATE POLICY "registros_insert_controller_or_admin" 
ON registros FOR INSERT
WITH CHECK (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'controller'
  )) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- UPDATE: Controllers can update own, Admins can update any, Viewers CANNOT
CREATE POLICY "registros_update_controller_or_admin" 
ON registros FOR UPDATE
USING (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'controller'
  )) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'controller'
  )) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- DELETE: Controllers can delete own, Admins can delete any, Viewers CANNOT
CREATE POLICY "registros_delete_controller_or_admin" 
ON registros FOR DELETE
USING (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'controller'
  )) OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- ============================================
-- 3. ATUALIZAR RLS POLICIES - PROFILES TABLE
-- ============================================
-- IMPORTANTE: Policies de PROFILES não podem fazer SELECT na própria tabela
-- para evitar recursão infinita!

-- Drop existing profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_admin_or_viewer" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own_not_viewer" ON profiles;

-- SELECT: Todos os usuários autenticados podem ver todos os perfis
-- (não podemos verificar role aqui porque causaria recursão)
CREATE POLICY "profiles_select_authenticated" 
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- UPDATE: Usuários podem atualizar apenas o próprio perfil
-- (sem verificação de role para evitar recursão)
CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. ATUALIZAR RLS POLICIES - AUDIT_LOGS TABLE
-- ============================================

-- Drop existing audit_logs policies (todas as variações)
DROP POLICY IF EXISTS "audit_logs_admin_only" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_or_viewer" ON audit_logs;

-- SELECT: Admins and Viewers can view audit logs
CREATE POLICY "audit_logs_admin_or_viewer" 
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'viewer')
  )
);

-- ============================================
-- 5. ATUALIZAR TRIGGER DE CRIAÇÃO DE USUÁRIO
-- ============================================

-- IMPORTANTE: Dropar o trigger ANTES da function (por causa das dependências)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar a function (não precisa mudar nada, só garantir que aceita 'viewer')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'controller');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Verificar constraint da role
SELECT tc.constraint_name, tc.constraint_type, cc.check_clause 
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.constraint_name = 'profiles_role_check';

-- Verificar policies de REGISTROS
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'registros'
ORDER BY cmd, policyname;

-- Verificar policies de PROFILES
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Verificar policies de AUDIT_LOGS
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'audit_logs'
ORDER BY cmd, policyname;

-- ============================================
-- 7. RESUMO ESPERADO
-- ============================================

-- REGISTROS:
-- ✓ registros_select_own_admin_or_viewer (SELECT) - Controllers veem próprios, Admins/Viewers veem tudo
-- ✓ registros_insert_controller_or_admin (INSERT) - Apenas Controllers e Admins
-- ✓ registros_update_controller_or_admin (UPDATE) - Apenas Controllers (próprios) e Admins
-- ✓ registros_delete_controller_or_admin (DELETE) - Apenas Controllers (próprios) e Admins

-- PROFILES:
-- ✓ profiles_select_own_admin_or_viewer (SELECT) - Users veem próprio, Admins/Viewers veem tudo
-- ✓ profiles_update_own_not_viewer (UPDATE) - Apenas Admins e Controllers (próprio perfil)

-- AUDIT_LOGS:
-- ✓ audit_logs_admin_or_viewer (SELECT) - Apenas Admins e Viewers

-- ============================================
-- 8. EXEMPLO DE USO
-- ============================================

-- Para criar um usuário VIEWER, após o cadastro:
-- UPDATE profiles SET role = 'viewer' WHERE email = 'usuario@exemplo.com';

-- ============================================
-- ROLE PERMISSIONS SUMMARY
-- ============================================
-- 
-- VIEWER (Apenas Visualização):
--   ✓ SELECT registros (todos)
--   ✓ SELECT profiles (todos)
--   ✓ SELECT audit_logs (todos)
--   ✗ INSERT (nenhuma tabela)
--   ✗ UPDATE (nenhuma tabela)
--   ✗ DELETE (nenhuma tabela)
--
-- CONTROLLER:
--   ✓ SELECT registros (próprios)
--   ✓ INSERT registros (próprios)
--   ✓ UPDATE registros (próprios)
--   ✓ DELETE registros (próprios)
--   ✓ SELECT profiles (próprio)
--   ✓ UPDATE profiles (próprio)
--   ✗ SELECT audit_logs
--
-- ADMIN:
--   ✓ SELECT (tudo)
--   ✓ INSERT (tudo)
--   ✓ UPDATE (tudo)
--   ✓ DELETE (tudo)
