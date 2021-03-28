# Chafan frontend

[![CodeQL](https://github.com/chafan-dev/frontend/actions/workflows/codeql-analysis.yml/badge.svg?branch=prod)](https://github.com/chafan-dev/frontend/actions/workflows/codeql-analysis.yml)
[![CI](https://github.com/chafan-dev/frontend/actions/workflows/main.yml/badge.svg)](https://github.com/chafan-dev/frontend/actions/workflows/main.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/2eaac29c-b2e4-4d0f-85af-1eb464e9447c/deploy-status)](https://app.netlify.com/sites/chafan-test/deploys)

## Project setup

```
yarn install
```

Example local development environment file (`.env.local`):

```
VUE_APP_API=localhost:4582
VUE_APP_NAME=Chafan Demo
VUE_APP_ENV=development
VUE_APP_PROD_STATE_JSON_URL=https://chafan-prod-state.s3.amazonaws.com/prod-state.json
VUE_APP_ADMIN_UUID=
VUE_APP_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
VUE_APP_DEFAULT_SRC='self' cdn.jsdelivr.net hcaptcha.com assets.hcaptcha.com
VUE_APP_STYLE_SRC='self' 'unsafe-inline' cdn.jsdelivr.net
VUE_APP_FRAME_SRC=assets.hcaptcha.com
VUE_APP_SCRIPT_SRC='self' 'unsafe-inline' cdn.jsdelivr.net hcaptcha.com assets.hcaptcha.com
VUE_APP_CONNECT_SRC=* data:
```

### Compiles and hot-reloads for development

```
yarn run serve
```

### Compiles and minifies for production

```
yarn run build
```

### API server mock

The API server is mocked by a express server at `e2e_tests/server.js`.
To test the frontend, please run it locally: `node e2e_tests/server.js`.

Some APIs are missing from mock server for now. You can add code
for mock server along with the frontend code change if needed.

NOTE: you can leave username/password blank to "log in" the mock server.

### Run production build locally

Prepare:

```bash
brew install mkcert
mkcert -install
mkcert localhost
npm install -g serve
```

Build and serve locally through https:

```bash
VUE_APP_ENV=staging yarn run build
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
node e2e_tests/server.js --secure
# Open https://localhost:8080
```

### Preview builds

`master` branch is continuously integrated to https://chafan-test.netlify.app which uses
a test-only API server at http://chafan-test.herokuapp.com/ that runs the same code as production server.

You need to ask @izgzhen for an invitation link to sign up for a test account. When signing up, you need to follow
normal registration flow, but you don't have to fill in a correct verification code for email verification
(just fill in a few random numbers).

Any PR against `master` will have a Netlify preview build that uses the same test API server as well.

### Analyze production build

```
yarn run analyze
```

### Run your tests

```
yarn run test
```

### Lints and fixes files

Checks:

```
yarn run check:eslint
yarn run check:prettier
```

Fixes all:

```
yarn run eslint --fix .
yarn run prettier -w .
```

### Run your unit tests

```
yarn run test:unit
```

## Debugging

https://github.com/Microsoft/vscode-recipes/tree/master/vuejs-cli

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
