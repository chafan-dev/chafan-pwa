import { apiQuestion } from '@/api/question';
import { adminUUID, apiUrl, appName } from '@/env';
import { api } from '@/api';
import { IGenericResponse, ThemeType } from '@/interfaces';
import { Vue } from 'vue-property-decorator';
import {
  readIsLoggedIn,
  readTheme,
  readToken,
  readUserMode,
  readUserProfile,
} from '@/store/main/getters';
import { commitAddNotification } from '@/store/main/mutations';
import { AxiosError } from 'axios';

export const URLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:,%_\+.~#?&//=]*)/gi;

export const NARROW_FEED_UI_KEY = 'narrowFeedUI';
export const LABS_TIPTAP_EDITOR_OPTION = 'labs.tiptap-editor-option';
export const YES_FLAG = 'user-agreement-yes';
export const EXPLORE_SITES = 'closed-explore-sites-in-home';

export { isEqual } from 'lodash';

export const getDefaultNarrowFeedUI = () => {
  try {
    const value = localStorage.getItem(NARROW_FEED_UI_KEY);
    return value === null || value === 'true';
  } catch (e) {
    return false;
  }
};

function getOpenGraphCard(
  originalUrl: string,
  properties: Record<string, string>
): HTMLElement | null {
  const anchor = document.createElement('a');
  anchor.target = '_blank';
  const div = document.createElement('div');
  anchor.appendChild(div);
  div.classList.add('og-card');
  const title = properties['title'] || properties['og:title'];
  const imageUrl = properties['og:image'];
  anchor.href = originalUrl;
  const siteName = properties['og:site_name'];
  const description = properties['og:description'];
  if (imageUrl) {
    const imageDiv = document.createElement('img');
    imageDiv.src = imageUrl;
    div.appendChild(imageDiv);
  }
  if (title) {
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('og-card-title', 'text--primary');
    titleDiv.innerText = title;
    div.appendChild(titleDiv);
  }
  if (description && description !== title) {
    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('og-card-desc', 'text--secondary', 'text-caption');
    descriptionDiv.innerText = description;
    div.appendChild(descriptionDiv);
  }
  if (siteName) {
    const siteNameDiv = document.createElement('div');
    siteNameDiv.classList.add('og-card-sitename', 'text--secondary');
    siteNameDiv.innerText = siteName;
    div.appendChild(siteNameDiv);
  }
  if (div.children.length) {
    return anchor;
  }
  return null;
}

const linkPreviewHosts = new Set(['www.flickr.com', 'github.com', 'www.zhihu.com']);

export const postProcessViewerDOM = async (token: string, viewer: HTMLElement | undefined) => {
  if (!viewer) {
    return;
  }
  for (const a of viewer.getElementsByTagName('a')) {
    try {
      const url = new URL(a.href);
      if (a.href === a.innerText) {
        // Replace nodes
        if (url.origin === window.origin) {
          const match = url.pathname.match(/^\/questions\/(\w+)$/);
          if (match) {
            const questionUUID = match[1];
            const question = (await apiQuestion.getQuestion(token, questionUUID)).data;
            a.innerText = question.title;
            continue;
          }
        }
        if (linkPreviewHosts.has(url.host)) {
          const props = (await api.generateLinkPreview(a.href)).data;
          const card = getOpenGraphCard(a.href, props);
          if (card) {
            a.parentNode!.replaceChild(card, a);
            continue;
          }
        }
      }
      // Open in new window
      if (url.origin !== window.origin) {
        a.target = '_blank';
      }
    } finally {
    }
  }
};

export const getVditorUploadConfig = (token: string) => {
  return {
    max: 5 * 1024 * 1024,
    // TODO: token for CORS validation
    accept: 'image/png, image/jpeg, image/bmp, image/gif',
    fieldName: 'files',
    url: `${apiUrl}/upload/vditor/`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const constants = {
  explore: '探索',
  dashboard: '个人中心',
  profile: '个人资料',
  edit_profile: '编辑个人资料',
  security_center: '安全中心',
  moderate_circles: '管理圈子',
  login: '登录',
  signup: '注册',
  recover_password: '找回密码',
  reset_password: '重置密码',
  invitation_to_join: '邀请加入',
  search_results: '搜索结果',
};

export type ThemeClassKey = 'answerExpandText' | 'anaswerControlPanel';

export interface IThemeDef {
  answer: {
    expand: {
      text: {
        classes: string;
      };
    };
    controls: {
      buttonsCol: {
        classes: string;
      };
      classes: string;
    };
  };
  feed: {
    submissionPreview: {
      classes: string;
      link: {
        classes: string;
      };
      stats: {
        classes: string;
      };
    };
    questionPreview: {
      classes: string;
      link: {
        classes: string;
      };
      stats: {
        classes: string;
      };
    };
    activityCard: {
      classes: string;
      verb: {
        classes: string;
      };
    };
  };
  upvoteBtn: {
    outlined: boolean;
  };
  upvotedBtn: {
    classes: string;
  };
  userLink: {
    link: {
      classes: string;
    };
  };
  questionLink: {
    link: {
      classes: string;
    };
  };
  app: {
    background: string;
  };
  baseCard: {
    classKey: string;
  };
  home: {
    tabs: {
      backgroundColor: string;
    };
  };
  question: {
    answer: {
      classes: string;
    };
  };
}

export const themeDefs: { [key in ThemeType]: IThemeDef } = {
  default: {
    answer: {
      expand: { text: { classes: 'primary--text' } },
      controls: { classes: '', buttonsCol: { classes: 'd-flex pl-3 pb-0' } },
    },
    feed: {
      submissionPreview: {
        classes: 'pa-2',
        link: {
          classes: 'text-decoration-none',
        },
        stats: {
          classes: 'd-flex align-center',
        },
      },
      questionPreview: {
        classes: 'pa-2',
        link: {
          classes: 'text-decoration-none',
        },
        stats: {
          classes: 'd-flex',
        },
      },
      activityCard: {
        classes: 'ma-4 shadow-card',
        verb: {
          classes: '',
        },
      },
    },
    upvoteBtn: {
      outlined: false,
    },
    upvotedBtn: {
      classes: '',
    },
    userLink: {
      link: {
        classes: 'text-decoration-none grey--text text--darken-2',
      },
    },
    questionLink: {
      link: {
        classes: 'text-decoration-none',
      },
    },
    app: {
      background: '',
    },
    baseCard: {
      classKey: 'c-card',
    },
    home: {
      tabs: {
        backgroundColor: '',
      },
    },
    question: {
      answer: {
        classes: 'shadow-card',
      },
    },
  },
  blue: {
    answer: {
      expand: { text: { classes: 'grey--text' } },
      controls: { classes: 'my-2', buttonsCol: { classes: 'd-flex pb-0' } },
    },
    feed: {
      activityCard: {
        classes: 'ma-4 shadow-card-blue rounded-lg',
        verb: {
          classes: 'grey--text',
        },
      },
      submissionPreview: {
        classes: 'pa-1',
        link: {
          classes: 'text-decoration-none black--text font-weight-bold',
        },
        stats: {
          classes: 'd-flex align-center mt-2',
        },
      },
      questionPreview: {
        classes: 'pa-1',
        link: {
          classes: 'text-decoration-none black--text font-weight-bold',
        },
        stats: {
          classes: 'd-flex mt-2',
        },
      },
    },
    upvoteBtn: {
      outlined: true,
    },
    upvotedBtn: {
      classes: 'primary',
    },
    userLink: {
      link: {
        classes: 'text-decoration-none',
      },
    },
    questionLink: {
      link: {
        classes: 'text-decoration-none black--text font-weight-bold',
      },
    },
    app: {
      background: 'rgb(248, 250, 252) !important',
    },
    baseCard: {
      classKey: 'c-card-blue',
    },
    home: {
      tabs: {
        backgroundColor: 'transparent',
      },
    },
    question: {
      answer: {
        classes: 'shadow-card-blue',
      },
    },
  },
};

export const updateHead = (routePath: string, title: string, descriptionText?: string) => {
  document.title = title;
  document.querySelector('meta[property="og.title"]')?.setAttribute('content', title);
  if (appName) {
    document.querySelector('meta[property="og.site_name"]')?.setAttribute('content', appName);
  }
  if (descriptionText) {
    document.querySelector('meta[name="description"]')?.setAttribute('content', descriptionText);
    document
      .querySelector('meta[property="description"]')
      ?.setAttribute('content', descriptionText);
    document
      .querySelector('meta[property="og.description"]')
      ?.setAttribute('content', descriptionText);
  }
  document.querySelector('meta[property="og.type"]')?.setAttribute('content', 'article');
  document
    .querySelector('meta[property="og.url"]')
    ?.setAttribute('content', 'https://cha.fan' + routePath);
};

export const INSUFFICIENT_KARMA_TO_JOIN_SITE = '加入圈子所需的 Karma 不足';
export const MISSING_REQUIRED_SECONDARY_EMAIL = '没有符合要求的次要邮箱绑定';

const errorMsgCN = {
  'The site with this id does not exist in the system': '圈子域名已存在',
  'The secondary email already exists': '次要邮件地址已存在',
  'Inactive user': '账户已暂停',
  "Author can't upvote authored question": '用户不能给自己的答案点赞',
  'Must provide verification code for non-secondary email': '必须验证非次要邮件地址',
  'Insufficient coins': '硬币不够了',
  "The topic doesn't exists in the system": '话题不存在',
  "The deposit doesn't exist in the system": '存款不存在',
  'No verified email': MISSING_REQUIRED_SECONDARY_EMAIL,
  'Invalid owner UUID': '所有者 UUID 无效',
  'The article column is not owned by current user': '当前用户不是专栏所有者',
  "The application doesn't exists in the system": '申请不存在',
  Unauthorized: '访问受限',
  'Unauthorized.': '访问受限',
  "The submission doesn't exists in the system": '分享不存在',
  "You can't invite yourself": '用户不能邀请自己',
  'Incorrect email or password': '错误的邮箱地址或密码',
  "The reward doesn't exists in the system": '奖励不存在',
  'Invalid site UUID': '圈子 UUID 无效',
  "The article_column doesn't exists in the system": '专栏不存在',
  "User can't follow self": '用户不能关注自己',
  "The user doesn't exist": '用户不存在',
  'Unsupported status': '不支持的状态',
  'The reward is already claimed': '奖励已经被领取',
  "The form doesn't exists in the system": '表格不存在',
  'Invalid task type': '无效任务类型',
  "Can't hide question with answers": '不能隐藏已经被回答的问题',
  "The site doesn't exist": '圈子不存在',
  'Must provide verification code for adding new secondary email': '添加次要地址必须提供验证码',
  'Invalid input': '无效输入',
  'Invalid submission UUID': '分享 UUID 无效',
  'Request failed': '请求失败',
  'Upload requires login': '上传需要登录',
  "The site doesn't exists in the system": '圈子不存在',
  'Invalid form response id': '无效的表格回答 ID',
  'The site with this subdomain already exists in the system': '该域名的圈子不存在',
  "The topic doesn't exist": '话题不存在',
  'Invalid token': '无效的 token',
  'The reward is not for current user': '当前用户不是奖励对象',
  "The answer doesn't exists in the system": '回答不存在',
  'You have saved an answer before': '保存过的答案',
  'Invalid invitation link':
    '邀请码已过期/用完，请联系站内用户重新生成或者前往 https://about.cha.fan/signup/ 申请，谢谢！',
  Claimed: '已领取',
  'Invalid link': '无效链接',
  "User can't unfollow self": '用户不能取关自己',
  'Incorrect hCaptcha': '无效的 CAPTCHA',
  'Wrong receiver': '错误的接受者',
  'Frondend bug: repeated posting in one writing session': '重复提交 bug',
  'Insufficient karma': 'Karma 不够',
  'Only author of submission can do this': '只有分享作者可以执行该动作',
  'Invalid email': '无效的邮箱地址',
  'Current user is not allowed in this site': '无圈子访问权限',
  "The question doesn't exists in the system": '问题不存在',
  'Wrong form': '错误的表格',
  'error_msg,': '错误信息',
  'User not found': '用户不存在',
  "The channel doesn't exists in the system": '聊天不存在',
  'Invalid new moderator UUID': '错误的管理员 UUID',
  'The reward condition is not met yet': '奖励条件尚不满足',
  'Invalid request': '无效请求',
  "Could not validate current user's JWT credentials": '无法验证用户身份',
  "Author can't upvote authored answer": '用户不能给自己的答案点赞',
  Applied: '已申请',
  'Cyclic parent topic relationship': '话题关系不合法',
  "The comment doesn't exists in the system": '评论不存在',
  'Missing hCaptcha token': '缺少 CAPTCHA token',
  'The user with this username already exists in the system': '该用户名已被使用',
  'Insuffient karma for joining site': INSUFFICIENT_KARMA_TO_JOIN_SITE,
  'Invalid category topic id': '无效的话题类型ID',
  "Author can't upvote authored comment": '不能给自己的评论点赞',
  'The verification code is not present in the system': '验证码无效',
  "The receiver can't post answer for that question": '接受者不能回答问题',
  'Duplicated ref_id': '重复的参考ID',
  'The site with this name already exists in the system': '圈子名重复',
  'No such account': '账户不存在',
  Unauthenticated: '尚未认证',
  'Invalid hostname for link preview': '链接预览的域名不合法',
  'Could not validate credentials': '无法验证身份',
  'Invalid amount': '无效的数量',
  "The site doesn't have moderator": '圈子没有管理员',
  "The submission_suggestion doesn't exists in the system": '分享编辑建议不存在',
  "The article doesn't exists in the system": '文章不存在',
  'The answer is not authored by current user': '当前用户不是答案作者',
  "The article column doesn't exist": '专栏不存在',
  'The reward is already refunded': '奖励已经被退回',
  'The user with this email already exists in the system': '邮件地址已经被使用',
  'The reward is already expired': '奖励已失效',
  'Only author of suggestion can do this': '只有建议的提交者可以执行此动作',
  'Insuffient coins': '硬币不足',
  'Unknown status': '无效状态',
  "The message doesn't exists in the system": '消息不存在',
  "User doesn't exist": '用户不存在',
  "You haven't voted yet": '你还没有点赞',
  "You can't upvote twice": '你不能重复点赞',
  'The site is not moderated by current user': '当前用户不是圈子管理员',
  'Not pending': '已经结束',
  'Invalid verification code': '无效的验证码',
  "The secondary email doesn't exist": '次要地址不存在',
  'The user with this username does not exist in the system': '用户名不存在',
  "The followed_user doesn't exists in the system": '关注的用户不存在',
  'The comment has too many or too few parent ids': '评论的所属关系不合法',
  "Author can't upvote authored submission": '用户不能给自己的分享点赞',
  "The receiver doesn't exists in the system": '接受者不存在',
  "Can't change accepted suggestion": '不能修改已被接受的提议',
  "Author can't upvote authored article": '作者不能给自己的文章点赞',
  'The user with this email does not exist in the system': '该邮箱地址的用户不存在',
  "The circle doesn't exists in the system": '圈子不存在',
  'The profile exists': '已存在',
  "The user doesn't have enough privileges": '权限不够',
  'Invalid user UUID': '无效的用户 UUID',
  "The username can't be empty": '用户名不能为空',
  "The payee doesn't exist in the system": '支付对方不存在',
  "The user doesn't exists in the system": '用户不存在',
  'The comment is not authored by the current user': '不是评论作者',
  'This primary email is already used in the website': '该主要邮箱地址已经存在',
  "The form doesn't belong to current user": '不是表格作者',
  'Open user registration is forbidden on this server': '用户注册尚未开放',
  'Not for a specific site': '不是为了某一个圈子',
  'Question has at least one answers': '问题已被回答',
  'Invalid password': '无效的密码',
  'Delete answer failed': '删除答案失败',
};

export const translateErrorMsgCN = (s: string) => {
  if (s in errorMsgCN) {
    return errorMsgCN[s];
  }
  if (s + '.' in errorMsgCN) {
    return errorMsgCN[s + '.'];
  }
  if (s[s.length - 1] === '.' && s.substr(0, s.length - 1) in errorMsgCN) {
    return errorMsgCN[s.substr(0, s.length - 1)];
  }
  return s;
};

export class CVue extends Vue {
  get isUserMode() {
    return readUserMode(this.$store);
  }

  get currentUserId() {
    return readUserProfile(this.$store)?.uuid;
  }

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get theme() {
    return themeDefs[readTheme(this.$store)];
  }

  get token() {
    return readToken(this.$store);
  }

  get userProfile() {
    return readUserProfile(this.$store);
  }

  get isDesktop() {
    return this.$vuetify.breakpoint.mdAndUp;
  }

  protected expectOkAndCommitMsg(response: IGenericResponse, msg: string) {
    if (response.success) {
      commitAddNotification(this.$store, {
        content: msg,
        color: 'success',
      });
    } else {
      commitAddNotification(this.$store, {
        content: '服务器错误',
        color: 'error',
      });
    }
  }

  commitErrMsg(err: AxiosError) {
    if (err.response && err.response.data && err.response.data.detail) {
      const translated = translateErrorMsgCN(err.response.data.detail);
      commitAddNotification(this.$store, {
        content: translated,
        color: 'warning',
      });
      return translated;
    }
    return null;
  }

  async sendToAdmin(msg: string) {
    const r0 = await api.createChannel(this.token, {
      private_with_user_uuid: adminUUID!,
    });
    const channelId = r0.data.id;
    await api.createMessage(this.token, {
      channel_id: channelId,
      body: msg,
    });
    commitAddNotification(this.$store, {
      content: '已通知管理员',
      color: 'info',
    });
    await this.$router.push(`/channels/${channelId}`);
  }
}

export const themeLocalStorageKey = 'chafan.theme';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const doNothing = () => {};
