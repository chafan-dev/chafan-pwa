## Build and release

NOTE: Check out the right base release version.

```bash
# first time: npm install
# change some code
# test
# Update semver in package.json
npm update
# commit changes to semver branch and to latest-chafan
npm run build
npm publish --access=public --tag latest-chafan
```

## Build `lute.min.js`

```
brew install golang
export PATH=$PATH:$(go env GOPATH)/bin
go get -u github.com/gopherjs/gopherjs
go get golang.org/dl/go1.12.16
go1.12.16 download
export GOPHERJS_GOROOT="$(go1.12.16 env GOROOT)"
ln -s $PWD $(go env GOPATH)/src/github.com/88250/lute
cd javascript/
rm lute.min.js lute.min.js.map
bash build.sh
```
