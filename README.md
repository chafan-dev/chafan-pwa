# Chafan frontend

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

### Run production build locally

```bash
# brew install mkcert
# mkcert -install
# mkcert localhost
VUE_APP_ENV=staging npm run build
# npm install -g serve
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
# make dev-run-secure in the backend or
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