# Chafan frontend

[![CodeQL](https://github.com/chafan-dev/frontend/actions/workflows/codeql-analysis.yml/badge.svg?branch=prod)](https://github.com/chafan-dev/frontend/actions/workflows/codeql-analysis.yml)
[![CI](https://github.com/chafan-dev/frontend/actions/workflows/main.yml/badge.svg)](https://github.com/chafan-dev/frontend/actions/workflows/main.yml)

## Project setup

```
npm install
```

Example local development environment file (`.env.local`):

```
VUE_APP_DOMAIN_DEV=localhost:4582
VUE_APP_DOMAIN_STAG=localhost:4582
VUE_APP_NAME=Chafan Demo
VUE_APP_ENV=development
VUE_APP_APPZI=
VUE_APP_PROD_STATE_JSON_URL=https://chafan-prod-state.s3.amazonaws.com/prod-state.json
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### API server mock

The API server is mocked by a express server at `e2e_tests/server.js`.
To test the frontend, please run it locally: `node e2e_tests/server.js`.

Some APIs are missing from mock server for now. You can add code
for mock server along with the frontend code change if needed.

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
VUE_APP_ENV=staging npm run build
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
node e2e_tests/server.js --secure
```

### Analyze production build

```
npm run analyze
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

## Debugging

https://github.com/Microsoft/vscode-recipes/tree/master/vuejs-cli

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
