# Role "Viewer" - Apenas Visualização 👁️

## O que é?

A role **"viewer"** é um tipo de usuário que pode **apenas visualizar** todos os dados do sistema, mas **não pode modificar nada**. É como um espectador - pode ver tudo, mas não pode tocar.

---

## 📋 Permissões da Role Viewer

### ✅ O que um VIEWER PODE fazer:
- **Ver todos os registros** (de todos os usuários)
- **Ver todos os perfis** (de todos os usuários)  
- **Ver todos os logs de auditoria**
- Navegar pela interface normalmente
- Exportar/visualizar relatórios

### ❌ O que um VIEWER NÃO PODE fazer:
- ❌ Criar novos registros
- ❌ Editar registros existentes
- ❌ Deletar registros
- ❌ Modificar perfis (nem o próprio)
- ❌ Criar/editar/deletar usuários

---

## 🚀 Como Aplicar no Supabase

### 1. Execute o Script SQL

No **Supabase Dashboard**:
1. Acesse: **Database** → **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo [`add-viewer-role.sql`](file:///c:/Users/Rik/.gemini/antigravity/scratch/sales-contact-system/supabase/add-viewer-role.sql)
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **RUN** (ou `Ctrl+Enter`)

### 2. Verificação

Após executar, você verá os resultados das queries de verificação mostrando:
- ✓ Constraint atualizada para aceitar `'viewer'`
- ✓ Policies criadas para todas as tabelas
- ✓ Resumo das permissões

---

## 👤 Como Criar um Usuário Viewer

### Opção 1: Via SQL (Supabase Dashboard)

```sql
-- Atualizar um usuário existente para viewer
UPDATE profiles 
SET role = 'viewer' 
WHERE email = 'usuario@exemplo.com';
```

### Opção 2: Via Interface Admin (Recomendado)

Se você tiver uma interface de administração no seu app:
1. Login como Admin
2. Vá para "Gerenciar Usuários"
3. Selecione o usuário
4. Altere a role para **"viewer"**

---

## 🔐 Comparação de Roles

| Permissão | Admin | Controller | Viewer |
|-----------|-------|------------|--------|
| Ver próprios registros | ✅ | ✅ | ✅ |
| Ver TODOS os registros | ✅ | ❌ | ✅ |
| Criar registros | ✅ | ✅ | ❌ |
| Editar próprios registros | ✅ | ✅ | ❌ |
| Editar TODOS os registros | ✅ | ❌ | ❌ |
| Deletar registros | ✅ | ✅ (próprios) | ❌ |
| Ver todos os perfis | ✅ | ❌ | ✅ |
| Ver logs de auditoria | ✅ | ❌ | ✅ |
| Gerenciar usuários | ✅ | ❌ | ❌ |

---

## 🧪 Como Testar

### 1. Criar um usuário de teste

```sql
-- No SQL Editor do Supabase
UPDATE profiles 
SET role = 'viewer' 
WHERE email = 'teste@viewer.com';
```

### 2. Fazer login com esse usuário

1. Logout do sistema
2. Login com `teste@viewer.com`
3. Tente:
   - ✅ Ver registros (deve funcionar)
   - ❌ Criar um registro (deve ser bloqueado)
   - ❌ Editar um registro (deve ser bloqueado)
   - ❌ Deletar um registro (deve ser bloqueado)

### 3. Verificar no console do navegador

Se houver erros de permissão, você verá mensagens como:
```
Error: new row violates row-level security policy
```

Isso é **esperado** - significa que as RLS policies estão funcionando!

---

## 🎯 Casos de Uso

A role "viewer" é ideal para:

- 📊 **Gerentes** que precisam ver relatórios mas não operar o sistema
- 👀 **Auditores** que precisam revisar dados
- 📈 **Analistas** que apenas consultam informações
- 🔍 **Supervisores** que monitoram sem editar
- 📱 **Clientes/Parceiros** com acesso limitado aos dados

---

## ⚠️ Notas Importantes

1. **Novos usuários ainda são criados como "controller"** por padrão
   - Você precisa mudar manualmente para "viewer" se necessário

2. **Viewers podem ver dados sensíveis**
   - Se quiser restringir alguns campos, adicione lógica extra nas policies

3. **Interface do frontend**
   - Você ainda precisa esconder botões de ação (Criar/Editar/Deletar) para viewers na UI
   - As policies do backend já bloqueiam as ações, mas a UX fica melhor escondendo os botões

---

## 🛠️ Próximos Passos (Opcional)

### Atualizar a Interface do Frontend

No seu componente React/Next.js, você pode verificar a role do usuário:

```typescript
// Exemplo de como esconder botões para viewers
const { data: profile } = useProfile(); // seu hook de perfil

const isViewer = profile?.role === 'viewer';

return (
  <div>
    {/* Todos veem */}
    <DataTable data={registros} />
    
    {/* Apenas não-viewers veem */}
    {!isViewer && (
      <>
        <Button onClick={handleCreate}>Novo Registro</Button>
        <Button onClick={handleEdit}>Editar</Button>
        <Button onClick={handleDelete}>Deletar</Button>
      </>
    )}
    
    {/* Mensagem para viewers */}
    {isViewer && (
      <Alert>Você está no modo visualização (read-only)</Alert>
    )}
  </div>
);
```

---

## 📞 Suporte

Se você encontrar problemas:

1. Verifique se o script SQL foi executado com sucesso
2. Verifique se a tabela `profiles` tem a constraint atualizada
3. Execute as queries de verificação no final do script
4. Veja os logs do Supabase para erros de RLS

---

**Script criado em:** 2025-12-24  
**Versão:** 1.0  
**Compatível com:** Supabase PostgreSQL
