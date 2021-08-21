import { apiQuestion } from '@/api/question';
import { apiUrl, appName } from '@/env';

export const URLRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}(\.[a-zA-Z0-9()]{1,6})?\b([-a-zA-Z0-9()@:,%_\+.~#?&//=]*)/gi;

export const NARROW_FEED_UI_KEY = 'narrowFeedUI';
export const LABS_TIPTAP_EDITOR_OPTION = 'labs.tiptap-editor-option';
export const LABS_DEV_THEME_OPTION = 'labs.dev-theme-option';
export const YES_FLAG = 'user-agreement-yes';
export const FAB_FLAG = 'webfront-fab-clicked';
export const EXPLORE_SITES = 'closed-explore-sites-in-home';

export { isEqual } from 'lodash';
import { api } from '@/api';
import { ThemeType } from '@/interfaces';
import { Vue } from 'vue-property-decorator';
import { readTheme, readToken, readUserMode, readUserProfile } from '@/store/main/getters';

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
      expand: { text: { classes: 'primary-text' } },
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

export class CVue extends Vue {
  get isUserMode() {
    return readUserMode(this.$store);
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
}

export const themeLocalStorageKey = 'chafan.theme';
