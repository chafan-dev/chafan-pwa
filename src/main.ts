import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Import Component hooks before component definitions
import './component-hooks';
import Vue from 'vue';
import 'intersection-observer';

// styles
import './styles/app.scss';

// plugins
import vuetify from './plugins/vuetify';
import './plugins/vee-validate';

import ChafanVueEditors from 'chafan-vue-editors';
import Dayjs from '@/dayjsPlugin';
import editorPlugins from '@/editorPlugins';
import VueI18n from 'vue-i18n';
import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';
import { sentryDSN } from '@/env';
import App from './App.vue';
import router from './router';
import store from '@/store';
import './registerServiceWorker';
import 'vuetify/dist/vuetify.min.css';

Vue.use(ChafanVueEditors);

Vue.use(Dayjs);

Vue.use(editorPlugins);

declare module 'vue/types/vue' {
  interface Vue {
    $dayjs: any;
  }
}

Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    zh: {
      'verb.answer_update': '{who}更新了回答「{question}」：「{answer}」',
      'verb.create_article': '{who}创建了文章「{article}」',
      'verb.create_question': '{who}创建了问题「{question}」',
      'verb.follow_article_column': '{who}关注了专栏「{article_column}」',
      'verb.upvote_answer': '{who}赞了回答「{answer}」(所属问题：「{question}」)',
      'verb.upvote_article': '{who}赞了文章「{article}」',
      'verb.upvote_question': '{who}赞了问题「{question}」',
      'verb.invite_new_user': '{who}邀请了新用户加入',
      'verb.invite_join_site': '{who}邀请了{user}加入「{site}」',
      'verb.answer_question': '{who}添加了新回答「{answer}」（所属问题：「{question}」）',
      'verb.comment_question': '{who}添加了新评论「{comment}」（所属问题：「{question}」）',
      'verb.edit_question': '{who}编辑了问题「{question}」',
      'verb.reply_comment': '{who}添加了新回复「{reply}」（所属评论：「{parent_comment}」）',
      'verb.mentioned_in_comment': '{who}在评论中提到了你：「{comment}」。',
      'verb.invite_answer': '{who}邀请{user}回答问题「{question}」',
      'verb.system_send_invitation': '系统已发送邀请邮件给 {invited_email}',
      'verb.apply_join_site': '{who}申请加入圈子「{site}」',
      'verb.comment_answer': '{who}添加了新评论「{comment}」（所属回答：「{answer}」）',
      'verb.comment_article': '{who}添加了新评论「{comment}」（所属文章：「{article}」）',
      'verb.follow_user': '{who}关注了{user}',
      'verb.system_broadcast': '📢 系统广播：{message}',
      'verb.site_broadcast': '📢 圈子「{site}」广播：{submission}',
      'verb.create_message': '{who} 有新的{channel_message}',
      'verb.invited_user_activated': '你邀请的用户 {invited_email} 已激活账户{remark}.',
      'verb.remark.invited_user_activated': '',
      'verb.create_answer_question_reward':
        '{who}为邀请你回答「{question}」而创建了{reward_coin_amount}个硬币的奖励',
      'verb.claim_answer_question_reward':
        '{who} 兑换了回答问题「{question}」的{reward_coin_amount}个硬币的奖励',
      'verb.create_submission': '{who}创建了分享「{submission}」',
      'verb.create_submission_suggestion': '{who}添加了对分享的建议编辑「{submission_suggestion}」',
      'verb.accept_submission_suggestion': '{who}采纳了对分享的建议编辑「{submission_suggestion}」',
      'verb.create_site': '{who}创建了圈子「{site}」',
      'verb.upvote_submission': '{who}赞了分享「{submission}」',
      'verb.comment_submission': '{who}评论了你的分享「{submission}」：「{comment}」',
      'verb.create_site_need_approval': '{who}申请创建圈子（{channel_message}）',
    },
  },
});

if (sentryDSN) {
  Sentry.init({
    Vue,
    dsn: sentryDSN,
    autoSessionTracking: true,
    integrations: [new Integrations.BrowserTracing()],

    tracesSampleRate: 0.2,

    tracingOptions: {
      trackComponents: true,
    },
  });
}

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount('#app');
