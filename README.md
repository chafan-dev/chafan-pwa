# Chafan frontend

[![CodeQL](https://github.com/chafan-dev/frontend/actions/workflows/codeql-analysis.yml/badge.svg?branch=prod)](https://github.com/chafan-dev/frontend/actions/workflows/codeql-analysis.yml)
[![CI](https://github.com/chafan-dev/frontend/actions/workflows/main.yml/badge.svg)](https://github.com/chafan-dev/frontend/actions/workflows/main.yml)

## Project setup

```
yarn install
```

Example local development environment file (`.env.local`):

```
VUE_APP_DOMAIN_DEV=localhost:4582
VUE_APP_DOMAIN_STAG=localhost:4582
VUE_APP_NAME=Chafan Demo
VUE_APP_ENV=development
VUE_APP_APPZI=
VUE_APP_PROD_STATE_JSON_URL=https://chafan-prod-state.s3.amazonaws.com/prod-state.json
VUE_APP_ADMIN_UUID=
VUE_APP_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
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

### Vercel builds

`master` branch is continuously integrated to https://chafan-frontend-git-master-chafan.vercel.app which uses
a test-only API server at http://chafan-test.herokuapp.com/ that runs the same code as production server.

You need to ask @izgzhen for an invitation link to sign up for a account. When signing up, you need to flow
normal registration flow but you don't have to fill in a correct verification code for email verification
(just fill in a few random numbers).

Other Vercel branch preview builds will use the same test API server as well.

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
