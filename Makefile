all:
	yarn install
	yarn run build

fix:
	yarn run eslint --fix .
	yarn run prettier -w .

prod-pr:
	gh pr create -B prod
