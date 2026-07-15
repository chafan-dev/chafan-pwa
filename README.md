# Chafan 2.0 PWA

经过代码重构以后，在本地搭建前端开发环境变得非常简单（不超过三分钟）。非常欢迎有兴趣的朋友参与 Chafan 的开发。所有的 PR 都受欢迎 - 小到改一处多余的空格，或是升级某个依赖的 yarn 包也很欢迎。如果您有兴趣提交一个大的 PR 的话，强烈建议您先联系狗管理。

## Prerequisites

- **Node.js 22** (see `cloudflare.build.sh` / CI)
- **Yarn 4** via Corepack (`corepack enable`)
- Optional: [Nix](https://nixos.org/) (`nix develop` for a ready shell)

Package manager is **Yarn only** (`packageManager` in `package.json`). Do not commit `package-lock.json`.

## Local development (recommended)

**1. Install dependencies**

```bash
nix develop   # optional
corepack enable
yarn install
```

**2. Environment**

Copy the example env and adjust if needed:

```bash
cp example.env .env.local
```

Vite reads `VITE_APP_*` variables (see `example.env`).  
得益于前后端分离，本地开发时鼓励直接使用 production / staging ChaFan API。

| Variable | Example | Notes |
|----------|---------|--------|
| `VITE_APP_API` | `api.cha.fan` | Host only (no `https://`); must match allowlist in `src/env.ts` |
| `VITE_APP_NAME` | `ChaFan` | App title |
| `VITE_APP_ENV` | `staging` | Environment label |

**3. Dev server**

```bash
yarn dev
```

Open the URL Vite prints (default `http://localhost:5173`).

**4. Quality checks**

```bash
yarn lint
yarn lint:css
yarn test:unit
yarn typecheck   # soft gate while migration type debt remains
yarn build
```

## Production-like local serve (optional)

If you need HTTPS on a host already on the backend CORS allowlist:

```bash
# Map Cloudflare-style VUE_APP_* → VITE_APP_* and build
source example.env   # or export VUE_APP_* / VITE_APP_* yourself
./cloudflare.build.sh --loose

mkcert localhost
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
```

Then open `https://127.0.0.1:8080`.

Note: `cloudflare.build.sh` still accepts **`VUE_APP_*`** env vars (Cloudflare Pages) and maps them to **`VITE_APP_*`** for the Vite build.

## Deploy with Cloudflare Workers Pages

`chafan-dev/chafan-pwa` 是用于开发和测试的 `public repo`。`chai-inu/chafan-pwa-deploy` 是一个 `private repo` 和管理员的 Cloudflare 账号绑定。

1. 所有的 Pull Request 都会被合并到 `public/master`
2. Fast-forward 到 `deploy/preview`, 会自动部署到 `preview.cha.fan`
3. Fast-forward 到 `deploy/master`, 会自动部署到 `cha.fan`
4. `deploy/dev` 用于后端开发。它会被部署到 `dev.cha.fan`, 使用后端 `api_dev.cha.fan`

Branch notes (see `CLAUDE.md`):

- `preview` — Vue 3 migration / test / debug → preview.cha.fan  
- `master` — production → cha.fan  
