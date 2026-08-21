# Chafan PWA Improvement Plan

## 1. Goals

Make the frontend easier to maintain without changing the product behavior that
already matches the pre-migration Vue 2 build. The plan is split into small,
reviewable PRs so each change can be verified against `preview.cha.fan`.

Non-goals:

- Do **not** redesign UI or change visual parity with the current production build.
- Do **not** replace Vue/Vuetify/Pinia with another stack.
- Do **not** block bug fixes on the full structural refactor.

## 2. Priority summary

| Priority | Theme | Examples |
| --- | --- | --- |
| P0 | User-visible bugs | Invalid sort comparators, broken feedback screenshot, Vue 2 `.native` event, wrong search truncation |
| P1 | API layer consistency | Finish splitting `src/api.ts` into feature modules |
| P2 | View/component decomposition | Split `Dashboard.vue`, `Answer.vue`, `Question.vue`, `Submission.vue`, editor views |
| P3 | State management | Split `stores/main.ts` into auth/user/notification concerns |
| P4 | Type & folder hygiene | Split `interfaces/index.ts`, enforce component folders, remove dead code |
| P5 | Quality gates | Make unused imports/components errors again, add tests, run typecheck in CI |

## 3. Phase 0 — Bug fixes and quick wins

These should land first. Each item is independent and low-risk.

### 3.1 Fix invalid sort comparators

Files:

- `src/utils/misc.ts` — `rankComments`
- `src/views/main/Question.vue` — answer ordering
- `src/views/main/Site.vue` — member karma ordering

Current comparators violate the strict weak-ordering contract (`compare(a,b)` and
`compare(b,a)` can both return `-1`), so order is implementation-defined and
wrong for common cases.

Recommended fixes:

```ts
// src/utils/misc.ts
export const rankComments = (comments: IComment[]) => {
  return comments.sort((a, b) => {
    const voteDiff = b.upvotes_count - a.upvotes_count;
    if (voteDiff !== 0) return voteDiff;
    return dayjs.utc(b.created_at).valueOf() - dayjs.utc(a.created_at).valueOf();
  });
};
```

```ts
// src/views/main/Site.vue — compare karma descending, 0 for equality
siteProfiles.value = (await api.getSiteProfiles(token.value, site.value.uuid)).data.sort(
  (a, b) => b.karma - a.karma
);
```

For `Question.vue`, replace the nested `if` comparator with a score-based sort
that preserves server order for equal-priority answers:

```ts
const selectedUuid = answerUUID.value;
const myUuid = userProfile.value?.uuid;

answers.value = [...answersData].sort((a, b) => {
  const score = (x: IAnswerPreview) =>
    (x.uuid === selectedUuid ? 2 : 0) + (x.author.uuid === myUuid ? 1 : 0);
  return score(b) - score(a);
});
```

### 3.2 Fix feedback screenshot loading in the browser

Files:

- `src/api.ts` — `getFeedbackScreenshotBase64`
- `src/views/main/dashboard/Feedback.vue`

Problems:

- `Buffer.from` is Node-only and not polyfilled by Vite.
- The data URL is hardcoded as `data:image/gif;base64,` regardless of the real
  image type.

Recommended approach: return a blob URL and revoke it on unmount.

```ts
// src/api.ts or src/api/feedback.ts
async getFeedbackScreenshot(token: string, feedbackId: number) {
  return http.get(`/feedbacks/${feedbackId}/screenshot`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });
}
```

```ts
// src/views/main/dashboard/Feedback.vue
const screenshotUrl = ref('');
let objectUrl: string | null = null;

onMounted(async () => {
  if (props.feedback.has_screenshot) {
    const r = await api.getFeedbackScreenshot(token.value, props.feedback.id);
    objectUrl = URL.createObjectURL(r.data);
    screenshotUrl.value = objectUrl;
  }
});

onBeforeUnmount(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});
```

### 3.3 Remove Vue 2 `.native` modifier

File: `src/components/NotificationsManager.vue`

```vue
<!-- before -->
<v-btn variant="text" @click.native="close">关闭</v-btn>

<!-- after -->
<v-btn variant="text" @click="close">关闭</v-btn>
```

### 3.4 Fix search result truncation

File: `src/components/SearchResults.vue`

```ts
function getItemText(item: SearchResultItem) {
  const fullText = getItemFullText(item);
  if (fullText.length > 20) {
    return fullText.substring(0, 20) + '...';
  }
  return fullText;
}
```

Also replace the deprecated `substr` with `substring`.

### 3.5 Include current year in `getRecentYears`

File: `src/utils/misc.ts`

```ts
export const getRecentYears = () => {
  return range(1950, dayjs().year() + 1, 1)
    .map((y: number) => y.toString())
    .reverse();
};
```

### 3.6 Send `checkTokenValidity` as form data

File: `src/api.ts`

```ts
async checkTokenValidity(token: string) {
  const params = new URLSearchParams();
  params.append('token', token);
  return http.post<IGenericResponse>(`/check-token-validity/`, params);
}
```

Also cache the verified token in `src/views/ResetPassword.vue` so the endpoint is
not called once on mount and again on submit.

### 3.7 Clean `buildInfo.tags`

File: `src/env.ts`

```ts
tags: (import.meta.env.VITE_GIT_TAGS as string)
  .split('\n')
  .filter(Boolean),
```

## 4. Phase 1 — Finish splitting the API layer

`src/api.ts` should become a pure barrel or be removed. Move each remaining group
into its own feature module:

| Current `api.ts` methods | Target module |
| --- | --- |
| `logInGetToken`, `logInInvitedGetToken`, `passwordRecovery`, `resetPassword`, `checkTokenValidity` | `src/api/auth.ts` |
| `getUser`, `getUsers`, `updateUser`, `createUser`, `getUserSiteProfile`, `getSiteProfiles` | `src/api/users.ts` |
| `getUnreadNotifications`, `getReadNotifications`, `updateNotification` | `src/api/notifications.ts` |
| `createChannel`, `getChannel`, `getChannelMessages`, `createMessage`, `addUserToChannel` | `src/api/channels.ts` |
| `createTask`, `getCoinPayments`, `createReward`, `claimReward`, `refundReward`, `getRewards`, `checkWelcomeTestScoreAndClaimRewards` | `src/api/tasks.ts` / `src/api/rewards.ts` |
| `uploadFeedback`, `getFeedbacks`, `getFeedbackScreenshotBase64`, `createReport` | `src/api/feedback.ts` |
| `inviteUser`, `createInvitationLink`, `joinSiteWithInvitationLink`, `getInvitationLink` | `src/api/invitations.ts` |
| `sendVerificationCode`, `openAccount` | `src/api/auth.ts` or `src/api/account.ts` |
| `getSiteMaps`, `getCategoryTopics`, `generateLinkPreview` | `src/api/discovery.ts` / `src/api/misc.ts` |
| `updateAnswerByMod` | `src/api/answer.ts` |

After the move, update imports and delete the old methods from `src/api.ts`.

Definition of done:

- No component imports `{ api } from '@/api'` unless that module is a pure
  re-export barrel.
- Every API function lives in a domain-named file.
- `grep -R "api\." src/api.ts` returns only re-exports or nothing.

## 5. Phase 2 — Decompose large views and components

### 5.1 `Dashboard.vue`

Move each `v-window-item` into its own component:

```txt
src/views/main/dashboard/
  Dashboard.vue
  SettingsTab.vue
  DraftsTab.vue
  ColumnsTab.vue
  ChannelsTab.vue
  CoinsRewardsTab.vue
  BookmarkedAnswersTab.vue
  SubscribedQuestionsTab.vue
  SubscribedSubmissionsTab.vue
  BookmarkedArticlesTab.vue
```

Keep `Dashboard.vue` as the tab shell only.

### 5.2 `Answer.vue`

Extract:

- comment thread → `AnswerComments.vue`
- suggestion handling → already partially in `components/answer/AnswerSuggestedEdits.vue`; finish it
- draft banner → `AnswerDraftBanner.vue`
- moderation actions → `AnswerModerationMenu.vue`

### 5.3 `Question.vue` / `Submission.vue`

Extract page loading and write actions into composables:

```txt
src/composables/
  useQuestionPage.ts
  useSubmissionPage.ts
```

These composables own loading state, answer/comment lists, write permissions, and
API error handling. The view then only renders.

### 5.4 Editor views

Extract the autosave/timer logic from `AnswerEditor.vue` and
`ArticleEditor.vue` into `useAutoSave.ts`, including timer cleanup in
`onBeforeUnmount`.

### 5.5 `Main.vue`

Move the feedback dialog into `src/components/feedback/FeedbackDialog.vue`.
`Main.vue` should only be the app shell.

## 6. Phase 3 — Split `stores/main.ts`

Target:

```txt
src/stores/
  auth.ts          // token, isLoggedIn, logIn, logOut, routeLoggedIn
  user.ts          // userProfile, moderatedSites, getUserProfile, updateMe
  notifications.ts // already exists
  ui.ts            // already exists
```

Move `checkApiError` / `captureApiError` / `tryApi` into a composable such as
`src/composables/useApiError.ts` or into the Axios client as interceptors.

Keep backward-compatible re-exports from `src/stores/main.ts` for a short
transition period, then remove them.

## 7. Phase 4 — Split `interfaces/index.ts`

Currently `src/interfaces/index.ts` is a single 1,281-line file. Split it by
domain:

```txt
src/interfaces/
  index.ts          // re-export barrel
  editor.ts
  user.ts
  question.ts
  answer.ts
  article.ts
  submission.ts
  comment.ts
  site.ts
  topic.ts
  notification.ts
  activity.ts
  forms.ts
  channel.ts
  reward.ts
  report.ts
```

Keep `index.ts` re-exporting everything so existing imports continue to work,
then gradually migrate call sites to domain files.

## 8. Phase 5 — Folder and naming hygiene

### 8.1 Component folders

Move loose top-level components into their domain folders:

```txt
components/
  answer/     Answer.vue, AnswerEditor.vue, ...
  article/    ArticlePreview.vue, ArticleColumnCard.vue, ...
  comment/    Comment.vue, CommentBlock.vue, CommentCard.vue, ...
  question/   CreateQuestionForm.vue, ...
  submission/ CreateSubmissionForm.vue, SubmissionPreview.vue, ...
  site/       SiteCard.vue, SiteBtn.vue, SiteSearch.vue, ...
  topic/      TopicCard.vue, TopicSearch.vue, ...
  user/       UserCard.vue, UserGrid.vue, UserLink.vue, ...
  notification/ Notifications.vue, NotificationsManager.vue
```

### 8.2 Views folders

Move auth views to `src/views/auth/`:

```txt
src/views/auth/
  Login.vue
  Signup.vue
  PasswordRecovery.vue
  ResetPassword.vue
  InvitationLink.vue
```

### 8.3 Remove dead code

Confirmed dead or obsolete:

- `src/editorPlugins.ts` — never imported.
- `src/components/__tests__/TestHomeVue.ts` — not collected by Vitest; move to
  `tests/unit/` or delete.
- `src/shims-vuetify.d.ts` — references `vuetify/es5/locale/*`, but the app
  imports `vuetify/locale`.

Also remove unused imports in:

- `src/views/main/Main.vue` (`Event`, `CreateQuestionForm`, `BaseCard`)
- `src/views/main/Dashboard.vue` (`SiteBtn`)
- `src/views/main/Moderation.vue` (`UserSearch`, `AppIcon`)

## 9. Phase 6 — Error handling and async consistency

Adopt a single pattern for async calls in components:

- All API calls go through composables/stores, not raw `api*.then(...)`.
- Fire-and-forget calls should be explicit and caught:

```ts
void apiSubmission.bumpViewsCounter(token.value, submission.value.uuid)
  .catch((err) => logDebug(`bump views failed: ${err}`));
```

Specific files to clean:

- `src/views/main/Dashboard.vue` — six raw `.then()` calls
- `src/views/main/Moderation.vue` — raw `.then()` for webhooks
- `src/views/main/Security.vue` — raw `.then()` for audit logs
- `src/views/main/Article.vue` — raw `.then()` for drafts
- `src/stores/main.ts` — `apiMe.getModeratedSites(token).then(...)`

Also:

- Wrap `JSON.parse` for WebSocket messages in `try/catch` in
  `src/components/Notifications.vue`.
- Add reconnect/backoff logic for the notifications WebSocket.
- `await` or explicitly catch `api.updateNotification` in `readNotif`.

## 10. Phase 7 — Quality gates

- Change the currently-warned rules to errors once cleanup lands:

  - `@typescript-eslint/no-unused-vars`
  - `vue/no-unused-components`

- Add `yarn typecheck` to CI (`vue-tsc --noEmit`).
- Add a CI check that `src/api.ts` contains no HTTP endpoint definitions after
  Phase 1.
- Add unit tests for the fixed sort comparators, `getRecentYears`,
  `vditorUploadOptions`, and `uploadErrorMessage`.
- Keep Vitest collection to `tests/**/*.spec.ts`; delete or move tests inside
  `src/`.

## 11. Suggested PR sequence

1. P0 bug fixes (Phase 0) — one PR per item or a single small PR.
2. Split `src/api.ts` into modules, feature by feature.
3. Split `Dashboard.vue`.
4. Split `interfaces/index.ts`.
5. Split `stores/main.ts`.
6. Component/views folder moves and dead-code removal.
7. Async/error-handling cleanup.
8. Tighten lint/CI.

Each PR should be verifiable with:

```bash
npx --no-install eslint src/
npx --no-install vue-tsc --noEmit -p tsconfig.json
npx --no-install vitest run
npx --no-install vite build
```

## 12. Risks and rollback

- **Behavior parity**: all structural moves are mechanical; verify against
  `preview.cha.fan` with the same data before merging.
- **Vuetify migration traps**: when moving components, keep existing class names
  and props untouched unless they are proven dead. Do not mix visual cleanup
  with structural moves.
- **Imports**: use the `@/` alias for every moved file to minimize churn.
- **Circular imports**: avoid barrel files that re-export from modules with
  side effects; prefer direct imports inside the same domain.
