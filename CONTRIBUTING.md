# 贡献代码

如果你打算贡献设计/代码，请先了解[Chafan 的产品开发策略](https://github.com/chafan-dev/roadmap/blob/main/docs/development_strategy.md)

在上手改代码前，, **请先在[issues](https://github.com/chafan-dev/frontend/issues)/[discussions](https://github.com/chafan-dev/frontend/discussions)或者任何你能联系到 @izgzhen 的地方讨论你想改动的地方**

## 配置开发环境

[README.md](README.md)

## 注意事项

1. 如果你不是 repo 的成员，请使用 pull request 请求 merge 到 master 里
2. 对于仓库成员，分支管理如下：

- `master` 是所有开发的整合分支
- `dev` 是 @izgzhen 使用的开发分支，会经常 merge 到 `master` 里
- 其他 feature/bug-fixes 应该先在一个 feature branch 里开发，完成后开一个 PR 请求 merge 到 `master` 里。
  - 开 PR 前请先 rebase 到最新 `master` 以减少冲突
- `stag/prod` 是部署用的分支，请不要修改或者开 PR merge 这些分支上。

3. PR 中请不要包含对 `package-lock.json` 或者 `yarn.lock` 的修改，但是可以包含对 `package.json` 的修改
4. Issues 区有一些现成的 issue 等待贡献，如果你打算动手解决其中的一个问题，请在 issue 下回复。
5. 请尽量别提交太大的 PR，每个 PR 应该目的清晰明确，这样易于 review。

## 词汇表

- `submission`: 分享/Sharing
- `site`: 圈子/Circle
- `channel`: 私信聊天室/Private messaging
