# Supabase RLS Setup Guide

## 🎯 Objetivo
Implementar Row Level Security (RLS) para proteger dados no Supabase.

## ⚠️ CRÍTICO
**RLS é a última linha de defesa!** Sem ele, qualquer pessoa com a anon key pode acessar TODOS os dados.

---

## 📋 Checklist de Implementação

### 1. Executar Políticas RLS

#### Opção A: Via Dashboard (Recomendado)
1. Acesse o Supabase Dashboard
2. Vá em **Database** → **SQL Editor**
3. Clique em **New Query**
4. Cole TODO o conteúdo de `supabase/policies.sql`
5. Click **Run**
6. Aguarde confirmação de sucesso

#### Opção B: Via CLI
```bash
# Se tiver Supabase CLI instalado
supabase db push
```

---

### 2. Verificar RLS Ativo

Execute no SQL Editor:

```sql
-- Deve retornar 'true' para todas as tabelas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('registros', 'profiles', 'audit_logs');
```

**Resultado esperado:**
```
tablename    | rowsecurity
-------------|------------
registros    | t (true)
profiles     | t (true)
audit_logs   | t (true)
```

---

### 3. Verificar Políticas Criadas

```sql
-- Deve retornar 8+ políticas
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename;
```

**Resultado esperado:**
```
tablename    | policy_count
-------------|-------------
registros    | 4
profiles     | 3
audit_logs   | 1
```

---

### 4. Testar Segurança

Execute o teste automatizado:

```bash
npx tsx tests/security/supabase-security.test.ts
```

**Resultado esperado:**
```
✅ PASS: Unauthenticated users cannot access data
```

---

### 5. Testes Manuais

#### Teste A: Acesso não autenticado
1. Abra DevTools → Console
2. Cole:
```javascript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
)
const { data } = await supabase.from('registros').select('*')
console.log(data) // Deve retornar array vazio
```

#### Teste B: Acesso cross-user
1. Login como usuário A
2. Copie ID de outro usuário (B)
3. Console:
```javascript
const { data } = await supabase
  .from('registros')
  .select('*')
  .eq('user_id', 'USER_B_ID')
console.log(data) // Deve retornar array vazio
```

#### Teste C: Admin pode ver tudo
1. Login como admin
2. Console:
```javascript
const { data } = await supabase.from('registros').select('*')
console.log(data.length) // Deve retornar todos os registros
```

---

## 🚨 Troubleshooting

### Erro: "new row violates row-level security policy"
**Causa:** Política INSERT está bloqueando
**Fix:** Revisar `registros_insert_own` policy

### Erro: "permission denied for table"
**Causa:** RLS ativo mas sem políticas
**Fix:** Executar `supabase/policies.sql`

### Dados vazios mesmo autenticado
**Causa:** `user_id` não corresponde a `auth.uid()`
**Fix:** Verificar se registro tem `user_id` correto

### Admin não consegue ver dados de outros
**Causa:** Role não está setado como 'admin' na tabela profiles
**Fix:** 
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com';
```

---

## 📁 Arquivos Criados

1. **`supabase/policies.sql`** - Políticas RLS completas
2. **`lib/audit-log.ts`** - Sistema de auditoria
3. **`tests/security/supabase-security.test.ts`** - Testes de segurança
4. **Este guia** - Instruções de setup

---

## ✅ Validação Final

Execute todos os comandos abaixo e **TODOS** devem passar:

```bash
# 1. Test automatizado
npx tsx tests/security/supabase-security.test.ts

# 2. Verificar RLS no banco (via SQL Editor)
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'registros';
# Resultado: rowsecurity = t

# 3. Tentar acessar sem auth (deve falhar)
# Ver Teste A acima

# 4. Build da aplicação (não deve ter erros)
npm run build
```

---

## 🔐 Segurança Pós-Setup

### Boas Práticas
- ✅ **NUNCA** commitar `.env` com service role key
- ✅ Rotacionar service role key a cada 90 dias
- ✅ Revisar audit logs semanalmente (quando implementado)
- ✅ Monitorar políticas RLS regularmente

### Monitoramento
```sql
-- Ver últimas ações de admin (quando audit_logs estiver populado)
SELECT * FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 10;
```

---

## 📞 Suporte

**Erros no Setup?**
1. Verifique conexão com Supabase
2. Confirme que tem permissões de admin no projeto
3. Revise logs de erro no SQL Editor

**RLS não funciona?**
1. Confirme que RLS está ENABLED
2. Verifique se políticas foram aplicadas
3. Teste com `auth.uid()` no SQL Editor

---

## ⚡ Quick Start

**TL;DR - Setup em 2 minutos:**

```bash
# 1. Executar políticas
# Copiar supabase/policies.sql → SQL Editor → Run

# 2. Testar
npx tsx tests/security/supabase-security.test.ts

# 3. Deploy
git add .
git commit -m "feat: Implement RLS policies"
git push
```

**Done!** 🎉
