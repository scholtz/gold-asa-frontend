# CLAUDE.md

Guidance for AI coding assistants working in this repository.

## Project

ASA.Gold frontend: a Vue 3 single-page app for buying, selling and swapping a gold-backed token on Algorand, plus an e-shop for physical gold coins (ARC-3 NFTs) with a secondary marketplace. The repo also contains the e-shop smart contract in [asa-gold-smartcontract/](asa-gold-smartcontract/) (published to npm as `algorand-asa-gold`, which the frontend consumes).

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
- `npm run build` - runs `type-check` and `vite build` in parallel (`run-p`), so a produced `dist/` does not prove types passed; check the exit code / type errors (output `dist/`)
- `npm run test:unit` - Vitest in watch mode (blocks); agents and CI should use `npx vitest run`
- `npm run test:e2e` - Cypress against the preview build
- `npm run lint` - ESLint with `--fix` over the whole repo (can touch unrelated files; review the diff). For check-only: `npx eslint <files>`
- `npm run format` - `prettier --write src/` (whole `src/`). To format only your changes: `npx prettier --write <files>`

Smart contract subproject (separate `package.json` in `asa-gold-smartcontract/`): `npm run build` (TealScript compile + client generation), `npm test` (Jest, needs an Algorand sandbox). Do not touch it unless the task is about the contract.

## Layout

- `src/main.ts` - app bootstrap (PrimeVue, Toast, Pinia, router)
- `src/router/index.ts` - routes; most views are lazy-loaded
- `src/views/` - page-level components (`Settings/`, `Tokens/`, `GDPR/`, `Terms/` subfolders)
- `src/components/` - reusable components; `src/layouts/` - `PublicLayout` / `AuthLayout`
- `src/stores/app.ts` - the single Pinia store (`useAppStore`): network/env, token IDs, algod settings, auth state, account
- `src/scripts/` - non-UI helpers grouped by domain: `algo/` (algod client, ASA parsing, caches), `boxes/` (smart-contract box reads), `ipfs/`, `axios/BFF.ts`, `common/`
- `src/types/` - shared TS interfaces
- `k8s/{mainnet,testnet,sandbox}`, `docker/` - deployment; CI (`.github/workflows/main.yml`) deploys on push to `main` via SSH to a server running `deploy.sh`

## Conventions

- Prettier: no semicolons, single quotes, 2-space indent, 100 columns, no trailing commas. Format only the files you change with `npx prettier --write <files>`.
- Use the Composition API with `<script setup lang="ts">`; type props and emits.
- Put chain/IPFS/HTTP logic in `src/scripts/` and keep views thin. Reuse existing helpers before writing new ones; they are default exports, e.g. `import getAlgodClient from '@/scripts/algo/getAlgodClient'`, `getAsaFromCache` (`scripts/algo/`), `formatPrice` (`scripts/common/`).
- Shared state goes through `useAppStore`; do not add new global singletons.
- UI components come from PrimeVue; use PrimeFlex utility classes before adding custom CSS.

## Runtime configuration

The app fetches `/config.json` at startup (see top of `src/stores/app.ts`) to set env (`mainnet-v1.0` / `testnet-v1.0` / `sandnet-v1`), BFF URL, algod endpoint, app ID, token IDs and fee collector. Config per environment lives in `k8s/<env>/conf`. Some of these values are also persisted to `localStorage` under `state` and can override config when the env matches - keep that in mind when debugging "wrong network" issues.

## Things to be careful about

- This handles real money and wallet signing. Never log or persist secrets/mnemonics, and do not change transaction construction, asset IDs, fee collector addresses or network defaults without being asked.
- Mainnet and testnet use different asset/app IDs; never hardcode one environment's asset/app IDs in views, components or scripts. Environment-specific values belong only in `k8s/<env>/conf` (served as `/config.json`); the store defaults in `src/stores/app.ts` are fallbacks, so do not add new ones there.
- Pushing to `main` triggers a production deploy. Work on a branch and open a PR.
- `dist/`, `node_modules/` and the contract's `contracts/artifacts` are generated; do not edit by hand.
- Test coverage is minimal (only a placeholder spec exists); add Vitest tests for new pure logic in `src/scripts/`.
