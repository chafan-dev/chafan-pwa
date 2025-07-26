import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';

import RouterComponent from './components/RouterComponent.vue';
import { constants } from '@/common';

Vue.use(Router);

const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "main" */ './views/main/Main.vue'),
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "main-home" */ './views/main/Home.vue'),
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
        component: () => import(/* webpackChunkName: "main-sites" */ './views/main/Explore.vue'),
      },
      {
        path: 'search/',
        meta: {
          title: constants.search_results,
        },
        component: () => import(/* webpackChunkName: "main-search" */ './views/main/Search.vue'),
      },
      {
        name: 'site',
        path: 'sites/:subdomain',
        component: () => import(/* webpackChunkName: "main-site" */ './views/main/Site.vue'),
      },
      {
        name: 'article-column',
        path: 'article-columns/:id',
        component: () =>
          import(/* webpackChunkName: "main-article-columns" */ './views/main/ArticleColumn.vue'),
      },
      {
        name: 'article',
        path: 'articles/:id',
        component: () => import(/* webpackChunkName: "main-articles" */ './views/main/Article.vue'),
        children: [
          {
            path: 'comments/:article_comment_id',
            component: () =>
              import(/* webpackChunkName: "main-articles" */ './views/main/Article.vue'),
          },
        ],
      },
      {
        name: 'submission',
        path: 'submissions/:id',
        component: () =>
          import(/* webpackChunkName: "main-submissions" */ './views/main/Submission.vue'),
        children: [
          {
            path: 'comments/:submission_comment_id',
            component: () =>
              import(/* webpackChunkName: "main-submissions" */ './views/main/Submission.vue'),
          },
          {
            path: 'suggestions/:submission_suggestion_id',
            component: () =>
              import(/* webpackChunkName: "main-submissions" */ './views/main/Submission.vue'),
          },
        ],
      },
      {
        name: 'question',
        path: 'questions/:id',
        component: () =>
          import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
        children: [
          {
            path: 'answers/:aid',
            component: () =>
              import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
            children: [
              {
                path: 'comments/:acid',
                component: () =>
                  import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
              },
              {
                path: 'suggestions/:asid',
                component: () =>
                  import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
              },
            ],
          },
          {
            path: 'comments/:qcid',
            component: () =>
              import(/* webpackChunkName: "main-questions" */ './views/main/Question.vue'),
          },
        ],
      },
      {
        path: 'article-editor',
        component: () =>
          import(/* webpackChunkName: "main-article-editor" */ './views/main/ArticleEditor.vue'),
      },
      {
        name: 'topic',
        path: 'topics/:id',
        component: () => import(/* webpackChunkName: "main-topics" */ './views/main/Topic.vue'),
      },
      {
        name: 'user',
        path: 'users/:handle',
        component: () => import(/* webpackChunkName: "main-users" */ './views/main/User.vue'),
      },
      {
        path: 'forms/:uuid',
        component: () => import(/* webpackChunkName: "main-forms" */ './views/main/Form.vue'),
      },
      {
        name: 'channel',
        path: 'channels/:id',
        component: () => import(/* webpackChunkName: "main-channels" */ './views/main/Chat.vue'),
      },
      {
        path: 'dashboard',
        meta: {
          title: constants.dashboard,
        },
        component: () =>
          import(/* webpackChunkName: "main-dashboard" */ './views/main/Dashboard.vue'),
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
                /* webpackChunkName: "main-profile-edit" */ './views/main/profile/UserProfileEdit.vue'
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
          import(/* webpackChunkName: "main-security" */ './views/main/Security.vue'),
      },
      {
        path: 'moderation',
        meta: {
          title: constants.moderate_circles,
        },
        component: () =>
          import(/* webpackChunkName: "main-moderation" */ './views/main/Moderation.vue'),
      },
    ] /* children of main */,
  },
  {
    path: '/login',
    meta: {
      title: constants.login,
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "login" */ './views/auth/Login.vue'),
  },
  {
    path: '/signup',
    meta: {
      title: constants.signup,
    },
    component: () => import(/* webpackChunkName: "signup" */ './views/Signup.vue'),
  },
  {
    path: '/recover-password',
    meta: {
      title: constants.recover_password,
    },
    component: () =>
      import(/* webpackChunkName: "recover-password" */ './views/PasswordRecovery.vue'),
  },
  {
    path: '/invitation-links/:uuid',
    meta: {
      title: constants.invitation_to_join,
    },
    component: () => import(/* webpackChunkName: "invitation-link" */ './views/InvitationLink.vue'),
  },
  {
    path: '/reset-password',
    meta: {
      title: constants.reset_password,
    },
    component: () => import(/* webpackChunkName: "reset-password" */ './views/ResetPassword.vue'),
  },
];

routes.push({
  path: '/showcase',
  component: () => import(/* webpackChunkName: "Showcase" */ './views/Showcase.vue'),
});

routes.push(
  {
    path: '/main/*',
    redirect: (to) => {
      return to.fullPath.substring('/main'.length);
    },
  },
  {
    path: '/*',
    redirect: '/',
  }
);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: routes,
});
