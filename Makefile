all:
	npm install
	npm run build

check-no-pending-change:
	git diff --exit-code
	git diff HEAD --exit-code

staging-pr: check-no-pending-change
	git fetch origin
	git pull origin master
	git rebase origin/stag
	git push -f origin master
	git checkout stag
	git pull origin stag
	git checkout master
	gh pr create --base stag --title "Update stag from master" --fill

prod-pr: check-no-pending-change
	git fetch origin
	git pull origin master
	git rebase origin/prod
	git push -f origin master
	git checkout prod
	git pull origin prod
	git checkout master
	gh pr create --base prod --title "Update prod from master" --fill