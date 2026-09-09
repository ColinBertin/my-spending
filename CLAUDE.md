# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

My Spending is a personal/business finance tracker (Next.js App Router + Supabase). Users create accounts, categories, and transactions, view monthly/category summaries, and generate accounting-ready ledger previews (including Japanese-language ledger exports) as XLSX/PDF.

## Commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build (Turbopack)
npm run test         # run full Vitest suite once
npm run test:watch   # watch mode
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
npm run format-all   # prettier --write on the whole repo
```

Run a single test file: `npx vitest run path/to/file.test.ts`. Run tests matching a name: `npx vitest run -t "pattern"`.

Pre-commit (via husky + lint-staged) auto-formats staged files, then runs `type-check` and `eslint` on changed TS/TSX files — expect these to run on every commit.

CI (`.github/workflows/test.yml`) runs `npm test` on every push to any branch.

## Architecture

### Auth & data access — no RLS, manual authorization in each route

Supabase RLS is **not** the authorization mechanism here. The pattern used throughout `app/api/**/route.ts`:

1. `createClient()` from `utils/supabase/server.ts` — SSR client bound to cookies, used only to call `supabase.auth.getUser()` (and sometimes read-only ownership checks).
2. `createAdminClient()` from `utils/supabase/admin.ts` — service-role client that bypasses RLS, used for the actual reads/writes.
3. Every route manually verifies the requesting user owns/has access to the resource (typically via the `account_members` join table, or `created_by`/`user_id` equality) _before_ using the admin client to mutate data.

When adding or touching an API route, follow this same explicit-check pattern rather than assuming RLS enforces anything.

Authorization-failure status codes matter here: return **404** (not 403) when a user lacks access to a resource that could otherwise reveal existence via ID enumeration (see `getAuthorizedAccount` in `app/api/accounts/[id]/route.ts`); 403 is used only where enumeration isn't a concern (e.g. `app/api/transactions/route.ts` membership checks). Match existing behavior per-route rather than picking one convention globally.

Middleware (`middleware.ts` → `utils/supabase/middleware.ts`) redirects unauthenticated users to `/login` for all routes except `/login` and `/signup`. It supports a `NEXT_PUBLIC_USE_MOCK=true` bypass that skips Supabase entirely — check this flag if auth-related middleware behaves unexpectedly.

### Data model (see `supabase/migrations/`)

- `accounts` — a wallet/ledger container, `type` is `single` | `shared` | `professional`, has a `currency`.
- `account_members` — join table granting users access to accounts (many-to-many).
- `categories` — per-user (`user_id`), optional `type` of `normal` | `professional`, carries denormalized icon/color.
- `transactions` — belongs to one `account`, `created_by` one user, `type` is `income` | `expense`. Category fields (`category_name`, `category_icon`, `category_icon_pack`, `category_color`) are denormalized onto the transaction at write time rather than joined at read time — when a category is edited, existing transactions keep their old snapshot.
- All user references point to `auth.users` (Supabase Auth) directly — the standalone `public.users` table exists but auth linkage was migrated away from it (see the `link_users_to_auth` / `switch_user_refs_to_auth` migrations); don't reintroduce `public.users.id` as a foreign key for new features.

### Ledger generation

`lib/ledgerPreviewRows.ts` builds the row model (carry-forward balances, subtotals, closing rows) for on-screen ledger previews; `lib/ledgerXlsx.ts` renders that into a styled XLSX workbook, cloning cell styles from a template file (`public/水道光熱費_2024.xlsx`, falling back to `public/ledger-template.xlsx`) rather than building styles from scratch. `app/(routes)/ledger-generator/data.ts` contains domain-specific accounting rules — e.g. specific category names (Japanese and English) treated as accrued expenses, and a January-adjustment ledger for categories in `CATEGORY_LEDGER_JANUARY_ADJUSTMENT_TARGETS`. These rules encode real accounting requirements, not arbitrary defaults — don't change the category name lists or adjustment logic without understanding the accounting rationale.

### Frontend structure

- Route groups: `app/(auth)/` (login/signup, unauthenticated) and `app/(routes)/` (authenticated app pages — dashboard, accounts, categories, ledger generator).
- Each routed feature typically has a `page.tsx` (server component, data fetching) paired with a same-named client component (e.g. `create-account.tsx`) holding the interactive form logic, plus a `loading.tsx`.
- `components/ui/` — shadcn/ui primitives (see `components.json`: style `new-york`, no Tailwind prefix, path aliases `@/components`, `@/lib`, `@/hooks`). Use the shadcn CLI conventions (`cn()` from `@/lib/utils`, `class-variance-authority`) when adding new primitives here rather than hand-rolling styling.
- `components/layout/` — app chrome (Navbar, Footer).
- Auth state on the client goes through `utils/useAuthUser.ts` (hook) / `utils/authClient.ts` (imperative calls); both wrap the Supabase browser client from `utils/supabase/client.ts`.

### Testing

Vitest with `jsdom`-free `node` environment by default (`vitest.config.mts`), Testing Library for component tests, setup file at `test/setup.ts`. Test files sit next to the code they test (`*.test.ts`/`*.test.tsx`), not in a separate `__tests__` tree.
