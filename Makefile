.PHONY: all install dev build fix lint lint-css test quality precommit

all: install build

install:
	yarn install

dev:
	yarn dev

build:
	yarn build

# Auto-fix ESLint + Stylelint + Prettier on src
fix:
	yarn lint:fix
	yarn lint:css:fix
	yarn prettier -w "src/**/*.{ts,vue,css,scss,json}"

lint:
	yarn lint

lint-css:
	yarn lint:css

test:
	yarn test:unit

# Same hard gates as CI (lint + CSS + unit tests)
quality:
	yarn quality

# Run lint-staged (wire as a git pre-commit hook if desired)
precommit:
	yarn precommit

prod-pr:
	gh pr create -B prod
