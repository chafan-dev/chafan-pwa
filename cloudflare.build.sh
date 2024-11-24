[[ $(yarn --version) == "1.22.22" ]] || exit 1

[[ $(node --version) == "v20.17.0" ]] || exit 1

if [ -z "${VUE_APP_NAME-}" ]; then
   echo "Must provide var environment variable. Exiting...."
   exit 1
fi


yarn install
yarn run build


# https://developers.cloudflare.com/pages/configuration/build-image/
