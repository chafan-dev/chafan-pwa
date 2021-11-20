all:
	yarn install
	yarn run build

fix:
	yarn run eslint --fix .
	yarn run prettier -w .
