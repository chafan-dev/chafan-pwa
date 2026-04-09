import { ThemeType } from '@/interfaces';

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
      expand: { text: { classes: 'text-primary' } },
      controls: { classes: '', buttonsCol: { classes: 'd-flex pb-0' } },
    },
    feed: {
      submissionPreview: {
        classes: 'pa-2',
        link: {
          classes: 'text-decoration-none',
        },
        stats: {
          classes: 'd-flex align-center pt-2',
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
        classes: 'text-decoration-none text-grey-darken-2',
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
      expand: { text: { classes: 'text-grey' } },
      controls: { classes: 'my-2', buttonsCol: { classes: 'd-flex pb-0' } },
    },
    feed: {
      activityCard: {
        classes: 'ma-4 shadow-card-blue rounded-lg',
        verb: {
          classes: 'text-grey',
        },
      },
      submissionPreview: {
        classes: 'pa-1',
        link: {
          classes: 'text-decoration-none text-black font-weight-bold',
        },
        stats: {
          classes: 'd-flex align-center mt-2',
        },
      },
      questionPreview: {
        classes: 'pa-1',
        link: {
          classes: 'text-decoration-none text-black font-weight-bold',
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
        classes: 'text-decoration-none text-black font-weight-bold',
      },
    },
    app: {
      background: 'rgb(248, 250, 252)',
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

export const themeLocalStorageKey = 'chafan.theme';
