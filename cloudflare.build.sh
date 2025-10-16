set -xe

YARN_VERSION="4.9.1"
#NODE_VERSION="18.20.6" #Nix
NODE_VERSION="22.16.0" # Cloudflare Worker v2

if [[ $(yarn --version) != "$YARN_VERSION" ]]; then
    yarn set version "$YARN_VERSION"
    yarn --version
fi
if [[ $(node --version) != "v$NODE_VERSION" ]]; then
    echo "Node version mismatch, skip for now"
    node --version
fi


export VUE_APP_CDN_DOMAIN=cdn.jsdelivr.net
export VUE_APP_HOST=cha.fan

if [ -z "${VUE_APP_NAME-}" ]; then
   echo "Must provide var environment variable. Exiting...."
   exit 1
fi
if [ -z "${VUE_APP_API-}" ]; then
   echo "Must provide var environment variable. Exiting...."
   exit 1
fi
if [ -z "${VUE_APP_ENV-}" ]; then
   echo "Must provide var environment variable. Exiting...."
   exit 1
fi




if [[ "$1" == "--loose" ]]; then
    yarn install
    yarn run build
else
    # Make Cloudflare Worker happy: Cloudflare would first use yarn-berry 3.5.0 to
    #   read yarn.lock, then complain the yarn.lock has been modified
    #   Use this trick to skip CF's check, and put real work inside this bash script

    rm -f yarn.lock
    cp yarn.lock.txt yarn.lock

    yarn config get enableImmutableInstalls
    #yarn install --immutable
    yarn install --frozen-lockfile
    yarn run build
fi

# https://developers.cloudflare.com/pages/configuration/build-image/
