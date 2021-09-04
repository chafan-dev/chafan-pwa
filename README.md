# Chafan PWA

## Local development setup

**Step 1: Install dependencies**

First, install NodeJS, npm and yarn on your OS. Then:

```
yarn install
```

Create a local environment file within this repo's top-level directory: `.env.local`, e.g.

```
VUE_APP_API=https://chafan-test.herokuapp.com
VUE_APP_NAME=Chafan Dev
VUE_APP_ENV=development
VUE_APP_ADMIN_UUID=
VUE_APP_HCAPTCHA_SITEKEY=10000000-ffff-ffff-ffff-000000000001
VUE_APP_DEFAULT_SRC='self' cdn.jsdelivr.net hcaptcha.com assets.hcaptcha.com
VUE_APP_STYLE_SRC='self' 'unsafe-inline' cdn.jsdelivr.net
VUE_APP_FRAME_SRC=assets.hcaptcha.com newassets.hcaptcha.com www.youtube.com player.bilibili.com
VUE_APP_SCRIPT_SRC='self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net hcaptcha.com assets.hcaptcha.com remotejs.com newassets.hcaptcha.com
VUE_APP_CONNECT_SRC=* data:
VUE_APP_ENABLE_CAPTCHA=false
```

Build for development and run hot-reload website:

```
yarn run serve
```

## Showcase

When developing locally, you can see `/showcase` for individual static components, for exploration and design purpose. For example:

![](./example-showcase.png)

## Build production and serve locally through https

Prepare the dependencies:

```bash
brew install mkcert
mkcert -install
mkcert localhost
npm install -g serve
```

Build and serve：

```bash
VUE_APP_ENV=staging yarn run build
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
node e2e_tests/server.js --secure
# Open https://localhost:8080
```

## CI-built `master` previews

`master` will be deployed to https://chafan-test.netlify.app from time to time.

Please contact @izgzhen to get a invitation link to the test site. Notice that you can fill in any random verification code during registration.

If you opened a PR against `master` branch, Netlify will build a preview website too.

## Analyze production build

```
yarn run analyze
```

## Unit tests

```
yarn run test:unit
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

## Debugging

https://github.com/Microsoft/vscode-recipes/tree/master/vuejs-cli

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md)
