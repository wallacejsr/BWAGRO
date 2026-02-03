# 👥 Modelo Híbrido de Perfis - BWAGRO

## 📖 Visão Geral

O BWAGRO implementa um **modelo híbrido e dinâmico** de perfis de usuário, eliminando a necessidade de definir previamente se o usuário é "comprador" ou "vendedor". 

### Conceitos-Chave

- **Habilitação por Ação**: Funcionalidades aparecem conforme o usuário as utiliza
- **Status Dinâmico**: `is_seller` é calculado em tempo real, não armazenado
- **Simplicidade no Cadastro**: Todos entram como `USER`, sem complicações
- **Separação de Privilégios**: `is_admin` é flag booleana isolada para gestores da plataforma

---

## 🏗️ Arquitetura

### Antes (Modelo Rígido)

```
┌─────────────────────────────────────────┐
│ Cadastro                                │
│                                         │
│ ❌ "Você quer ser Comprador ou          │
│     Vendedor?"                          │
│                                         │
│ → Usuário confuso                       │
│ → Decisão prematura                     │
│ → Roles fixos no banco                  │
└─────────────────────────────────────────┘
```

### Depois (Modelo Híbrido)

```
┌─────────────────────────────────────────┐
│ Cadastro Simples                        │
│                                         │
│ ✅ Nome, E-mail, Senha                   │
│ → role = 'USER'                         │
│ → is_seller = FALSE (calculado)         │
│                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                         │
│ Usuário publica primeiro anúncio        │
│ → first_ad_at preenchido (trigger)      │
│ → is_seller = TRUE (automático)         │
│ → Menu "Vendedor" aparece               │
│ → Widgets de performance ativados       │
└─────────────────────────────────────────┘
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  -- PERFIL SIMPLIFICADO
  role TEXT DEFAULT 'USER',           -- Sem distinção rígida
  is_admin BOOLEAN DEFAULT FALSE,     -- Separação clara para admins
  
  -- TRACKING DE JORNADA
  first_ad_at TIMESTAMPTZ,            -- Marca virada para vendedor
  
  -- OUTROS
  credits INTEGER DEFAULT 0,
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### VIEW `vw_user_status`

**Calcula `is_seller` em tempo real:**

```sql
CREATE VIEW vw_user_status AS
SELECT 
  u.*,
  EXISTS (
    SELECT 1 FROM ads 
    WHERE ads.user_id = u.id 
    AND ads.status != 'DELETED'
  ) AS is_seller,
  (
    SELECT COUNT(*) FROM ads 
    WHERE ads.user_id = u.id 
    AND ads.status = 'ACTIVE'
  ) AS active_ads_count
FROM users u;
```

**Uso:**

```sql
SELECT * FROM vw_user_status WHERE id = 'user-uuid';

-- Retorna:
{
  "id": "...",
  "email": "joao@example.com",
  "name": "João Silva",
  "role": "USER",
  "is_admin": false,
  "first_ad_at": "2026-01-15T10:30:00Z",
  "is_seller": true,           -- ← Calculado dinamicamente
  "active_ads_count": 5
}
```

---

## ⚙️ Função `get_user_stats()`

**Retorna estatísticas + flag `is_seller`:**

```sql
SELECT get_user_stats('user-uuid');
```

**Retorno JSON:**

```json
{
  "total_ads": 12,
  "active_ads": 8,
  "total_views": 3450,
  "unread_messages": 5,
  "favorites_count": 23,
  "opportunities_count": 3,
  "is_seller": true,          // ← Baseado em total_ads > 0
  "first_ad_at": "2026-01-15T10:30:00.000Z"
}
```

---

## 🔄 Fluxo de "Habilitação por Ação"

### 1️⃣ Novo Usuário Se Cadastra

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'novo@example.com',
  password: 'senha-segura',
  options: {
    data: {
      name: 'Novo Usuário'
    }
  }
})

// Estado inicial:
// role = 'USER'
// is_admin = FALSE
// first_ad_at = NULL
// is_seller = FALSE (nenhum anúncio cadastrado)
```

### 2️⃣ Usuário Publica Primeiro Anúncio

```typescript
const { data: ad } = await supabase
  .from('ads')
  .insert({
    title: 'Trator John Deere',
    description: '...',
    price: 120000,
    user_id: userId,
    // ... outros campos
  })

// ✅ Trigger set_first_ad_timestamp() executa automaticamente:
//    UPDATE users SET first_ad_at = NOW() WHERE id = userId
```

### 3️⃣ Frontend Detecta Mudança

```typescript
// Atualizar stats após criar anúncio
await refreshStats()

// Agora:
// is_seller = TRUE (EXISTS anúncio não deletado)
// first_ad_at = "2026-02-03T14:30:00Z"

// Menu lateral expande automaticamente:
// - Meus Anúncios
// - Leads
// - Financeiro Vendedor
// - Performance
```

---

## 🔐 Segurança (RLS)

### Qualquer Usuário Pode Criar Anúncios

```sql
CREATE POLICY "Qualquer usuário autenticado pode criar anúncios" ON ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Proteção Contra Auto-Promoção a Admin

```sql
CREATE POLICY "Usuários podem atualizar próprio perfil" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND is_admin = FALSE  -- ← Bloqueia tentativa de is_admin = TRUE
  );
```

### Acesso Total para Admins

```sql
CREATE POLICY "Admins têm acesso total" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );
```

---

## 💻 Integração no Frontend

### Context API

```typescript
const { user, stats, isSeller, isAdmin } = useUser()

// Renderização condicional:
{isSeller && (
  <div>
    <h2>Área do Vendedor</h2>
    <p>Total de anúncios: {stats.total_ads}</p>
    <p>Vendedor desde: {new Date(stats.first_ad_at).toLocaleDateString()}</p>
  </div>
)}
```

### Sidebar Dinâmica

```typescript
const menuItems = [
  { label: 'Início', path: '/' },
  { label: 'Favoritos', path: '/favoritos' },
  
  // Só aparece se is_seller = TRUE
  ...(isSeller ? [
    { label: 'Meus Anúncios', path: '/meus-anuncios' },
    { label: 'Leads', path: '/leads' },
  ] : []),
  
  // Só aparece se is_admin = TRUE
  ...(isAdmin ? [
    { label: 'Admin Dashboard', path: '/admin' }
  ] : [])
]
```

### Proteção de Rotas

```typescript
const SellerRoute = ({ children }) => {
  const { isSeller, isLoading } = useUser()
  
  if (isLoading) return <Loading />
  
  if (!isSeller) {
    return (
      <div>
        <p>Você ainda não possui anúncios.</p>
        <CreateAdButton />
      </div>
    )
  }
  
  return children
}

// Uso:
<Route path="/leads" element={
  <SellerRoute>
    <LeadsPage />
  </SellerRoute>
} />
```

---

## 📊 Vantagens do Modelo Híbrido

| Aspecto | Modelo Rígido (Antes) | Modelo Híbrido (Depois) |
|---------|----------------------|-------------------------|
| **Cadastro** | Pergunta "Comprador ou Vendedor?" | Simples: Nome, E-mail, Senha |
| **Complexidade** | Usuário confuso com escolha | Sem fricção |
| **Flexibilidade** | Role fixo no banco | Status calculado dinamicamente |
| **Performance** | Queries lentas com múltiplos JOINs | VIEW otimizada |
| **Manutenção** | Migrar roles é complexo | Adicionar funcionalidade = criar VIEW |
| **UX** | Menu estático | Menu adaptativo ao uso |

---

## 🧪 Testes

### Teste 1: Novo Usuário (Sem Anúncios)

```sql
-- Buscar status
SELECT * FROM vw_user_status WHERE email = 'novo@example.com';

-- Resultado esperado:
{
  "is_seller": false,
  "active_ads_count": 0,
  "first_ad_at": null
}
```

### Teste 2: Criar Primeiro Anúncio

```sql
-- Inserir anúncio
INSERT INTO ads (title, user_id, ...) VALUES (...);

-- Verificar trigger
SELECT first_ad_at FROM users WHERE email = 'novo@example.com';
-- Deve retornar timestamp atual

-- Verificar is_seller
SELECT is_seller FROM vw_user_status WHERE email = 'novo@example.com';
-- Deve retornar TRUE
```

### Teste 3: Deletar Todos os Anúncios

```sql
-- Deletar anúncios
UPDATE ads SET status = 'DELETED' WHERE user_id = 'user-uuid';

-- Verificar is_seller
SELECT is_seller FROM vw_user_status WHERE id = 'user-uuid';
-- Deve retornar FALSE (nenhum anúncio ativo)

-- first_ad_at permanece preenchido (histórico)
SELECT first_ad_at FROM users WHERE id = 'user-uuid';
-- Ainda retorna a data original
```

---

## 🔄 Migração de Schema Antigo

Se você já possui um banco com modelo antigo de roles:

### Opção 1: SQL Script

Execute [migration_hybrid_profiles.sql](migration_hybrid_profiles.sql):

```bash
psql -h seu-host -U postgres -d bwagro -f migration_hybrid_profiles.sql
```

### Opção 2: Supabase SQL Editor

1. Copie conteúdo de `migration_hybrid_profiles.sql`
2. Cole no SQL Editor
3. Execute (Ctrl + Enter)
4. Verifique logs de validação

### Pós-Migração

```sql
-- Validar migração
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_sellers FROM vw_user_status WHERE is_seller = TRUE;
SELECT COUNT(*) AS users_with_first_ad FROM users WHERE first_ad_at IS NOT NULL;

-- Testar função
SELECT get_user_stats((SELECT id FROM users LIMIT 1));
```

---

## 📚 Recursos Relacionados

- [schema.sql](../schema.sql) - Schema completo
- [migration_hybrid_profiles.sql](../migration_hybrid_profiles.sql) - Script de migração
- [hybrid-profiles-integration.tsx](../examples/hybrid-profiles-integration.tsx) - Exemplo React
- [SUPABASE_SETUP.md](../SUPABASE_SETUP.md) - Guia de configuração

---

## 💡 Perguntas Frequentes

### 1. E se o usuário deletar todos os anúncios?

**R:** `is_seller` volta para `FALSE`, mas `first_ad_at` permanece preenchido (histórico). Se criar novos anúncios, `is_seller` volta para `TRUE` automaticamente.

### 2. Como promover usuário a admin?

**R:** Via SQL diretamente ou painel admin:

```sql
UPDATE users SET is_admin = TRUE WHERE email = 'usuario@example.com';
```

### 3. Posso ter roles customizados além de USER?

**R:** Sim, a coluna `role` aceita qualquer valor. Exemplo:

```sql
UPDATE users SET role = 'VIP' WHERE id = 'user-uuid';
```

### 4. A VIEW vw_user_status afeta performance?

**R:** Não. Views são queries otimizadas pelo PostgreSQL. Para grandes volumes, considere cache no frontend (React Query, SWR).

### 5. Como implementar "Vendedor Verificado"?

**R:** Adicione coluna `is_verified_seller` e preencha manualmente ou via critérios:

```sql
ALTER TABLE users ADD COLUMN is_verified_seller BOOLEAN DEFAULT FALSE;

-- Verificar automaticamente vendedores com >10 anúncios e rating >4.5
UPDATE users SET is_verified_seller = TRUE
WHERE id IN (
  SELECT user_id FROM ads 
  WHERE status = 'ACTIVE' 
  GROUP BY user_id 
  HAVING COUNT(*) > 10
);
```

---

**Desenvolvido para BWAGRO** 🌾  
_Modelo Híbrido de Perfis - Flexibilidade e Simplicidade_
