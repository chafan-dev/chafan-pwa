import Vue from 'vue';
import Router from 'vue-router';

import RouterComponent from './components/RouterComponent.vue';
import { constants } from '@/common';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import(/* webpackChunkName: "main" */ './views/main/Main.vue'),
      children: [
        {
          path: '',
          component: () => import(/* webpackChunkName: "main-home" */ './views/main/Home.vue'),
        },
        {
          path: 'explore/',
          meta: {
            title: constants.explore,
          },
          component: () => import(/* webpackChunkName: "main-sites" */ './views/main/Explore.vue'),
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
          component: () =>
            import(/* webpackChunkName: "main-articles" */ './views/main/Article.vue'),
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
          component: () =>
            import(/* webpackChunkName: "main-channels" */ './views/main/Channel.vue'),
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
      ],
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
      component: () =>
        import(/* webpackChunkName: "invitation-link" */ './views/InvitationLink.vue'),
    },
    {
      path: '/main/*',
      redirect: (to) => {
        return to.fullPath.substring('/main'.length);
      },
    },
    {
      path: '/*',
      redirect: '/',
    },
  ],
});
