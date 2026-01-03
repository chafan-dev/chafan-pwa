# Vue 3 Migration Plan

## Overview

This document outlines the migration plan for upgrading from Vue 2.7 to Vue 3.

**Current State:** Vue 2.7.16 with class-based components
**Target State:** Vue 3.x with Composition API
**Estimated Total Effort:** 140-270 hours

---

## Current Progress

**Status:** Phase A - Checkpoint A2 complete

| Task | Status | Components |
|------|--------|------------|
| Core composables | Done | 6 composables |
| Proof-of-concept (UserLink) | Done | 1 component |
| Icon components | Done | 70 components |
| Simple leaf components (A1) | Done | ~15 components |
| Utility & feature components (A2) | Done | 15 components |

**Conversion Progress:** 112 of 143 components (78%) now use Composition API

**Commits:**
- `c1c1b60` - Create composables directory
- `72fef9b` - Convert UserLink.vue
- `6aa0e9c` - Icon batch 1 (A-D)
- `8f72340` - Icon batch 2 (D-H)
- `d1111d4` - Icon batch 3 (H-M)
- `423e607` - Icon batch 4 (M-S)
- `47138e1` - Icon batch 5 (T-W)
- `379fe30` - Migrate some components to Composition API (#464)
- `20ee1a3` - Complete A2: Convert utility and feature components

**A2 Components Converted:**
- `QuestionPreview.vue`, `QuestionUpvotes.vue`, `QuestionInfo.vue`
- `SubmissionUpvotes.vue`, `SiteName.vue`, `ActivitySubject.vue`
- `TopicCard.vue`, `ArticleColumnCard.vue`, `HomeSideCard.vue`
- `FormResponseCard.vue`, `SiteJoinConditions.vue`, `NewInviteLinkBtn.vue`
- `CommentCard.vue`, `UserGrid.vue`, `ExploreSitesGrid.vue`

**Next:** Checkpoint A3 - Convert remaining complex components (31 remaining)

---

## Critical: Vue 2.7 vs Vue 3 Differences

> **⚠️ IMPORTANT:** During Phase A (Vue 2.7), you must be aware of these differences. Code that works in Vue 3 may break in Vue 2.7.

### `$listeners` vs `$attrs`

| Vue Version | Behavior |
|-------------|----------|
| **Vue 2.7** | `$attrs` = non-prop attributes, `$listeners` = event listeners (SEPARATE) |
| **Vue 3** | `$listeners` removed, merged into `$attrs` |

**Phase A (Vue 2.7) - MUST include both:**
```vue
<v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
```

**Phase B (Vue 3) - `$listeners` not needed:**
```vue
<v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
```

**Regression example:** Commit `b7eba36` removed `v-on="$listeners"` from 70 icon components, breaking event forwarding. Fixed in `17252b5`.

---

## Migration Strategy: Hybrid Approach

**The dev team is very small.** This fact drives our strategy:

- A small team cannot afford weeks without user feedback
- A small team cannot debug a massive migration all at once
- A small team needs validation from real users early and often

### Key Insight

Some things CAN be done incrementally on Vue 2.7:
- Converting class components to Composition API (Vue 2.7 supports this!)
- Creating composables to replace CVue base class
- Refactoring component patterns

Some things CANNOT be done incrementally:
- Vue 2 → Vue 3 core switch
- Vuetify 2 → Vuetify 3
- vee-validate 3 → 4

### The Plan

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE A: Preparation (Incremental, stays on Vue 2.7)      │
│  ├── Checkpoint A1: Composables + 20% components           │
│  ├── Checkpoint A2: 50% components converted               │
│  └── Checkpoint A3: 80%+ components converted              │
│  Each checkpoint → Deploy to production                    │
├─────────────────────────────────────────────────────────────┤
│  PHASE B: Vue 3 Switch (Big Bang)                          │
│  └── Checkpoint B1: Full Vue 3 + all dependencies          │
│  Single deployment (but much smaller scope)                │
└─────────────────────────────────────────────────────────────┘
```

**Why this works:**
1. User feedback on converted components before committing to Vue 3
2. If issues arise, fix them while still on stable Vue 2.7
3. The Vue 3 switch becomes mostly dependency changes, not code rewrites
4. Each checkpoint is genuinely useful - not artificial splitting
5. If the team needs to pause, there are stable checkpoints

---

## Phase A: Preparation (On Vue 2.7)

All work in Phase A stays on Vue 2.7.16. Each checkpoint is production-ready and can be deployed independently. Users will not notice any functional changes.

---

### Checkpoint A1: Foundation ✅ COMPLETE

**Goal:** Create composables and convert ~20% of components (leaf components)

**Deliverables:**
- [x] Create `src/composables/` directory with core composables *(done: c1c1b60)*
- [x] Convert proof-of-concept component: `UserLink.vue` *(done: 72fef9b)*
- [x] Convert icon components (71 files, split into 5 batches):
  - [x] Batch 1 (A-D): AccountCircleOutlineIcon → DotsIcon (17 files) *(done: 6aa0e9c)*
  - [x] Batch 2 (D-H): DownIcon → HistoryIcon (14 files) *(done: 8f72340)*
  - [x] Batch 3 (H-M): HomeFabIcon → MoreIcon (13 files) *(done: d1111d4)*
  - [x] Batch 4 (M-S): MuteNotificationIcon → SiteIcon (18 files) *(done: 423e607)*
  - [x] Batch 5 (T-W): ToBookmarkIcon → WebIcon (8 files) *(done: 47138e1)*
- [x] Convert simple leaf components *(done: 379fe30)*
- [ ] Update `chafan-vue-editors` for Composition API (if owned)

**Deployed to production.**

#### A1.1 Create Core Composables

Create `src/composables/useAuth.ts`:
```typescript
import { computed } from 'vue';
import { readMainToken, readUserProfile, readLoggedIn } from '@/store/main/getters';
import store from '@/store';

export function useAuth() {
  const token = computed(() => readMainToken(store));
  const loggedIn = computed(() => readLoggedIn(store));
  const currentUserId = computed(() => readUserProfile(store)?.uuid);
  const userProfile = computed(() => readUserProfile(store));

  return {
    token,
    loggedIn,
    currentUserId,
    userProfile,
  };
}
```

Create `src/composables/useTheme.ts`:
```typescript
import { computed } from 'vue';
import store from '@/store';

export function useTheme() {
  const theme = computed(() => store.state.main.theme);
  return { theme };
}
```

Create `src/composables/useResponsive.ts`:
```typescript
import { computed } from 'vue';
import vuetify from '@/plugins/vuetify';

export function useResponsive() {
  // Vue 2 Vuetify approach
  const isDesktop = computed(() => vuetify.framework.breakpoint.mdAndUp);
  const isMobile = computed(() => vuetify.framework.breakpoint.smAndDown);

  return { isDesktop, isMobile };
}
```

Create `src/composables/useDayjs.ts`:
```typescript
import dayjs from 'dayjs';

export function useDayjs() {
  return dayjs;
}
```

Create `src/composables/index.ts`:
```typescript
export * from './useAuth';
export * from './useTheme';
export * from './useResponsive';
export * from './useDayjs';
```

#### A1.2 Convert Icon Components

All 74 icon components follow the same pattern. Convert from:

```typescript
// Before: Class component
import { Component } from 'vue-property-decorator';
import { CVue } from '@/common';
import { mdiAccount } from '@mdi/js';

@Component
export default class AccountIcon extends CVue {
  private svgPath = mdiAccount;
}
```

To:

```vue
<!-- After: Composition API (works in Vue 2.7) -->
<template>
  <!-- NOTE: v-on="$listeners" is required in Vue 2.7, see "Critical: Vue 2.7 vs Vue 3 Differences" -->
  <v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
</template>

<script setup lang="ts">
import { mdiAccount } from '@mdi/js';

const svgPath = mdiAccount;
</script>
```

**Files to convert:**
- `src/components/*Icon.vue` (all icon components)

#### A1.3 Convert Simple Leaf Components

Components with no child dependencies:
- `src/components/UserLink.vue`
- `src/components/SiteBtn.vue`
- `src/components/Upvote.vue`
- `src/components/LikeBtn.vue`
- Other simple components without children

#### A1.4 Verification Checklist

Before deploying Checkpoint A1:
- [ ] All converted components work correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build succeeds
- [ ] Existing tests pass

---

### Checkpoint A2: Core Components ✅ COMPLETE

**Goal:** Convert ~50% of components (utility and some feature components)

**Deliverables:**
- [x] Convert utility components
- [x] Convert simpler feature components
- [x] Begin reducing CVue usage

**Deployed to production.**

#### A2.1 Convert Utility Components

- [x] `src/components/Viewer.vue` *(done: 379fe30)*
- [x] `src/components/SimpleEditor.vue` *(done: 379fe30)*
- [x] `src/components/Invite.vue` *(done: 379fe30)*
- [x] `src/components/ShareCardButton.vue` *(done: 379fe30)*
- [x] `src/components/Event.vue` *(done: 379fe30)*

#### A2.2 Convert Search Components

Note: These use `.sync` modifier which still works in Vue 2.7

- [x] `src/components/TopicSearch.vue` *(done: 379fe30)*
- [x] `src/components/UserSearch.vue` *(done: 379fe30)*
- [x] `src/components/SiteSearch.vue` *(done: 379fe30)*

#### A2.3 Convert Simpler Feature Components

- [x] `src/components/CommentBlock.vue` *(done: 379fe30)*
- [x] `src/components/Comment.vue` *(done: 379fe30)*
- [x] `src/components/question/QuestionPreview.vue` *(done: this commit)*
- [x] `src/components/ArticlePreview.vue` *(done: 379fe30)*
- [x] `src/components/SubmissionPreview.vue` *(done: 379fe30)*

#### A2.4 Additional Components Converted

- [x] `src/components/question/QuestionUpvotes.vue`
- [x] `src/components/question/QuestionInfo.vue`
- [x] `src/components/submission/SubmissionUpvotes.vue`
- [x] `src/components/SiteName.vue`
- [x] `src/components/ActivitySubject.vue`
- [x] `src/components/TopicCard.vue`
- [x] `src/components/ArticleColumnCard.vue`
- [x] `src/components/HomeSideCard.vue`
- [x] `src/components/FormResponseCard.vue`
- [x] `src/components/SiteJoinConditions.vue`
- [x] `src/components/NewInviteLinkBtn.vue`
- [x] `src/components/CommentCard.vue`
- [x] `src/components/UserGrid.vue`
- [x] `src/components/ExploreSitesGrid.vue`

#### A2.5 Migration Pattern Reference

**Before (Class Component):**
```typescript
import { Component, Prop, Watch } from 'vue-property-decorator';
import { CVue } from '@/common';

@Component({ components: { ChildComponent } })
export default class MyComponent extends CVue {
  @Prop() private readonly itemId!: string;
  @Prop({ default: false }) private readonly showDetails!: boolean;

  private loading = false;
  private data: IData | null = null;

  get formattedData() {
    return this.data?.name ?? 'N/A';
  }

  @Watch('itemId')
  private onItemIdChange(newVal: string) {
    this.fetchData();
  }

  private async mounted() {
    await this.fetchData();
  }

  private async fetchData() {
    this.loading = true;
    this.data = await api.getData(this.token, this.itemId);
    this.loading = false;
  }

  private handleClick() {
    this.$emit('clicked', this.data);
  }
}
```

**After (Composition API - works in Vue 2.7):**
```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuth } from '@/composables';
import ChildComponent from './ChildComponent.vue';

const props = withDefaults(defineProps<{
  itemId: string;
  showDetails?: boolean;
}>(), {
  showDetails: false,
});

const emit = defineEmits<{
  (e: 'clicked', data: IData | null): void;
}>();

const { token } = useAuth();

const loading = ref(false);
const data = ref<IData | null>(null);

const formattedData = computed(() => data.value?.name ?? 'N/A');

watch(() => props.itemId, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});

async function fetchData() {
  loading.value = true;
  data.value = await api.getData(token.value, props.itemId);
  loading.value = false;
}

function handleClick() {
  emit('clicked', data.value);
}
</script>
```

#### A2.6 Verification Checklist

Before deploying Checkpoint A2:
- [x] All converted components work correctly
- [x] Component interactions work (parent-child communication)
- [x] No TypeScript errors (existing unrelated type conflicts in node_modules)
- [x] No console errors
- [x] Build succeeds (requires .env file for VUE_APP_NAME)
- [x] Existing tests pass (144/144 tests passing)

---

### Checkpoint A3: Feature Components & Views

**Goal:** Convert 80%+ of components, nearly eliminate CVue usage

**Deliverables:**
- [ ] Convert all remaining feature components
- [ ] Convert view components
- [ ] Convert filter to function
- [ ] Deprecate or remove CVue base class usage

**Deploy to production when complete.**

#### A3.1 Convert Complex Feature Components

- `src/components/Answer.vue`
- `src/components/Question.vue`
- `src/components/Article.vue`
- `src/components/Submission.vue`
- `src/components/AnswerEditor.vue`
- `src/components/QuestionEditor.vue`

#### A3.2 Convert View Components

- `src/views/main/Home.vue`
- `src/views/main/Question.vue`
- `src/views/main/Article.vue`
- `src/views/main/User.vue`
- `src/views/main/Site.vue`
- All other view components in `src/views/`

#### A3.3 Convert Filter to Function

**File:** `src/components/home/UserFeed.vue`

**Before:**
```typescript
@Component({
  filters: {
    activityVerbCN(value) {
      switch (value) {
        case 'follow_user': return '关注了用户';
        case 'upvote_answer': return '赞了回答';
        // ...
      }
    },
  },
})
```

Template: `{{ activity.verb | activityVerbCN }}`

**After:**
```typescript
function activityVerbCN(value: string): string {
  switch (value) {
    case 'follow_user': return '关注了用户';
    case 'upvote_answer': return '赞了回答';
    // ...
    default: return value;
  }
}
```

Template: `{{ activityVerbCN(activity.verb) }}`

#### A3.4 Convert App.vue

Convert `src/App.vue` last, as it's the root component.

#### A3.5 Deprecate CVue Base Class

By end of A3, the `CVue` class in `src/common.ts` should have minimal or no usage. All components should use composables instead.

#### A3.6 Verification Checklist

Before deploying Checkpoint A3:
- [ ] 80%+ components converted to Composition API
- [ ] CVue class usage eliminated or minimal
- [ ] All features work correctly
- [ ] All user flows tested
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build succeeds
- [ ] All tests pass

**After A3, the codebase is "Vue 3 ready" while still running on Vue 2.7.**

---

## Phase B: Vue 3 Switch (Big Bang)

Phase B is necessarily a big bang deployment. However, because Phase A did most of the hard work, this phase is primarily about updating dependencies and configuration.

---

### Checkpoint B1: Full Vue 3 Migration

**Goal:** Switch to Vue 3 and all related dependencies

**Deliverables:**
- [ ] Update to Vue 3
- [ ] Update to Vue Router 4
- [ ] Migrate to Pinia (or Vuex 4)
- [ ] Update to Vuetify 3
- [ ] Update to vee-validate 4
- [ ] Update to vue-i18n 9
- [ ] Update build tooling
- [ ] Final cleanup

**Deploy to production when complete.**

#### B1.1 Update Package Dependencies

Update `package.json`:
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "vuetify": "^3.4.0",
    "vee-validate": "^4.12.0",
    "vue-i18n": "^9.9.0",
    "@sentry/vue": "^7.119.2"
  },
  "devDependencies": {
    "@vue/compiler-sfc": "^3.4.0",
    "@vue/test-utils": "^2.4.0",
    "@vue/vue3-jest": "^29.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"
  }
}
```

**Remove:**
- `vue-template-compiler`
- `vue-class-component`
- `vue-property-decorator`
- `typesafe-vuex`
- `vue-jest`

#### B1.2 Migrate to Vite (Recommended)

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      // PWA config migrated from vue.config.js
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      sass: {
        // Migrate SASS options from vue.config.js
      },
    },
  },
});
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

Remove `vue.config.js` after migration.

#### B1.3 Update TypeScript Configuration

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM"],
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Update `src/shims-vue.d.ts`:
```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

Remove `experimentalDecorators` from tsconfig (no longer needed).

#### B1.4 Update Application Bootstrap

Update `src/main.ts`:

**Before:**
```typescript
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
// ... other imports

Vue.use(Router);
Vue.use(Vuex);
// ... other Vue.use()

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
```

**After:**
```typescript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import vuetify from './plugins/vuetify';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(vuetify);

app.mount('#app');
```

#### B1.5 Migrate Vue Router

Update `src/router.ts`:

**Before:**
```typescript
import Router, { RouteConfig } from 'vue-router';
Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
```

**After:**
```typescript
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // ... routes (mostly unchanged)
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

Remove `src/component-hooks.ts` - no longer needed.

#### B1.6 Migrate to Pinia

Create `src/stores/main.ts`:
```typescript
import { defineStore } from 'pinia';
import { api } from '@/api';

interface MainState {
  token: string;
  userProfile: IUserProfile | null;
  theme: 'light' | 'dark';
  // ... other state from current Vuex store
}

export const useMainStore = defineStore('main', {
  state: (): MainState => ({
    token: '',
    userProfile: null,
    theme: 'light',
    // ... migrate from src/store/main/state.ts
  }),

  getters: {
    loggedIn: (state) => !!state.token,
    // ... migrate from src/store/main/getters.ts
  },

  actions: {
    async login(payload: { username: string; password: string }) {
      // ... migrate from src/store/main/actions.ts
    },
    // ... other actions
  },
});
```

Update composables to use Pinia:
```typescript
// src/composables/useAuth.ts
import { storeToRefs } from 'pinia';
import { useMainStore } from '@/stores/main';

export function useAuth() {
  const store = useMainStore();
  const { token, userProfile } = storeToRefs(store);

  const loggedIn = computed(() => store.loggedIn);
  const currentUserId = computed(() => userProfile.value?.uuid);

  return {
    token,
    loggedIn,
    currentUserId,
    userProfile,
  };
}
```

#### B1.7 Migrate Vuetify to v3

Create `src/plugins/vuetify.ts`:
```typescript
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        // Migrate from current theme config
      },
      dark: {
        // Migrate from current theme config
      },
    },
  },
});
```

**Key Vuetify 3 Changes:**

| Vuetify 2 | Vuetify 3 |
|-----------|-----------|
| `v-content` | `v-main` |
| `v-list-item-content` | Removed (use slots) |
| `@change` on inputs | `@update:model-value` |
| `value` prop | `model-value` prop |
| `:search-input.sync` | `v-model:search` |

Update composable for Vuetify 3:
```typescript
// src/composables/useResponsive.ts
import { useDisplay } from 'vuetify';

export function useResponsive() {
  const display = useDisplay();

  const isDesktop = computed(() => display.mdAndUp.value);
  const isMobile = computed(() => display.smAndDown.value);

  return { isDesktop, isMobile };
}
```

#### B1.8 Migrate vee-validate to v4

**Before (vee-validate 3):**
```vue
<template>
  <ValidationObserver v-slot="{ handleSubmit }">
    <ValidationProvider v-slot="{ errors }" rules="required">
      <v-text-field v-model="name" :error-messages="errors" />
    </ValidationProvider>
    <v-btn @click="handleSubmit(onSubmit)">Submit</v-btn>
  </ValidationObserver>
</template>

<script>
import { ValidationObserver, ValidationProvider } from 'vee-validate';
</script>
```

**After (vee-validate 4):**
```vue
<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required(),
});

const { handleSubmit } = useForm({ validationSchema: schema });
const { value: name, errorMessage: nameError } = useField('name');

const onSubmit = handleSubmit((values) => {
  // Handle form submission
});
</script>

<template>
  <v-text-field v-model="name" :error-messages="nameError" />
  <v-btn @click="onSubmit">Submit</v-btn>
</template>
```

#### B1.9 Migrate vue-i18n to v9

Update `src/i18n.ts`:

**Before:**
```typescript
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

export default new VueI18n({
  locale: 'zh',
  messages,
});
```

**After:**
```typescript
import { createI18n } from 'vue-i18n';

export const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages,
});
```

Usage in components:
```typescript
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
// Use t('key') instead of this.$t('key')
```

#### B1.10 Update $listeners Usage

In Vue 3, `$listeners` is merged into `$attrs`. Update all 74 icon components:

**Before:**
```vue
<v-icon v-bind="$attrs" v-on="$listeners">{{ svgPath }}</v-icon>
```

**After:**
```vue
<v-icon v-bind="$attrs">{{ svgPath }}</v-icon>
```

#### B1.11 Final Cleanup

- [ ] Remove `src/common.ts` (CVue base class)
- [ ] Remove `src/component-hooks.ts`
- [ ] Remove old Vuex store files in `src/store/`
- [ ] Update any remaining lifecycle hooks:
  - `beforeDestroy` → `onBeforeUnmount`
  - `destroyed` → `onUnmounted`
- [ ] Remove deprecated packages from `package.json`

#### B1.12 Update Tests

Update test configuration for Vue 3:

```typescript
// In test files
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

const wrapper = shallowMount(Component, {
  props: { prop: 'value' },
  global: {
    plugins: [createTestingPinia()],
  },
});
```

#### B1.13 Verification Checklist

Before deploying Checkpoint B1:
- [ ] Application boots without errors
- [ ] All routes work correctly
- [ ] Authentication flow works
- [ ] All forms validate correctly
- [ ] Theme switching works
- [ ] i18n works correctly
- [ ] All major features tested
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Build succeeds
- [ ] All tests pass
- [ ] Performance is acceptable

---

## Migration Checklists

### Phase A: Checkpoint Summary

| Checkpoint | Components | CVue Usage | Prod Deploy |
|------------|------------|------------|-------------|
| A1 | ~20% converted | Still used | Yes |
| A2 | ~50% converted | Reduced | Yes |
| A3 | ~80%+ converted | Minimal/None | Yes |

### Phase B: Dependency Updates

| Package | Before | After |
|---------|--------|-------|
| vue | 2.7.16 | 3.4.x |
| vue-router | 3.6.5 | 4.2.x |
| vuex | 3.6.2 | Pinia 2.x |
| vuetify | 2.7.2 | 3.4.x |
| vee-validate | 3.4.15 | 4.12.x |
| vue-i18n | 8.28.2 | 9.9.x |
| @vue/test-utils | 1.3.6 | 2.4.x |

### Final Verification

- [ ] All user-facing features work
- [ ] Mobile responsive design works
- [ ] PWA functionality works
- [ ] Performance metrics acceptable
- [ ] No accessibility regressions
- [ ] SEO-critical pages render correctly

---

## Risk Mitigation

1. **Phase A provides safety net** - if Vue 3 migration fails, roll back to A3 checkpoint
2. **User feedback during Phase A** - catch issues before committing to Vue 3
3. **Keep Vue 2 branch tagged** - can always reference or restore
4. **Test thoroughly at each checkpoint** - don't accumulate technical debt
5. **External dependency first** - ensure `chafan-vue-editors` is ready before Phase B

---

## Timeline Considerations

**The dev team is very small.** Do not set rigid timelines. Instead:

- Work on Phase A checkpoints as capacity allows
- Deploy each checkpoint when ready (no artificial deadlines)
- Only start Phase B when:
  - Phase A is complete and stable in production
  - `chafan-vue-editors` supports Vue 3
  - Team has bandwidth for intensive testing

---

## Resources

- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Vue 2.7 Composition API](https://blog.vuejs.org/posts/vue-2-7-naruto.html)
- [Vue Router 4 Migration](https://router.vuejs.org/guide/migration/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vuetify 3 Migration](https://vuetifyjs.com/en/getting-started/upgrade-guide/)
- [vee-validate 4 Migration](https://vee-validate.logaretm.com/v4/guide/overview/)
- [vue-i18n 9 Migration](https://vue-i18n.intlify.dev/guide/migration/vue3.html)
- [Vite Documentation](https://vitejs.dev/)
