# CLAUDE.md

Guidance for AI coding assistants working in this repository.

## Project

ASA.Gold frontend: a Vue 3 single-page app for buying, selling and swapping a gold-backed token on Algorand, plus an e-shop for physical gold coins (ARC-3 NFTs) with a secondary marketplace. The repo also contains the e-shop smart contract in [asa-gold-smartcontract/](asa-gold-smartcontract/) (published to npm as `algorand-asa-gold`, which the frontend consumes as a versioned dependency (`^` range in `package.json`); contract changes only reach the frontend after a new package release and a dependency/lockfile bump).

Related repos (not here): BFF backend (`scholtz/AsaGoldBff`), repository API (`AsaGoldRepository`), `algorand-authentication-component-vue`.

## Stack

- Vue 3 (`<script setup lang="ts">`), Vite 4, TypeScript ~5.2, Pinia, Vue Router 4
- PrimeVue 3 + PrimeFlex + PrimeIcons (theme `lara-light-teal`)
- algosdk 2, `@thencc/any-wallet` and wallet connectors (Pera, Defly, MyAlgo, WalletConnect), Folks Router for swaps
- Tests: Vitest + jsdom + @vue/test-utils (unit), Cypress (e2e)

## Commands (run from repo root)

- `npm ci` - install
- `npm run dev` - Vite dev server
- `npm run type-check` - `vue-tsc` against `tsconfig.app.json`
- `npm run build` - outputs to `dist/`. It runs `type-check` and `vite build` in parallel (`run-p`). A `dist/` directory does not prove types passed; check the exit code and type errors.
- `npm run test:unit` - Vitest in watch mode (blocks); agents and CI should use `npx vitest run`
- `npm run test:e2e` - Cypress against `vite preview` (does not build; run `npm run build` first and confirm type-check passed)
- `npm run lint` - ESLint with `--fix` over the whole repo, including `asa-gold-smartcontract/` (can touch unrelated files; review the diff). For check-only: `npx eslint <files>`
- `npm run format` - `prettier --write src/` (whole `src/`). To format only your changes: `npx prettier --write <files>`

Smart contract subproject (separate `package.json` in `asa-gold-smartcontract/`): `npm run build` (TealScript compile + client generation), `npm test` (Jest, needs an Algorand sandbox). Do not touch it unless the task is about the contract.

## Layout

- `src/main.ts` - app bootstrap (PrimeVue, Toast, Pinia, router)
- `src/router/index.ts` - routes; most views are lazy-loaded
- `src/views/` - page-level components (`Settings/`, `Tokens/`, `GDPR/`, `Terms/` subfolders)
- `src/components/` - reusable components; `src/layouts/` - `PublicLayout` / `AuthLayout`
- `src/stores/app.ts` - the single Pinia store (`useAppStore`): network/env, token IDs, algod settings, auth state, account
- `src/service/ProductService.ts` - loads e-shop products from the contract's boxes (uses the store and `scripts/`); extend it for product data rather than creating a parallel service; new generic helpers still go in `scripts/`
- `src/scripts/` - non-UI helpers grouped by domain: `algo/` (algod client, ASA parsing, caches), `boxes/` (smart-contract box reads), `ipfs/`, `axios/BFF.ts`, `common/`
- `src/types/` - shared TS interfaces
- `k8s/{mainnet,testnet,sandbox}`, `docker/` - deployment; CI (`.github/workflows/main.yml`) deploys on push to `main` via SSH to a server running `deploy.sh`

## Conventions

- Prettier: no semicolons, single quotes, 2-space indent, 100 columns, no trailing commas. Format only the files you change with `npx prettier --write <files>`.
- Use the Composition API with `<script setup lang="ts">`; type props and emits. (Only the template-only icon components in `src/components/icons/` lack it; don't convert existing files without reason.)
- Put chain/IPFS/HTTP logic in `src/scripts/` (or `src/service/ProductService.ts` for e-shop product loading) and keep views thin. Reuse existing helpers before writing new ones; they are default exports, e.g. `import getAlgodClient from '@/scripts/algo/getAlgodClient'`, `getAsaFromCache` (`scripts/algo/`), `formatPrice` (`scripts/common/`).
- Shared state goes through `useAppStore`; do not add new global singletons.
- UI components come from PrimeVue; use PrimeFlex utility classes before adding custom CSS.

## Runtime configuration

The app fetches `/config.json` at startup (top of `src/stores/app.ts`) to set env (`mainnet-v1.0` / `testnet-v1.0` / `sandnet-v1`), BFF URL, algod endpoint, app ID, token IDs and fee collector. Config per environment lives in `k8s/<env>/conf`. The fetch is not validated: a failed fetch falls back to hardcoded defaults, and a non-JSON response (e.g. SPA index.html) is not rejected.

State is also persisted to `localStorage` key `state`. At startup the config wins for token IDs, app ID, BFF and fee collector; only the stored `env`/algod host/port/token (when the stored `env` matches) override the config. Stored state is ignored entirely when its `env` differs from the current `env`. Read `useAppStore` before debugging "wrong network", token ID or fee collector issues rather than assuming which source wins; the store's hardcoded defaults are testnet-era fallbacks, not mainnet values.

## Things to be careful about

- This handles real money and wallet signing. Never log or persist secrets/mnemonics, and do not change transaction construction, asset IDs, fee collector addresses or network defaults without being asked.
- Mainnet and testnet use different asset/app IDs; do not add new hardcoded environment-specific asset/app IDs in views, components or scripts. They belong in `k8s/<env>/conf` (served as `/config.json`). Existing exceptions (store fallback defaults, mainnet token IDs in prose in `AboutUsView.vue`) are legacy; leave them unless asked.
- Pushing to `main` triggers a production deploy. Work on a branch and open a PR.
- `dist/`, `node_modules/` and the contract's `contracts/artifacts` are generated; do not edit by hand.
- Test coverage is minimal (only the placeholder `src/components/__tests__/HelloWorld.spec.ts` exists). Add Vitest specs for new pure logic as `*.spec.ts` in a `__tests__/` folder next to the code (e.g. `src/scripts/common/__tests__/`); `vitest.config.ts` uses jsdom and excludes only `e2e/*` (Cypress specs are `*.cy.ts` under `cypress/`; the `.cy.ts` suffix, not the `e2e/*` exclude, keeps Vitest from picking them up; never name Cypress specs `*.spec.ts`).
