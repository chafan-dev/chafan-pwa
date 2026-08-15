# Chafan PWA

Frontend-only SPA for a Chinese-language social Q&A site. The API is a separate service.

**Stack:** Vue 3 (`<script setup>`) · Vuetify 3 · Pinia · Vue Router 4 · Vite · TypeScript · Vitest (`tests/unit/`) · Playwright (`e2e/`)

**Layout:** `src/views/` pages · `src/components/` · `src/stores/` (Pinia: `main`, `ui`, `notifications`) · `src/composables/` (`useAuth`, `useResponsive`, `useTheme`, …) · `src/styles/` (`app.scss`, `variables.scss`) · `src/api/` + `src/api.ts`

## Branches & deploys

| ref | deploys to |
| --- | --- |
| `master` (tracks `public/master`) | — canonical source of truth |
| `deploy/preview` | preview.cha.fan |
| `deploy/master` | cha.fan (**production**) |
| `deploy/dev` | dev.cha.fan |

`public` remote = canonical GitHub repo, where PRs land. `deploy` remote = the fork Cloudflare Pages builds. Promotion is a manual fast-forward: `public/master` → `deploy/preview` → `deploy/master`, via `scripts/deploy-preview.sh` / `scripts/deploy-prod.sh`.

```bash
scripts/deploy-preview.sh    # fetches public, pushes public/master -> deploy/preview
                             # then wait a few minutes for Cloudflare to build preview.cha.fan
scripts/deploy-prod.sh       # deploy/preview -> deploy/master, with confirmation + rollback tag
```

- The scripts push the **source ref's SHA straight to the deploy remote**. Deploying does not go through any local branch — don't merge into a local `preview`/`master` first. The local `preview` branch is a vestige of the migration; it is not part of the deploy path.
- `git push` has **no** `--ff-only` flag — a plain push already refuses non-fast-forwards. Never add it.
- Production still serves the **pre-migration Vue 2 build**, so cha.fan is the visual reference: this tree must match its layout and behavior. That parity is the standing goal.

## Migration hazards (read this before debugging any layout bug)

The Vue 2→3 / Vuetify 2→3 migration was largely a mechanical rewrite, so Vuetify 2 spellings that Vuetify 3 renamed still linger. They **fail silently** — no error, no warning, just wrong layout. If a layout bug has no JS error, suspect a dead class or prop before anything else. Confirm against `node_modules/vuetify/dist/vuetify.css`.

| Vuetify 2 | Vuetify 3 |
| --- | --- |
| `col-8` (grid width) | `v-col-8` — note `offset-md-2` is *not* renamed |
| `grey--text` | `text-grey` |
| `background-color=` | `bg-color=` |
| `mini-variant` (drawer) | `rail` |
| `depressed` / `dense` | `variant="flat"` / `density="compact"` |
| `v-tab-item` | `v-window-item` inside `v-window` |
| `$vuetify.breakpoint` | `useDisplay()` |

A second, related failure mode: the rewrite sometimes **dropped `:class` bindings entirely**, leaving the driving computed declared but unused. An unused `computed` in a view is a red flag, not dead code to delete.

### Narrow/wide feed toggle

`UIStyleControllers.vue` writes `ui.narrowUI` (persisted to `localStorage.narrowFeedUI`). Views consume it via `:class`: `fixed-narrow-col` (800px) / `fixed-narrow-sidecol` (400px), both defined in `app.scss`. Wide mode falls back to the Vuetify grid (`v-col-8` + `v-col-4`).

### Known open parity gaps

- `$font-size-root: 14px` (`variables.scss:39`) overrides the base size globally; Vuetify 2's `styles.sass` import is gone.
- `Main.vue` passes the dead `:mini-variant` to `v-navigation-drawer`, and nothing calls `switchMiniDrawer` — drawer rail mode is inert.

## Commands

`yarn lint` / `yarn typecheck` shell out to bare `eslint` / `vue-tsc` and fail unless `node_modules/.bin` is on PATH. Prefer:

```bash
npx --no-install eslint src/                        # 0 errors expected; thousands of formatting warnings are pre-existing
npx --no-install vue-tsc --noEmit -p tsconfig.json
npx --no-install vite build                         # the real check — catches template errors
npx --no-install vitest run
```

## Verifying in a real browser

`.env` points `VITE_APP_API` at the production API, which returns no CORS header for `localhost` origins, so a locally served build cannot reach it. To drive a real page:

1. `npx --no-install vite build && npx --no-install vite preview --port 4319`
2. Launch Chromium with `--disable-web-security`.
3. Seed `localStorage` for the localhost origin with `chafan:token` taken from `e2e/.auth/user.json` (a saved Playwright auth state), plus `narrowFeedUI` if the layout under test depends on it.

Measuring `boundingBox()` on `.v-container > .v-row > .v-col` is the fastest way to confirm a grid fix — dead classes show up as columns splitting 50/50 instead of 2:1.
