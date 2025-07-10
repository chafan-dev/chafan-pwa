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


**Step 5: Serve locally

```
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
```

## Maintainer only section : CI-built and deploy (Cloudflare Workers Pages)

`master` will be deployed to cha.fan, using api.cha.fan  
`preview` will be deployed to preview.cha.fan, using api.cha.fan  
`dev` will be deployed to dev.cha.fan, using `api_dev.cha.fan`  

