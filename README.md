# Tropa — Marketplace de Gado (Paraguai)

Marketplace web responsivo de compra e venda de gado no Paraguai.
_"Tropa" é só um nome de trabalho — dá pra trocar depois._

## Decisões travadas

| Item | Escolha |
|------|---------|
| Plataforma | Web responsivo (roda no celular sem instalar) |
| Stack | Next.js (App Router) + TypeScript + Tailwind + Supabase |
| Contato comprador↔vendedor | WhatsApp (`wa.me`) no MVP; chat interno depois |
| Idioma | Espanhol + Português |

## Estado atual

- [x] **Etapa 1 — Modelagem do banco** ✅
  - DDL: [`supabase/migrations/0001_schema_inicial.sql`](supabase/migrations/0001_schema_inicial.sql)
  - Seed (categorias/raças): [`supabase/seed.sql`](supabase/seed.sql)
  - Documentação: [`docs/modelagem-banco.md`](docs/modelagem-banco.md)
- [ ] Etapa 2 — Setup do projeto Next.js + Supabase
- [~] **Etapa 3 — Autenticação e perfil**
  - [x] Parte de banco: RLS + triggers de proteção — [`supabase/migrations/0002_rls_policies.sql`](supabase/migrations/0002_rls_policies.sql)
  - [ ] Parte de telas: páginas de cadastro/login, middleware (depende do scaffold da Etapa 2)
- [ ] Etapa 4 — CRUD de anúncios (upload de fotos)
- [ ] Etapa 5 — Listagem, busca e filtros
- [ ] Etapa 6 — Página do anúncio e contato via WhatsApp
- [ ] Etapa 7 — Anúncios pagos / banners
- [ ] Etapa 8 — Painel admin e moderação
- [ ] Etapa 9 — Deploy (Vercel + Supabase)

## Estrutura

```
marketplace-gado/
├── docs/
│   └── modelagem-banco.md          # diagrama + explicação das tabelas
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema_inicial.sql # DDL completo (13 tabelas + 9 enums)
│   │   └── 0002_rls_policies.sql   # segurança (RLS) + triggers de proteção
│   ├── seed.sql                    # categorias e raças fixas
│   └── demo_seed.sql               # dados fictícios p/ testar (6 anúncios etc.)
└── README.md

## Ordem para rodar no SQL Editor do Supabase

1. `supabase/migrations/0001_schema_inicial.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/0002_rls_policies.sql`
4. `supabase/demo_seed.sql`  _(opcional — só para ver dados de exemplo)_
```
