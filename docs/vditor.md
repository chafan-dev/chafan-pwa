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