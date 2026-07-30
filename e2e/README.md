# Preview E2E (standalone)

Real-browser journeys against **https://preview.cha.fan**. Not part of CI —
run it by hand after a deploy to preview to confirm basic functions still work.

## Setup

```bash
yarn install                       # pulls @playwright/test + dotenv (devDeps)
yarn playwright install chromium   # one-time browser download
cp e2e/env.e2e.example env.e2e     # then fill E2E_EMAIL / E2E_PASSWORD
```

`env.e2e` is gitignored — never commit credentials.

## Run

No yarn run-scripts — a standalone launcher drives Playwright directly:

```bash
e2e/run.sh                    # headless, all journeys
e2e/run.sh --headed           # watch the browser
e2e/run.sh --ui               # Playwright UI mode
e2e/run.sh --project=public   # only logged-out journeys (no credentials needed)
```

Extra args pass straight through to `playwright test`, e.g. run one journey:

```bash
e2e/run.sh e2e/journeys/03-create-question-answer.spec.ts
```

The HTML report lands in `playwright-report/` (open with
`yarn playwright show-report`).

## Coverage

1. Login (test account, via `auth.setup.ts` — runs once, state reused)
2. Public browse (home, explore, login page, test site) — no credentials
3. Logged-in site tabs (问题 / 分享)
4. Create question + answer on `/sites/meaningless`
5. Create submission on the same site
6. Logout

Created content titles are prefixed with `[e2e]` plus a timestamp so they are
easy to find and delete. **Cleanup is manual** — each full run leaves a new
question, answer, and submission on the preview test site.

## Env

| Variable | Default |
|----------|---------|
| `BASE_URL` | `https://preview.cha.fan` |
| `E2E_EMAIL` | required (except `--project=public`) |
| `E2E_PASSWORD` | required (except `--project=public`) |
| `E2E_SITE_PATH` | `/sites/meaningless` |
