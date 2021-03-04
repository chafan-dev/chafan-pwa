all:
	npm install
	npm run build

check-no-pending-change:
	git diff --exit-code
	git diff HEAD --exit-code

staging-pr: check-no-pending-change
	git checkout master
	git fetch origin
	git rebase origin/stag
	git push -f origin master
	gh pr create --base stag --title "Update stag from master" --fill
	git checkout -

prod-pr: check-no-pending-change
	git checkout master
	git fetch origin
	git pull origin master
	git rebase origin/prod
	git push -f origin master
	gh pr create --base prod --title "Update prod from master" --fill
	git checkout -