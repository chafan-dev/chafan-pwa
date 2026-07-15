import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import RouterComponent from './components/RouterComponent.vue';
import { constants } from '@/common';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./views/main/Main.vue'),
    children: [
      {
        path: '',
        component: () => import('./views/main/Home.vue'),
      },
      {
        path: '/simple/create_article',
        meta: {
          title: 'Create Article',
        },
        component: () => import('./views/simple/CreateArticle.vue'),
      },
      {
        path: 'explore/',
        meta: {
          title: constants.explore,
        },
        component: () => import('./views/main/Explore.vue'),
      },
      {
        path: 'search/',
        meta: {
          title: constants.search_results,
        },
        component: () => import('./views/main/Search.vue'),
      },
      {
        name: 'site',
        path: 'sites/:subdomain',
        component: () => import('./views/main/Site.vue'),
      },
      {
        name: 'article-column',
        path: 'article-columns/:id',
        component: () =>
          import('./views/main/ArticleColumn.vue'),
      },
      {
        name: 'article',
        path: 'articles/:id',
        component: () => import('./views/main/Article.vue'),
        children: [
          {
            path: 'comments/:article_comment_id',
            component: () =>
              import('./views/main/Article.vue'),
          },
        ],
      },
      {
        name: 'submission',
        path: 'submissions/:id',
        component: () =>
          import('./views/main/Submission.vue'),
        children: [
          {
            path: 'comments/:submission_comment_id',
            component: () =>
              import('./views/main/Submission.vue'),
          },
          {
            path: 'suggestions/:submission_suggestion_id',
            component: () =>
              import('./views/main/Submission.vue'),
          },
        ],
      },
      {
        name: 'question',
        path: 'questions/:id',
        component: () =>
          import('./views/main/Question.vue'),
        children: [
          {
            path: 'answers/:aid',
            component: () =>
              import('./views/main/Question.vue'),
            children: [
              {
                path: 'comments/:acid',
                component: () =>
                  import('./views/main/Question.vue'),
              },
              {
                path: 'suggestions/:asid',
                component: () =>
                  import('./views/main/Question.vue'),
              },
            ],
          },
          {
            path: 'comments/:qcid',
            component: () =>
              import('./views/main/Question.vue'),
          },
        ],
      },
      {
        path: 'article-editor',
        component: () =>
          import('./views/main/ArticleEditor.vue'),
      },
      {
        name: 'topic',
        path: 'topics/:id',
        component: () => import('./views/main/Topic.vue'),
      },
      {
        name: 'user',
        path: 'users/:handle',
        component: () => import('./views/main/User.vue'),
      },
      {
        path: 'forms/:uuid',
        component: () => import('./views/main/Form.vue'),
      },
      {
        name: 'channel',
        path: 'channels/:id',
        component: () => import('./views/main/Chat.vue'),
      },
      {
        path: 'dashboard',
        meta: {
          title: constants.dashboard,
        },
        component: () =>
          import('./views/main/Dashboard.vue'),
      },
      {
        path: 'profile',
        component: RouterComponent,
        meta: {
          title: constants.profile,
        },
        children: [
          {
            path: 'edit',
            meta: {
              title: constants.edit_profile,
            },
            component: () =>
              import(
                './views/main/profile/UserProfileEdit.vue'
              ),
          },
        ],
      },
      {
        path: 'security',
        meta: {
          title: constants.security_center,
        },
        component: () =>
          import('./views/main/Security.vue'),
      },
      {
        path: 'moderation',
        meta: {
          title: constants.moderate_circles,
        },
        component: () =>
          import('./views/main/Moderation.vue'),
      },
    ] /* children of main */,
  },
  {
    path: '/login',
    meta: {
      title: constants.login,
    },
    component: () => import('./views/auth/Login.vue'),
  },
  {
    path: '/signup',
    meta: {
      title: constants.signup,
    },
    component: () => import('./views/Signup.vue'),
  },
  {
    path: '/recover-password',
    meta: {
      title: constants.recover_password,
    },
    component: () =>
      import('./views/PasswordRecovery.vue'),
  },
  {
    path: '/invitation-links/:uuid',
    meta: {
      title: constants.invitation_to_join,
    },
    component: () => import('./views/InvitationLink.vue'),
  },
  {
    path: '/reset-password',
    meta: {
      title: constants.reset_password,
    },
    component: () => import('./views/ResetPassword.vue'),
  },
  {
    path: '/showcase',
    component: () => import('./views/Showcase.vue'),
  },
  {
    path: '/main/:pathMatch(.*)*',
    redirect: (to) => to.fullPath.substring('/main'.length),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
