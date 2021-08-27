import { apiQuestion } from '@/api/question';
import { apiUrl, appName } from '@/env';
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
export const LABS_DEV_THEME_OPTION = 'labs.dev-theme-option';
export const YES_FLAG = 'user-agreement-yes';
export const FAB_FLAG = 'webfront-fab-clicked';
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
    url: `${apiUrl}/api/v1/upload/vditor/`,
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
  document.querySelector('meta[property="og.site_name"]')?.setAttribute('content', appName);
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

export const errorMsgCN = {
  'The site with this id does not exist in the system': '圈子域名已存在',
  'The secondary email already exists.': '',
  'Inactive user': '',
  "Author can't upvote authored question.": '',
  'Must provide verification code for non-secondary email.': '',
  'Insufficient coins.': '',
  "The topic doesn't exists in the system.": '',
  "The deposit doesn't exist in the system.": '',
  'No verified email.': '',
  'Invalid owner UUID': '',
  'The article column is not owned by current user.': '',
  "The application doesn't exists in the system.": '',
  'Unauthorized.': '',
  "The submission doesn't exists in the system.": '',
  "You can't invite yourself.": '',
  'Incorrect email or password': '',
  "The reward doesn't exists in the system.": '',
  'Invalid site UUID': '',
  "The article_column doesn't exists in the system.": '',
  "User can't follow self.": '',
  "The user doesn't exist.": '',
  'Unsupported status.': '',
  'The reward is already claimed': '',
  "The form doesn't exists in the system.": '',
  'Invalid task type.': '',
  "Can't hide question with answers.": '',
  "The site doesn't exist.": '',
  'Must provide verification code for adding new secondary email.': '',
  'Invalid input.': '',
  'Invalid submission UUID.': '',
  'Request failed.': '',
  'Upload requires login.': '',
  Unauthorized: '',
  "The site doesn't exists in the system.": '',
  'Invalid form response id.': '',
  'The site with this subdomain already exists in the system.': '',
  "The topic doesn't exist.": '',
  'Invalid token': '',
  'The reward is not for current user': '',
  "The answer doesn't exists in the system.": '',
  'You have saved an answer before.': '',
  'Invalid invitation link':
    '邀请码已过期/用完，请联系站内用户重新生成或者前往 https://about.cha.fan/signup/ 申请，谢谢！',
  'Claimed.': '',
  'Invalid link': '',
  "User can't unfollow self.": '',
  'Incorrect hCaptcha': '',
  'Wrong receiver.': '',
  'Frondend bug: repeated posting in one writing session.': '',
  'Insufficient karma.': '',
  'Only author of submission can do this.': '',
  'Invalid email.': '',
  'Current user is not allowed in this site.': '',
  "The question doesn't exists in the system.": '问题不存在',
  'Wrong form.': '',
  'error_msg,': '',
  'User not found': '',
  "The channel doesn't exists in the system.": '',
  'Invalid new moderator UUID': '',
  'The reward condition is not met yet': '',
  'Invalid request.': '',
  "Could not validate current user's JWT credentials": '',
  "Author can't upvote authored answer.": '',
  'Applied.': '',
  'Cyclic parent topic relationship.': '',
  "The comment doesn't exists in the system.": '',
  'Missing hCaptcha token': '',
  'The user with this username already exists in the system': '',
  'Insuffient karma for joining site.': '',
  'Invalid category topic id.': '',
  "Author can't upvote authored comment.": '',
  'The verification code is not present in the system.': '',
  "The receiver can't post answer for that question.": '',
  'Duplicated ref_id.': '',
  'The site with this name already exists in the system.': '',
  'No such account.': '',
  'Unauthenticated.': '',
  'Invalid hostname for link preview.': '',
  'Could not validate credentials': '',
  'Invalid amount.': '',
  "The site doesn't have moderator.": '',
  "The submission_suggestion doesn't exists in the system.": '',
  "The article doesn't exists in the system.": '文章不存在',
  'The answer is not authored by current user.': '',
  "The article column doesn't exist.": '',
  'Invalid site UUID.': '',
  'The reward is already refunded': '',
  'The user with this email already exists in the system': '',
  'The reward is already expired': '',
  'Only author of suggestion can do this.': '',
  'Insuffient coins.': '',
  'Unknown status.': '',
  "The message doesn't exists in the system.": '',
  "User doesn't exist.": '',
  "You haven't voted yet.": '',
  "You can't upvote twice.": '',
  'The site is not moderated by current user.': '',
  'The user with this email already exists in the system.': '',
  'Not pending.': '',
  'Invalid verification code.': '',
  "The secondary email doesn't exist.": '',
  'The user with this username does not exist in the system': '',
  "The followed_user doesn't exists in the system.": '',
  'The comment has too many or too few parent ids.': '',
  "Author can't upvote authored submission.": '',
  "The receiver doesn't exists in the system.": '',
  "Can't change accepted suggestion.": '',
  "Author can't upvote authored article.": '',
  'The user with this email does not exist in the system.': '',
  "The circle doesn't exists in the system.": '',
  'The profile exists.': '',
  "The user doesn't have enough privileges": '',
  'Invalid user UUID.': '',
  "The username can't be empty": '',
  "The payee doesn't exist in the system.": '',
  "The user doesn't exists in the system.": '',
  'The comment is not authored by the current user.': '',
  'This primary email is already used in the website.': '该主要邮箱地址已经存在',
  "The form doesn't belong to current user.": '',
  'Open user registration is forbidden on this server': '',
  'Not for a specific site': '',
  'Question has at least one answers.': '',
  'Invalid password.': '',
  'Delete answer failed.': '',
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

  protected commitErrMsg(err: AxiosError): boolean {
    if (err.response && err.response.data.detail in errorMsgCN) {
      let content = errorMsgCN[err.response.data.detail];
      if (content === '') {
        content = err.response.data.detail;
      }
      commitAddNotification(this.$store, {
        content: content,
        color: 'error',
      });
      return true;
    }
    return false;
  }
}

export const themeLocalStorageKey = 'chafan.theme';
