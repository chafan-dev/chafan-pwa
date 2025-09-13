# Chafan 2.0 PWA

经过代码重构以后，在本地搭建前端开发环境变得非常简单（不超过三分钟）。非常欢迎有兴趣的朋友参与 Chafan 的开发。所有的 PR 都受欢迎 - 小到改一处多余的空格，或是升级某个依赖的 yarn 包也很欢迎。如果您有兴趣提交一个大的 PR 的话，强烈建议您先联系狗管理。

## Local development setup 

**Step 1: Install dependencies**

```
nix develop
```

不用 Nix 的用户，使用其他方式安装 `npm` `yarn` `serve` `mkcert` 即可  

**Step 2: Set environment**

```
export VUE_APP_API=api.$VUE_APP_HOST
export VUE_APP_NAME=ChaFan
export VUE_APP_ENV=staging
```

没错，得益于前后端分离的架构，在前端开发时鼓励大家直接使用 production ChaFan API。

**Step 3: Yarn Build**
```
./cloudflare.build.sh --loose
```

**Step 4: Generate Cert**

```
mkcert localhost
```


**Step 5: Serve locally**

```
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
```

**Step 6: Test in browser**
```
https://127.0.0.1:8080
```

这个域名在茶饭 backend 的 CORS 白名单内

## Deploy with Cloudflare Workers Pages
`chafan-dev/chafan-pwa` 是用于开发和测试的 `public repo`. `chai-inu/chafan-pwa-deploy` 是一个 `private repo` 和管理员的 Cloudflare 账号绑定。

1. 所有的 Pull Request 都会被合并到 `public/master`
2. Fast-forward 到 `private/preview`, 会自动部署到 `preview.cha.fan`
3. Fast-forward 到 `private/master`, 会自动部署到 `cha.fan`
4. `private/dev` 用于后端开发。它会被部署到 `dev.cha.fan`, 使用后端 `api_dev.cha.fan`


