# Chafan PWA

## Local development setup

**Step 1: Install dependencies**

```
nix develop
```

**Step 2: Set environment**

```
export VUE_APP_API=api_dev.$VUE_APP_HOST
export VUE_APP_NAME=ChaFan
export VUE_APP_ENV=staging
```

**Step 3: Yarn Build**
```
./cloudflare.build.sh
```

**Step 4: Generate Cert**

```
mkcert localhost
```


**Step 5: Serve locally

```
serve -l 8080 -s dist --ssl-cert ./localhost.pem --ssl-key ./localhost-key.pem
```

## CI-built and deploy (Cloudflare Workers Pages)

`master` will be deployed to cha.fan, using api.cha.fan  
`preview` will be deployed to preview.cha.fan, using api.cha.fan  
`dev` will be deployed to dev.cha.fan, using `api_dev.cha.fan`  

