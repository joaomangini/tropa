# Etapa 1 — Modelagem do banco

Marketplace de compra e venda de gado no Paraguai (nome de trabalho: **Tropa**).
Banco: **PostgreSQL / Supabase**. DDL rodável em [`supabase/migrations/0001_schema_inicial.sql`](../supabase/migrations/0001_schema_inicial.sql).

---

## Diagrama textual das relações

```
auth.users (Supabase)
     │ 1:1
     ▼
  profiles ───────────────┐
     │ 1:N                │ 1:N (favoritos, mensagens, denuncias)
     ▼                    │
  farms                   │
     │ 1:N                │
     ▼                    ▼
  listings ◄──────── favorites ──► profiles
     │  │  │  │
     │  │  │  └──► categories   (N:1)
     │  │  └─────► breeds       (N:1, opcional)
     │  │
     │  ├──► listing_photos   (1:N, ate 8)
     │  ├──► contact_events   (1:N)  ← clique no WhatsApp
     │  ├──► reports          (1:N)  ← denuncias
     │  └──► messages         (1:N)  ← chat interno (futuro)
     │
  advertisers
     │ 1:N
     ▼
  banner_campaigns
     │ 1:N
     ▼
  banner_events   ← impressoes e cliques
```

Leitura rápida das cardinalidades:

- **1 perfil → N fazendas → N anúncios.** Um anúncio pertence a um vendedor (`seller_id`) e opcionalmente a uma fazenda (`farm_id`).
- **Anúncio N:1 categoria** e **N:1 raça** (raça pode ser nula = mestiço/não informado).
- **Favoritos** e **mensagens** são as pontes N:N entre perfis e anúncios.
- **Anunciantes → campanhas → eventos** é a trilha de monetização, totalmente separada do núcleo de anúncios.

---

## Explicação de cada tabela

| # | Tabela | Para que serve | Pontos-chave |
|---|--------|----------------|--------------|
| 2 | `profiles` | Dados do usuário, ligados 1:1 ao `auth.users` do Supabase. | `user_type` (comprador/vendedor/ambos), `is_admin`, `is_banned` para moderação. |
| 3 | `categories` | Tipos de animal (boi, vaca, novilha, bezerro, touro, matriz). | Tabela de lookup com nome em ES e PT — populada pelo `seed.sql`. |
| 4 | `breeds` | Raças (Nelore, Brangus, Braford, Angus, Brahman, mestiço). | Lookup, para facilitar adicionar raças sem alterar schema. |
| 5 | `farms` | Fazendas / localização do vendedor. | Coordenadas com `check` de faixa válida; um vendedor pode ter várias. |
| 6 | `listings` | **Anúncio de lote de gado** — coração do sistema. | Preço + `price_type` (por cabeça/kg/arroba) + `currency` (PYG/BRL/USD); `status` e `moderation` separados; `expires_at` para expiração. |
| 7 | `listing_photos` | Até 8 fotos por anúncio (Supabase Storage). | `sort_order` define a ordem da galeria; `on delete cascade`. |
| 8 | `favorites` | Anúncios salvos pelo usuário. | Chave primária composta `(user_id, listing_id)` evita duplicado. |
| 9 | `messages` | Chat interno comprador↔vendedor (fase futura). | No MVP o contato é via WhatsApp; a tabela já fica pronta. |
| 10 | `contact_events` | Métrica: cada clique em "Falar com o vendedor". | `user_id` nulo = visitante anônimo. Base do dashboard admin. |
| 11 | `reports` | Denúncias de anúncio. | `status` (pendente/revisado/removido) para a moderação. |
| 12 | `advertisers` | Empresas do agronegócio que compram banner. | — |
| 13 | `banner_campaigns` | Campanhas com período e posição na tela. | `position`: topo da home, dentro do feed, lateral da busca, rodapé do detalhe. |
| 14 | `banner_events` | Impressões e cliques de cada campanha. | Alimenta as métricas do painel de anunciantes. |

---

## Decisões de modelagem

- **`status` vs `moderation` separados.** O vendedor controla o ciclo do anúncio (`rascunho → ativo → vendido/pausado/expirado`); o admin controla a aprovação (`pendente → aprovado/reprovado`). Misturar os dois num campo só viraria bagunça na Etapa 8.
- **Preço em `numeric`, nunca `float`.** Dinheiro com `float` acumula erro de arredondamento. `numeric(14,2)` aguenta valores altos em PYG (o guarani tem números grandes).
- **Categoria e raça como tabelas, não enums.** Enum no Postgres é chato de alterar; lookup permite adicionar raça nova sem migration.
- **Enums de verdade** (`status`, `currency`, `price_type`, etc.) ficaram como enum porque são valores realmente fixos e o banco garante integridade.
- **Coordenadas como `numeric` simples** (lat/lng), sem PostGIS, para o MVP rodar em qualquer Postgres. Se um dia precisar de busca "gado num raio de X km", dá pra migrar para PostGIS depois.
- **Eventos (contato/banner) como linhas, não contadores.** Guardar cada evento permite gráfico por dia/semana. Se a tabela crescer muito, agrega-se depois.

---

## Índices criados

Cobrem exatamente os filtros da busca (Etapa 5) e o pedido da Etapa 1:

- `listings`: `category_id`, `breed_id`, `department`, `price`, `status`, `seller_id`, `expires_at` e o composto **`(status, created_at desc)`** para o feed.
- Chaves estrangeiras de alto tráfego: `listing_photos(listing_id)`, `favorites(listing_id)`, `messages(recipient_id, created_at desc)`, `contact_events(listing_id)`, `banner_events(campaign_id)`.

---

## O que fica para etapas seguintes

- **RLS (Row Level Security):** políticas de acesso entram na **Etapa 3**, junto com auth. Regra central: cada usuário só edita o próprio perfil e os próprios anúncios; leitura pública só de anúncios `ativos` e `aprovados`.
- **Limite de 8 fotos:** reforçado no app (Etapa 4); opcionalmente um trigger pode travar no banco.
- **Storage de fotos:** bucket do Supabase Storage, configurado na Etapa 4.
