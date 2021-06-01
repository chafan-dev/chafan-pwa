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

Vue.use(ChafanVueEditors);

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
    en: {
      'answered question': 'answered question',
      follows: 'followed',
      'upvotes answer': 'upvoted answer',
      'creates question': 'created question',
      'Explore Circles': 'Explore Circles',
      'Pinned questions': 'Pinned questions',
      'Submit comment': 'Submit comment',
      'Only Circle member can comment': 'Only Circle member can comment',
      'No comments for now': 'No comments for now',
      'No questions for now': 'No questions for now',
      'Comments in total': '{total} comments in total:',
      'Write comment': 'Write comment',
      展开全文: 'More',
      '所属问题：': 'Parent question:',
      内容已被管理员隐藏: 'Content is hidden by moderator',
      已赞: 'Upvoted',
      赞: 'Upvote',
      查看评论: 'Comments',
      查看n条评论: '{amount} comments',
      评论: 'Comment',
      添加评论: 'New commment',
      已收藏: 'Bookmarked',
      收藏: 'Bookmark',
      收起: 'Fold',
      编辑: 'Edit',
      新页面打开: 'Opne in new page',
      已被阅读n次: 'Read by {times} people',
      '管理：': 'Moderate:',
      取消隐藏: 'Un-hide',
      隐藏: 'Hide',
      Language: 'Language',
      'Main menu': 'Main menu',
      Home: 'Home',
      Dashboard: 'Dashboard',
      'Edit Profile': 'Edit Profile',
      'Change Password': 'Change Password',
      Logout: 'Logout',
      Collapse: 'Collapse',
      个人资料: 'My Profile',
      'Full Name': 'Display name',
      个人简介: 'Self Introduction',
      居住过的地方: 'Places I lived',
      所在行业: 'Occupation/Industry',
      教育经历: 'Education experiences',
      工作经历: 'Work experiences',
      删除: 'Delete',
      学校名: 'School name',
      教育水平: 'Level',
      添加: 'Add',
      机构名: 'Organization',
      职位名: 'Position',
      high_school_or_lower: 'High school or lower',
      dazhuan: 'Da Zhuan',
      bachelor: "Bachelor's",
      master: "Master's",
      phd_or_higher: 'PhD or higher',
      Cancel: 'Cancel',
      Reset: 'Reset',
      Save: 'Save',
      Send: 'Send',
      'Edit User Profile': 'Edit User Profile',
      Password: 'Password',
      'Password confirmation': 'Password confirmation',
      Email: 'Email',
      硬币数量: 'Coins',
      'Joined Circles': 'Joined Circles',
      'My questions': 'Contributed questions',
      我写的答案: 'Contributed answers',
      'Authored answers': 'Authored answers',
      关注的话题: 'Followed topics',
      收藏的答案: 'Bookmarked answers',
      未读通知: 'Unread notifications',
      标记为已读: 'Mark as read',
      'Create new channel': 'Create new channel',
      聊天室名称: 'Channel name',
      创建: 'Create',
      'Joined channels': 'Joined channels',
      暂无历史消息: 'No past messages',
      我: 'Me',
      I: 'I',
      新消息: 'New message',
      '聊天室：': 'Channel:',
      'Members:': 'Members:',
      '(管理员)': '(admin)',
      拉人: 'Invite',
      'User ID': 'User ID',
      '圈子：': 'Circle:',
      '简介：': 'Introduction:',
      '规则：': 'Policies:',
      '类型：': 'Type:',
      所有注册用户可读: 'Any registered user can read',
      所有注册用户可提问: 'Any registered user can ask',
      所有注册用户可答: 'Any registered user can answer',
      所有注册用户可评: 'Any registered user can comment',
      仅社区成员可读: 'Only Circle member can read',
      仅社区成员可提问: 'Only Circle member can ask',
      仅社区成员可回答: 'Only Circle member can answer',
      仅社区成员可评论: 'Only Circle member can comment',
      '管理员：': 'Moderator:',
      申请加入: 'Apply to join',
      已申请加入: 'Applied',
      提问: 'Ask',
      Title: 'Title',
      提交新问题: 'Submit new question',
      编辑问题描述: 'Edit question',
      更新问题描述: 'Update question',
      取消更新: 'Cancel update',
      已关注此问题: 'Watched',
      关注问题: 'Watch',
      写回答: 'Answer',
      该圈子仅会员可以写回答: 'Only member can write answers on this Circle',
      问题已经被浏览n次: 'This question is viewed by {times} people',
      问题信息: 'Question info',
      '所属圈子：': 'Parent Circle:',
      Topics: 'Topics',
      Questions: 'Questions',
      '话题：': 'Topic:',
      '关注人数：': 'Followers:',
      已关注此话题: 'Followed',
      关注话题: 'Follow topic',
      '提问成功，': 'Question submitted,',
      消耗n硬币: 'spent {amount} coins',
      切换格式和编辑器: 'Choose format/editor',
      Plaintext: 'Plaintext',
      Markdown: 'Markdown',
      WYSIWYG: 'WYSIWYG',
      'Forgot your password?': 'Forgot your password?',
      Login: 'Login',
      'Sign-up': 'Sign-up',
      'Password Recovery': 'Password Recovery',
      'A password recovery email will be sent to the registered account':
        'A password recovery email will be sent to the registered account',
      'Reset Password': 'Reset Password',
      'Enter your new password below': 'Enter your new password below',
      验证码: 'Verification code',
      'Send me verification code': 'Send me verification code',
      'Verify code': 'Verify code',
      '账号创建成功，返回登陆界面': 'Account opened successfully, now return to the login screen',
      'No token provided in the URL, start a new password recovery':
        'No token provided in the URL, start a new password recovery',
      暂无: 'Nothing for now',
      'Asked questions': 'Asked questions',
      有n个关注者: 'Followers: {count}',
      关注了n个人: 'Followed: {count}',
      取消关注: 'Unfollow',
      关注: 'Follow',
      编辑个人资料: 'Edit my profile',
      这个主页被浏览了n次: 'This profile is viewed by {times} people',
      Close: 'Close',
      系统: 'System',
      'New comment': 'New comment',
      Description: 'Description',
      答案内容: 'Answer content',
      提交: 'Submit',
      Preview: 'Preview',
      Username: 'Username',
      'Unique username (you can change this later)': 'Unique username (you can change this later)',
      设置更新成功: 'Setting updated successfully',
      'Only Circle members can view its content.': 'Only Circle members can view its content.',
      "You can't add yourself.": "You can't add yourself.",
      Followers: 'Followers',
      Followed: 'Followed',
      'Changing to WYSIWYG will not carry previously edited content!':
        'Changing to WYSIWYG will not carry previously edited content!',
      'Changing to text format will not carry previously edited content!':
        'Changing to text format will not carry previously edited content!',
      'Save draft only': 'Save draft only',
      'Save draft': 'Save draft',
      Publish: 'Publish',
      'Private draft': 'Private draft',
      Search: 'Search',
      私信: 'Message',
      'Basic information': 'Basic information',
      邀请我的朋友加入: 'Invite my friends',
      发送邮件: 'Send email',
      Circle: 'Circle',
      'Invitation sent.': 'Invitation sent.',
      'Welcome! Remember to reset your password as well or use link in email to get back.':
        'Welcome! Remember to reset your password as well or use link in email to get back.',
      'Try the explore button': 'Try the explore button',
      'Try the namecard button': 'Try the namecard button',
      私聊: 'Private',
      '提问者：': 'Asked by:',
      '上次编辑：': 'Since last edit:',
      邀请回答: 'Invite to answer',
      'Invited.': 'Invited.',
      'The email is already registered.': 'The email is already registered.',
      'The email is already invited.': 'The email is already invited.',
      'Invite new user': 'Invite new user',
      最近的硬币交易记录: 'Recent coin payment records',
      'Created at': 'Created at',
      Amount: 'Amount',
      Expense: 'Expense',
      Income: 'Income',
      Reference: 'Reference',
      Type: 'Type',
      'Upvote answer': 'Upvote answer',
      link: 'link',
      'Create question': 'Create question',
      可选: 'Optional',
      Help: 'Help',
      展开已读通知: 'Expand read notifications',
      尚未注册: "Haven't signed up yet",
      已注册: 'Signed up already',
      邀请用户类型: 'Type of invited user',
      已关注问题: 'Followed',
      收起已读通知: 'Hide read notifications',
      'Password confirmation does not match': 'Password confirmation does not match',
      密码是必须的: 'Password is required',
      密码确认是必须的: 'Password confirmation is required',
      发送站内信: 'Send message',
      'Question title is too short: minimum length 5 characters.':
        'Question title is too short: minimum length 5 characters.',
      'Title is too short: minimum length 5 characters.':
        'Title is too short: minimum length 5 characters.',
      'Answer is too short: minimum length 5 characters.':
        'Answer is too short: minimum length 5 characters.',
      "Comment can't be empty.": "Comment can't be empty.",
      'Password must be between 8 and 30 characters long.':
        'Password must be between 8 and 30 characters long.',
      "Channel name can't be empty.": "Channel name can't be empty.",
      提交改动: 'Submit Edit',
      'Submit New Answer': 'Submit New Answer',
      确认添加: 'Confirm to add',
      Members: 'Members',
      点击头像更改: 'Click avatar to change',
      Profile: 'Profile',
      联系我们: 'Contact us',
      回复: 'Reply',
      'verb.create_answer_question_reward':
        '{who} created a reward of {reward_coin_amount} coins to invite you to answer {question}',
      'verb.claim_answer_question_reward':
        '{who} claimed a reward of {reward_coin_amount} coins for answering {question}',
      'verb.answer_update': '{who} updated answer "{question}": "{answer}"',
      'verb.create_article': '{who} created article "{article}"',
      'verb.create_question': '{who} created question "{question}"',
      'verb.follow_article_column': '{who} followed "{article_column}"',
      'verb.upvote_answer': '{who} upvoted answer "{answer}" (parent question: "{question}")',
      'verb.upvote_article': '{who} upvoted article "{article}"',
      'verb.invite_new_user': '{who} invited new user to join',
      'verb.invite_join_site': '{who} invited {user} to join Circle {site}',
      'verb.answer_question': '{who} added new answer "{answer}" (parent question: "{question}")',
      'verb.comment_question':
        '{who} added new comment "{comment}" (parent question: "{question}")',
      'verb.edit_question': '{who} edited question "{question}"',
      'verb.reply_comment': '{who} added new reply "{reply}" (parent comment "{parent_comment}")',
      'verb.mentioned_in_comment': '{who} mentioned you in comment: "{comment}".',
      'verb.invite_answer': '{who} invited {user} to answer question "{question}"',
      'verb.apply_join_site': '{who} applies to join Circle "{site}"',
      'verb.comment_answer': '{who} added new comment "{comment}" (parent answer: "{answer}")',
      'verb.comment_article': '{who} added new comment "{comment}" (parent article: "{article}")',
      'verb.follow_user': '{who} followed {user}',
      'verb.system_broadcast': '📢 System broadcast: {message}',
      'verb.site_broadcast': "📢 Circle '{site}' broadcast: {submission}",
      'verb.system_send_invitation': 'System has sent invitation email to {invited_email}',
      'verb.create_message': '{who} added new {channel_message}',
      'verb.invited_user_activated': 'Invited user {invited_email} has activated account{remark}.',
      'verb.remark.invited_user_activated': ', your are rewarded {payment_amount} coins',
      'verb.create_submission': '{who} created sharing "{submission}"',
      'verb.upvote_submission': '{who} upvoted "{submission}"',
      'verb.comment_submission': '{who} comments on your sharing "{submission}": "{comment}"',
      已读通知: 'Past notifications',
      question: 'Question',
      user: 'User',
      No: 'No',
      Yes: 'Yes',
      Link: 'Link',
      Links: 'Links',
      问题中置顶: 'Top in question',
      'Load more': 'Load more',
      'No more new activities.': 'No more new activities.',
      me: 'me',
      圈子置顶: 'Top in Circle',
      首页中展示: 'Show in home',
      'site.permission_type.public': 'Public',
      'site.permission_type.private': 'Private',
      'Invitation URL is invalid.': 'Invitation URL is invalid.',
      Dismiss: 'Dismiss',
      'Math enabled': 'TeX enabled',
      'Math disabled': 'TeX disabled',
      自动保存于: 'Auto-saved at',
      版本历史: 'Version history',
      设置: 'Settings',
      永久删除: 'Delete forever',
      '问题不存在，返回主页': "Question doesn't exist, back to home",
      学校名和教育水平均为必填: 'Both school name and education level are required',
      公司名和职位均为必填: 'Both company name and position are required',
      'My Circles': 'My Circles',
      'Recent Circles': 'Recent Circles',
      'All Circles': 'All Circles',
      'Other Circles': 'Other Circles',
      使用前必读: 'Read before you use',
      查看所有圈子: 'Explore',
      '确定永久删除答案及其所有历史版本？': 'Confirm to delete the answer and its history forever?',
      点击展开: 'Expand',
      'New reply': 'New reply',
      'Write reply': 'Reply comment',
      '这是你的唯一标识符，请谨慎更改': 'This is your only unique token, change with care',
      设置成功更新: 'Settings updated successfully',
      Saving: 'Saving',
      更新已发表: 'Answer update is published',
      已发表: 'Answer published',
      编辑草稿: 'Edit draft',
      载入最近的草稿: 'Latest draft loaded',
      'Update comment': 'Update comment',
      评论更新成功: 'Comment updated',
      答案草稿已更新: 'Draft updated',
      此为初稿仅自己可见: 'Initial private draft',
      个人主页: 'Personal homepage',
      'Github 用户名': 'Github username',
      'Twitter 用户名': 'Twitter username',
      'Linkedin 主页地址': 'Linkedin page',
      'App update is available': 'App update is available',
      Update: 'Update',
      'ServiceWorker-is-disabled-hint':
        'ServiceWorker is disabled (e.g. in private mode), the app might not function correctly.',
      'You are already at home': 'You are already at home',
      尚无历史存档: 'No history archives for now',
      问题历史: 'Question history',
      评论答案: 'Comment on answer',
      评论问题: 'Comment on question',
      '你有多了解被邀请人？': 'How well do you know the invited person?',
      仅知道线上身份的朋友: 'Only know online identity',
      知道实名身份的朋友: 'Know real identity',
      不了解其任何身份: 'Not familiar',
      Articles: 'Articles',
      本页中的信息只有自己可见: 'This page is private to you',
      创建新专栏: 'Create new column',
      专栏名称: 'Column name',
      显示名: 'Display name',
      专栏描述: 'Column description',
      我的专栏: 'My columns',
      '上次发表：': 'Last published at:',
      '确定永久删除文章及其所有历史版本？':
        'Confirm to delete the article and its history forever?',
      评论文章: 'Comment on article',
      发表于专栏: 'Published at column',
      'followed column': 'followed column',
      'created article': 'published article',
      'upvoted article': 'upvoted article',
      Security: 'Security',
      'Manage logins': 'Manage logins',
      'Phone number': 'Phone number',
      'Invalid format, valid example: +1222333444, +8611122223333':
        'Invalid format, valid example: +1222333444, +8611122223333',
      'Verify and save': 'Verify and save',
      成功更新手机号绑定: 'Phone number updated successfully',
      'Add phone number': 'Add phone number',
      'Update phone number': 'Update phone number',
      'Cellphone number': 'Cellphone number',
      'Login method': 'Login method',
      'Verification code sent': 'Verification code sent',
      '圈子话题：': 'Circle topics:',
      '所属话题：': 'Parent topic:',
      文章列表: 'Articles',
      最近硬币交易记录: 'Recent coin payment records',
      编辑个人页面: 'Edit my profile',
      等x人: 'etc. {n} people',
      我的设置: 'My settings',
      发送邮件提醒未读通知: 'Email me unread notifications',
      转发给我的关注者: 'Forward to my followers',
      已经转发过了: 'Already forwarded',
      'commented question': 'commented question',
      'commented article': 'commented article',
      'commented answer': 'commented answer',
      'replied comment': 'replied comment',
      导出: 'Export',
      '「茶饭」支持用户的数据所有权和导出自由，所以你随时可以导出你拥有的数据和创作内容。目前自动导出尚未实现，请直接联系 takeout@cha.fan，我们将在一周内将你的数据快照发送到注册用的邮箱。':
        '「茶饭」supports data and content ownership, you can export your data and content at any time. Current automated export is not implemented, please contact takeout@cha.fan and we will send your data snapshot in a week',
      管理员模式: 'Admin mode',
      普通用户模式: 'Normal user mode',
      Reward: 'Reward',
      Rewards: 'Rewards',
      'Reward is the amount of coins rewarded to the invited user when the user published an answer.':
        'Reward is the amount of coins rewarded to the invited user when the user published an answer.',
      "The coins will be first deducted from your account, and you can reclaim it after the reward expired (if the user doens't post an answer in one week).":
        "The coins will be first deducted from your account, and you can reclaim it after the reward expired (if the user doens't post an answer in one week).",
      'You can check all your rewards in ': 'You can check all your rewards in ',
      'Refunded at': 'Refunded at',
      'Expired at': 'Expired at',
      'Claimed at': 'Claimed at',
      'Coin amount': 'Coin amount',
      Condition: 'Condition',
      Give: 'Give',
      Receive: 'Receive',
      Action: 'Action',
      Claim: 'Claim',
      回答: 'Answer',
      回答问题: 'Answer question',
      专栏: 'Article Column',
      等待回答的问题: 'Questions waiting for answers',
      'upvoted answer': 'upvoted answer',
      '在「用户中心」中可以创建专栏': 'You can create new question column in "Dashboard"',
      请选择一个专栏发布文章: 'Please select one article column to publish',
      Content: 'Content',
      'Only site members can view its content.': 'Only site members can view its content.',
      硬币: 'Coins',
      草稿已保存: 'Draft saved',
      我的草稿: 'My drafts',
      文章草稿: 'Article drafts',
      答案草稿: 'Answer drafts',
      '发表于专栏：': 'Published in column:',
      答案已永久删除: 'Answer is deleted permanently',
      Refund: 'Refund',
      Chat: 'Chat',
      'Unique sub-domain name': 'Unique sub-domain name',
      'Permission type': 'Permission type',
      创建圈子: 'Create Circle',
      'Incorrect email or password': 'Incorrect email or password',
      'Deleted.': 'Deleted.',
      已删除: 'Deleted',
      '确定删除？': 'Confirm deletion?',
      默认编辑器模式: 'Default editor mode',
      'Saved.': 'Saved.',
      markdown_realtime_rendering: 'Markdown Real-time Rendering',
      markdown_splitview: 'Markdown Split-view',
      wysiwyg: 'WYSIWYG',
      分享: 'Sharing',
      Share: 'Share',
      Sharings: 'Sharings',
      'URL (optional)': 'URL (optional)',
      更新分享: 'Update sharing',
      隐藏分享: 'Hide sharing',
      '确认隐藏分享？': 'Confirm hiding sharing?',
      确认隐藏: 'Confirm hiding',
      分享历史: "Sharing's history",
      发表答案: 'Publish answer',
      'upvoted submission': 'upvoted sharing',
      'created submission': 'created sharing',
      'commented submission': 'commented sharing',
      查看回复: 'Check replies',
      源链接: 'URL',
      '确定取消赞？': 'Confirm to cancel upvote?',
      编辑分享: 'Edit sharing',
      'Submitted by': 'Submitted by',
      提交评论: 'Submit comment',
      发送回复: 'Send reply',
      'Only site member can comment': 'Only Circle member can comment',
      'Only site member can reply': 'Only Circle member can reply',
      '删除当前草稿？': 'This the draft?',
      不影响已发表版本: "It doesn't affect the published version",
      确认: 'Confirm',
      编辑问题: 'Edit question',
      'Verify code and open account': 'Verify and sign up',
      'No submissions for now': 'No sharings for now',
      其他: 'Misc',
      'Add secondary email': 'Add secondary email',
      primary: 'primary',
      secondary: 'secondary',
      'The Email field must be a valid email': 'The Email field must be a valid email',
      'Insuffient karma for joining site.': 'Insuffient karma for joining site.',
      'No verified email.': 'No verified email.',
      生成邀请链接: 'Invitation link',
      申请审核中: 'Waiting approval',
      '加入所需邮箱地址后缀：': 'Email: ',
      申请加入圈子的条件: 'Membership requirements',
      Memberships: 'Memberships',
      Settings: 'Settings',
      Information: 'Information',
      '请先将广播的内容提交到「分享」板块，然后将其链接粘贴至下方发送给圈子「{circle}」的成员。':
        '请先将广播的内容提交到「分享」板块，然后将其链接粘贴至下方发送给圈子「{circle}」的成员。',
      n个回答: '{n} answers',
      n条评论: '{n} comments',
      Answers: 'Answers',
      加载该版本: 'Load this',
      Circles: 'Circles',
      More: 'More',
      添加站内用户: 'Add user',
      '加入圈子：': 'Circle to join: ',
      创建后添加细节: 'Add details afterwards',
      离开: 'Leave',
      收藏的分享: 'Bookmarked sharings',
      我的回答: 'My answer',
      '添加额外的 GIF 头像': 'Extra GIF avatar',
      点击更改默认头像: 'Change default avatar',
      没有更多了: "That's all",
      运营: 'Operations',
      广播通知: 'Broadcast notifications',
      人工审核: 'Manual approval',
      '提交申请给人工审核前应满足的所有条件：':
        'All conditions to be automatically met before manual approval: ',
      '加入申请处理方式：': 'How to approve application to join: ',
      编辑答案: 'Edit answer',
      'No account': 'No account',
      submission: 'Sharing',
      探索: 'Explore',
      tiptap: 'tiptap (beta ⚠️)',
      所有圈子: 'All Circles',
      发现问题: 'Find questions',
      关注更多用户: 'Follow more people',
      不定期随机更新: 'Updated randomly once in a while',
      site: 'Circle',
      answer: 'Answer',
      'No users found': 'No users found',
      Feed: 'Feed',
      问题反馈: 'Feedback',
      '描述（选填）': 'Description (optional)',
      现问题所属圈子: 'Parent Circle',
      新的圈子: 'Create Circle',
      '没有权限？联系管理员帮助转移': 'No permission? Contact admin to help transfer',
      确认转移: 'Confirm transfer',
      隐藏问题: 'Hide question',
      '确认隐藏问题？': 'Confirm hide question?',
      暂无答案: 'No answer for now',
      仅注册用户可读: 'Visible to registered users',
      Vditor: 'Vditor',
      '源链接（选填）': 'Source link (optional)',
      相关分享: 'Related Sharings',
      换一批: 'Rotate',
      加入: 'Join',
      登录后参与讨论: 'Log in to participate',
      Recent: 'Recent',
    },
    zh: {
      Recent: '动态',
      登录后参与讨论: '登录后参与讨论',
      加入: '加入',
      相关分享: '相关分享',
      换一批: '换一批',
      '源链接（选填）': '源链接（选填）',
      仅注册用户可读: '仅注册用户可读',
      Vditor: 'Vditor',
      '描述（选填）': '描述（选填）',
      现问题所属圈子: '现问题所属圈子',
      新的圈子: '新的圈子',
      '没有权限？联系管理员帮助转移': '没有权限？联系管理员帮助转移',
      确认转移: '确认转移',
      隐藏问题: '隐藏问题',
      '确认隐藏问题？': '确认隐藏问题？',
      暂无答案: '暂无答案',
      问题反馈: '问题反馈',
      Feed: '信息流',
      'No users found': '无结果',
      answer: '答案',
      site: '圈子',
      发现问题: '发现问题',
      不定期随机更新: '不定期随机更新',
      关注更多用户: '关注更多用户',
      所有圈子: '所有圈子',
      tiptap: 'tiptap (beta ⚠️)',
      探索: '探索',
      submission: '分享',
      编辑答案: '编辑答案',
      '加入申请处理方式：': '加入申请处理方式：',
      人工审核: '人工审核',
      '提交申请给人工审核前应满足的所有条件：': '提交申请给人工审核前应满足的所有条件：',
      运营: '运营',
      广播通知: '广播通知',
      没有更多了: '没有更多了',
      '添加额外的 GIF 头像': '添加额外的 GIF 头像',
      点击更改默认头像: '点击更改默认头像',
      我的回答: '我的回答',
      收藏的分享: '收藏的分享',
      离开: '离开',
      添加站内用户: '添加站内用户',
      '加入圈子：': '加入圈子：',
      创建后添加细节: '创建后添加细节',
      More: '更多',
      Circles: '圈子',
      加载该版本: '加载该版本',
      Description: '描述',
      Answers: '回答',
      Share: '分享',
      n个回答: '{n}个回答',
      n条评论: '{n}条评论',
      '请先将广播的内容提交到「分享」板块，然后将其链接粘贴至下方发送给圈子「{circle}」的成员。':
        '请先将广播的内容提交到「分享」板块，然后将其链接粘贴至下方发送给圈子「{circle}」的成员。',
      Information: '信息',
      Settings: '设置',
      Memberships: '成员',
      申请加入圈子的条件: '申请加入圈子的条件',
      '加入所需邮箱地址后缀：': '加入所需邮箱地址后缀：',
      申请审核中: '申请审核中',
      生成邀请链接: '生成邀请链接',
      'No verified email.': '没有已验证的邮箱地址',
      'Insuffient karma for joining site.': 'Karma 不足',
      'The Email field must be a valid email': '邮件无效',
      primary: '主要',
      secondary: '次要',
      'Add secondary email': '加入次要邮件地址',
      其他: '其他',
      'No submissions for now': '暂无分享',
      'Verify code and open account': '验证并注册',
      编辑问题: '编辑问题',
      '删除当前草稿？': '删除当前草稿？',
      不影响已发表版本: '不影响已发表版本',
      确认: '确认',
      'Only site member can comment': '仅圈子成员可评论',
      'Only site member can reply': '仅圈子成员可回复',
      提交评论: '提交评论',
      发送回复: '发送回复',
      'Submitted by': '提交者：',
      源链接: '源链接',
      '确定取消赞？': '确定取消赞？',
      编辑分享: '编辑分享',
      查看回复: '查看回复',
      'upvoted submission': '赞了分享',
      'created submission': '添加了分享',
      'commented submission': '评论了分享',
      更新分享: '更新分享',
      隐藏分享: '隐藏分享',
      '确认隐藏分享？': '确认隐藏分享？',
      确认隐藏: '确认隐藏',
      分享历史: '分享历史',
      'URL (optional)': 'URL (可选)',
      Sharings: '分享',
      分享: '分享',
      markdown_realtime_rendering: 'Markdown 即时渲染',
      markdown_splitview: 'Markdown 分屏',
      wysiwyg: '所见即所得',
      'Saved.': '已保存。',
      默认编辑器模式: '默认编辑器模式',
      '确定删除？': '确定删除？',
      已删除: '已删除',
      'Deleted.': '已删除',
      'Incorrect email or password': '输入信息有误',
      创建圈子: '创建圈子',
      'Permission type': '权限类型',
      显示名: '显示名',
      'Unique sub-domain name': '唯一域名',
      Chat: '聊天',
      Refund: '退回',
      答案已永久删除: '答案已永久删除',
      草稿已保存: '草稿已保存',
      我的草稿: '我的草稿',
      文章草稿: '文章草稿',
      答案草稿: '答案草稿',
      '发表于专栏：': '发表于专栏：',
      发表答案: '发表答案',
      硬币: '硬币',
      'Only site members can view its content.': '内容仅圈子成员可见',
      Content: '内容',
      已发表: '已发表',
      '在「用户中心」中可以创建专栏': '在「用户中心」中可以创建专栏',
      请选择一个专栏发布文章: '请选择一个专栏发布文章',
      'upvoted answer': '赞了回答',
      等待回答的问题: '等待回答的问题',
      专栏: '专栏',
      回答: '回答',
      Action: '动作',
      Claim: '兑换',
      'Refunded at': '退回时间',
      'Expired at': '失效时间',
      'Claimed at': '兑换时间',
      'Coin amount': '硬币数量',
      Condition: '兑换条件',
      Give: '给予',
      Receive: '接收',
      回答问题: '回答问题',
      Rewards: '奖励',
      Reward: '奖励',
      'Reward is the amount of coins rewarded to the invited user when the user published an answer.':
        '当你邀请的用户回答问题后，该用户会收到制定的奖励银币数额',
      "The coins will be first deducted from your account, and you can reclaim it after the reward expired (if the user doens't post an answer in one week).":
        '这部分硬币会先从你的账户扣除。如果被邀请的用户没有在奖励失效前（一周）回答问题的话，你可以将预扣取的银币拿回',
      'You can check all your rewards in ': '查看你的收到/发出的所有奖励：',
      普通用户模式: '普通用户模式',
      管理员模式: '管理员模式',
      导出: '导出',
      '「茶饭」支持用户的数据所有权和导出自由，所以你随时可以导出你拥有的数据和创作内容。目前自动导出尚未实现，请直接联系 takeout@cha.fan，我们将在一周内将你的数据快照发送到注册用的邮箱。':
        '「茶饭」支持用户的数据所有权和导出自由，所以你随时可以导出你拥有的数据和创作内容。目前自动导出尚未实现，请直接联系 takeout@cha.fan，我们将在一周内将你的数据快照发送到注册用的邮箱。',
      'commented question': '评论了问题',
      'commented article': '评论了文章',
      'commented answer': '评论了回答',
      'replied comment': '回复了评论',
      转发给我的关注者: '转发给我的关注者',
      已经转发过了: '已经转发过了',
      发送邮件提醒未读通知: '发送邮件提醒未读通知',
      我的设置: '我的设置',
      等x人: '等{n}人',
      文章列表: '文章列表',
      最近硬币交易记录: '最近硬币交易记录',
      编辑个人页面: '编辑个人页面',
      '所属话题：': '所属话题：',
      '圈子话题：': '圈子话题：',
      'Verification code sent': '验证码已发送',
      'Login method': '登录方式',
      'Cellphone number': '手机号码',
      'Update phone number': '更新手机号',
      'Add phone number': '添加手机号',
      成功更新手机号绑定: '成功更新手机号绑定',
      'Verify and save': '验证并保存',
      'Invalid format, valid example: +1222333444, +8611122223333':
        '无效格式，有效的例子: +1222333444, +8611122223333',
      'Manage logins': '管理登录方式',
      'Phone number': '手机号码',
      Security: '安全中心',
      'upvoted article': '赞了文章',
      'created article': '发表了文章',
      'followed column': '关注了专栏',
      发表于专栏: '发表于专栏',
      '上次发表：': '上次发表：',
      '确定永久删除文章及其所有历史版本？': '确定永久删除文章及其所有历史版本？',
      评论文章: '评论文章',
      本页中的信息只有自己可见: '本页中的信息只有自己可见',
      创建新专栏: '创建新专栏',
      专栏名称: '专栏名称',
      专栏描述: '专栏描述',
      我的专栏: '我的专栏',
      Articles: '文章',
      仅知道线上身份的朋友: '仅知道线上身份的朋友',
      知道实名身份的朋友: '知道实名身份的朋友',
      不了解其任何身份: '不了解其任何身份',
      '你有多了解被邀请人？': '你有多了解被邀请人？',
      评论答案: '评论答案',
      评论问题: '评论问题',
      问题历史: '问题历史',
      尚无历史存档: '尚无历史存档',
      'You are already at home': '你已经在首页了',
      'ServiceWorker-is-disabled-hint':
        'ServiceWorker 被禁用（比如在隐私模式下），App 可能无法正常运行。',
      Update: '更新',
      'App update is available': '应用有新的更新',
      'Github 用户名': 'Github 用户名',
      'Twitter 用户名': 'Twitter 用户名',
      'Linkedin 主页地址': 'Linkedin 主页地址',
      个人主页: '个人主页',
      答案草稿已更新: '答案草稿已更新',
      评论更新成功: '评论更新成功',
      'Update comment': '更新评论',
      载入最近的草稿: '载入最近的草稿',
      编辑器中有未发表的草稿: '编辑器中有未发表的草稿',
      编辑草稿: '编辑草稿',
      更新已发表: '更新已发表',
      Saving: '保存中',
      设置成功更新: '设置成功更新',
      '这是你的唯一标识符，请谨慎更改': '这是你的唯一标识符，请谨慎更改',
      点击展开: '点击展开',
      '确定永久删除答案及其所有历史版本？': '确定永久删除答案及其所有历史版本？',
      查看所有圈子: '探索圈子',
      使用前必读: '使用前必读',
      'answered question': '回答了问题',
      follows: '关注了用户',
      'upvotes answer': '赞了回答',
      'creates question': '提了一个问题',
      'Explore Circles': '探索圈子',
      'Submit comment': '提交评论',
      'Only Circle member can comment': '该圈子仅成员可以写评论',
      'No comments for now': '暂无评论',
      'Comments in total': '共 {total} 条评论：',
      'Write comment': '写评论',
      展开全文: '展开全文',
      '所属问题：': '所属问题：',
      内容已被管理员隐藏: '内容已被管理员隐藏',
      已赞: '已赞',
      赞: '赞',
      查看评论: '查看评论',
      已收藏: '已收藏',
      收藏: '收藏',
      收起: '收起',
      编辑: '编辑',
      新页面打开: '新页面打开',
      已被阅读n次: '已被{times}人阅读',
      '管理：': '管理：',
      取消隐藏: '取消隐藏',
      隐藏: '隐藏',
      Language: '语言',
      'Main menu': '主菜单',
      Home: '首页',
      Dashboard: '用户中心',
      'Edit Profile': '编辑个人页面',
      'Change Password': '更新密码',
      Logout: '退出',
      Collapse: '缩起',
      个人资料: '个人资料',
      'Full Name': '显示名',
      个人简介: '个人简介',
      居住过的地方: '居住过的地方',
      所在行业: '所在行业',
      教育经历: '教育经历',
      工作经历: '工作经历',
      删除: '删除',
      学校名: '学校名',
      教育水平: '教育水平',
      添加: '添加',
      机构名: '机构名',
      职位名: '职位名',
      high_school_or_lower: '高中及以下',
      dazhuan: '大专',
      bachelor: '本科',
      master: '硕士',
      phd_or_higher: '博士及以上',
      Cancel: '取消',
      Reset: '重置',
      Save: '保存',
      'Edit User Profile': '编辑个人页面',
      Password: '密码',
      'Password confirmation': '确认密码',
      Email: '电子邮箱地址',
      硬币数量: '硬币数量',
      'Joined Circles': '加入的圈子',
      'My questions': '我的提问',
      我写的答案: '我写的答案',
      关注的话题: '关注的话题',
      收藏的答案: '收藏的答案',
      未读通知: '未读通知',
      标记为已读: '标记为已读',
      'Create new channel': '创建新聊天室',
      聊天室名称: '聊天室名称',
      创建: '创建',
      'Joined channels': '加入的聊天室',
      暂无历史消息: '暂无历史消息',
      我: '我',
      新消息: '新消息',
      '聊天室：': '聊天室：',
      'Members:': '成员列表：',
      Members: '成员列表',
      '(管理员)': '(管理员)',
      拉人: '拉人',
      'User ID': '用户ID',
      '圈子：': '圈子：',
      '简介：': '简介：',
      '规则：': '规则：',
      所有注册用户可读: '所有注册用户可读',
      所有注册用户可提问: '所有注册用户可提问',
      所有注册用户可答: '所有注册用户可答',
      所有注册用户可评: '所有注册用户可评',
      仅圈子成员可读: '仅圈子成员可读',
      仅圈子成员可提问: '仅圈子成员可提问',
      仅圈子成员可回答: '仅圈子成员可回答',
      仅圈子成员可评论: '仅圈子成员可评论',
      '管理员：': '管理员：',
      申请加入: '申请加入',
      已申请加入: '已申请加入',
      提问: '提问',
      Title: '标题',
      提交新问题: '提交新问题',
      提交: '提交',
      编辑问题描述: '编辑问题',
      更新问题描述: '更新问题描述',
      取消更新: '取消更新',
      已关注此问题: '已关注此问题',
      关注问题: '关注问题',
      写回答: '写回答',
      该圈子仅会员可以写回答: '该圈子仅会员可以写回答',
      问题已经被浏览n次: '问题已经被{times}人浏览',
      问题信息: '问题信息',
      '所属圈子：': '所属圈子：',
      Topics: '话题',
      Questions: '问题',
      '话题：': '话题：',
      '关注人数：': '关注人数：',
      已关注此话题: '已关注此话题',
      关注话题: '关注话题',
      '提问成功，': '提问成功，',
      消耗n硬币: '消耗 {amount} 硬币',
      切换格式和编辑器: '切换格式和编辑器',
      Plaintext: '纯文本编辑器',
      Markdown: 'Markdown编辑器',
      WYSIWYG: '富文本编辑器',
      'Forgot your password?': '忘记密码？',
      Login: '登录',
      'Sign-up': '注册',
      'Password Recovery': '密码找回',
      'A password recovery email will be sent to the registered account':
        '一封用于找回密码的邮件会发送到你的邮箱',
      Send: '发送',
      'Reset Password': '密码重置',
      'Enter your new password below': '请在下方输入你的新密码',
      验证码: '验证码',
      'Send me verification code': '发送验证码',
      'Verify code': '验证',
      '账号创建成功，返回登陆界面': '账号创建成功，返回登陆界面',
      'No token provided in the URL, start a new password recovery': '不合法的 URL，返回密码找回',
      暂无: '暂无',
      'Authored answers': '贡献的回答',
      'Asked questions': '贡献的问题',
      有n个关注者: '有 {count} 个关注者',
      关注了n个人: '关注了 {count} 个人',
      取消关注: '取消关注',
      关注: '关注',
      这个主页被浏览了n次: '这个主页被{times}人浏览过',
      Close: '关闭',
      系统: '系统',
      'New comment': '新评论',
      答案内容: '答案内容',
      Preview: '预览',
      Username: '用户名',
      'Unique username (you can change this later)': '唯一用户名（注册后可以修改）',
      设置更新成功: '设置更新成功',
      'Only Circle members can view its content.': '仅圈子成员可以访问内容。',
      'No questions for now': '暂无问题内容',
      "You can't add yourself.": '不能添加自己。',
      Followers: '关注者',
      Followed: '关注的人',
      'Changing to text format will not carry previously edited content!':
        '切换到文本模式不会自动转换已有的内容！',
      'Changing to WYSIWYG will not carry previously edited content!':
        '切换到所见即所得模式不会自动转换已有的内容！',
      'Save draft only': '仅保存草稿',
      'Save draft': '保存草稿',
      Publish: '发表',
      'Private draft': '草稿仅自己可见',
      Search: '搜索',
      私信: '私信',
      'Basic information': '基本信息',
      邀请我的朋友加入: '邀请我的朋友加入',
      发送邮件: '发送邮件',
      Circle: '圈子',
      'Invitation sent.': '邀请已发送。',
      'Welcome! Remember to reset your password in security center (you can use link in email to get back in a few days)':
        '欢迎！记得在「安全中心」重置密码，如果不小心登出在几天内也用邀请函中的链接登录。',
      'Try the explore button': '试试「探索」按钮',
      'Try the namecard button': '试试「名片」按钮',
      私聊: '私聊',
      '提问者：': '提问者：',
      '上次编辑：': '上次编辑：',
      邀请回答: '邀请回答',
      'Invited.': '已邀请。',
      最近的硬币交易记录: '最近的硬币交易记录',
      'Created at': '创建于',
      Amount: '数量',
      Expense: '支出',
      Income: '收入',
      Reference: '参考',
      Type: '类型',
      'Invite new user': '邀请新用户',
      'Upvote answer': '赞回答',
      link: '链接',
      'Create question': '提问',
      可选: '可选',
      Help: '帮助',
      展开已读通知: '展开已读通知',
      尚未注册: '尚未注册',
      已注册: '已注册',
      邀请用户类型: '邀请用户类型',
      已关注问题: '已关注问题',
      收起已读通知: '收起已读通知',
      'Password confirmation does not match': '密码不一致',
      密码是必须的: '密码是必须的',
      密码确认是必须的: '密码确认是必须的',
      发送站内信: '发送站内信',
      'Question title is too short: minimum length 5 characters.':
        '问题标题太短了，不得少于5个字。',
      'Title is too short: minimum length 5 characters.': '标题太短了，不得少于5个字。',
      'Answer is too short: minimum length 5 characters.': '回答太短了，不得少于5个字。',
      'Password must be between 8 and 30 characters long.': '密码长度必须在8到30个字符之间。',
      "Comment can't be empty.": '评论不能为空。',
      "Channel name can't be empty.": '聊天室名称不能为空',
      提交改动: '提交改动',
      'Submit New Answer': '提交新回答',
      确认添加: '确认添加',
      点击头像更改: '点击头像更改',
      Profile: '个人资料',
      联系我们: '联系我们',
      查看n条评论: '{amount}条评论',
      评论: '评论',
      回复: '回复',
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
      'verb.remark.invited_user_activated': '，你已经收到 {payment_amount} 硬币奖励',
      'verb.create_answer_question_reward':
        '{who}为邀请你回答「{question}」而创建了{reward_coin_amount}个硬币的奖励',
      'verb.claim_answer_question_reward':
        '{who} 兑换了回答问题「{question}」的{reward_coin_amount}个硬币的奖励',
      'verb.create_submission': '{who}创建了分享「{submission}」',
      'verb.create_site': '{who}创建了圈子「{site}」',
      'verb.upvote_submission': '{who}赞了分享「{submission}」',
      'verb.comment_submission': '{who}评论了你的分享「{submission}」：「{comment}」',
      已读通知: '已读通知',
      question: '问题',
      user: '用户',
      I: '我',
      me: '我',
      'The email is already registered.': '该邮箱地址已经被注册。',
      'The email is already invited.': '该邮箱地址已被邀请',
      添加评论: '添加评论',
      No: '不了',
      Yes: '是的',
      Link: '链接',
      Links: '链接',
      'Pinned questions': '置顶问题',
      问题中置顶: '问题中置顶',
      'Load more': '加载更多',
      'No more new activities.': '没有更多新动态了',
      圈子置顶: '圈子置顶',
      首页中展示: '首页中展示',
      '类型：': '类型：',
      'site.permission_type.public': '公开',
      'site.permission_type.private': '私有',
      'Invitation URL is invalid.': '邀请链接无效。',
      Dismiss: '忽略',
      'Math enabled': 'TeX 已打开',
      'Math disabled': 'TeX 已关闭',
      自动保存于: '自动保存于',
      版本历史: '版本历史',
      设置: '设置',
      永久删除: '永久删除',
      '问题不存在，返回主页': '问题不存在，返回主页',
      学校名和教育水平均为必填: '学校名和教育水平均为必填',
      公司名和职位均为必填: '公司名和职位均为必填',
      'My Circles': '我的圈子',
      'All Circles': '所有圈子',
      'Recent Circles': '最近用过的圈子',
      'Other Circles': '其他圈子',
      'New reply': '新回复',
      'Write reply': '回复评论',
      'No account': '还没账户',
      'In-depth social Q&A site': '有深度的社交问答网站',
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
