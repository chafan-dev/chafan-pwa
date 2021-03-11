# Contributing

如果你打算贡献设计/代码，请先了解[Chafan 的产品开发策略](https://github.com/chafan-dev/roadmap/blob/main/docs/development_strategy.md)

When contributing to this repository, **please first discuss the change you wish to make** via
[issues](https://github.com/chafan-dev/frontend/issues)/[discussions](https://github.com/chafan-dev/frontend/discussions),
email, or any other method with the owners of this repository before making a change.

Please note we have a [code of conduct](CODE_OF_CONDUCT.md), please follow it in all your interactions with the project.

## Setup

To get started, [README.md](README.md) contains instructions about how to work on this codebase locally.

## Developement workflow

### External Pull Request Process

Please simply fork this repo and open a PR with description of the changes against the `master` branch of this repo.

### Internal Branch Management

- `master` is the development integration branch. It _might_ be push-forced to rebase against `prod/stag` branches.
- Other feature/bug-fixes should be first pushed to a feature branch.
  - When the code is ready for review, open a PR from this branch against `master`. Remember to rebase against `master` and fix all conflicts.
- `stag/prod` are branchs that will be deployed to staging/production environments.

### Tips:

- Use `git add` to avoid adding `package-lock.json` accidentally (if you didn't change `package.json`, you should not submit a diff for the lock file).

## Claim issue

If you want to work on an existing issue, please claim it explicitly in the issue before working on it.
If you didn't move on with the issue, we will assume you are busy and the claim will be automatically released after two weeks.

## Misc

You can use both English and Chinese to communicate.
