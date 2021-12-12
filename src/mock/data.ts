import {
  IAnswer,
  IAnswerPreview,
  IAnswerUpvotes,
  IQuestionPreview,
  IQuestionUpvotes,
  ISite,
  ISubmission,
  ISubmissionUpvotes,
  IUserPreview,
} from '@/interfaces';

const EXAMPLE_USER1_UUID = 'example-user-1-uuid';
const EXAMPLE_USER1_HANDLE = 'example-user-1';
const EXAMPLE_USER1_FULL_NAME = 'Example User 1';
const exampleLongTextPreview =
  '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客...';
const exampleLongText =
  '壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。少焉，月出于东山之上，徘徊于斗牛之间。白露横江，水光接天。纵一苇之所如，凌万顷之茫然。浩浩乎如冯虚御风，而不知其所止；飘飘乎如遗世独立，羽化而登仙。 \n' +
  '\n' +
  '　　于是饮酒乐甚，扣舷而歌之。歌曰：“桂棹兮兰桨，击空明兮溯流光。渺渺兮于怀，望美人兮天一方。”客有吹洞萧者，倚歌而和之，其声呜呜然：如怨如慕，如泣如诉；余音袅袅，不绝如缕；舞幽壑之潜蛟，泣孤舟之嫠妇。 \n' +
  '\n' +
  '　　苏子愀然，正襟危坐，而问客曰：“何为其然也？”客曰：“月明星稀，乌鹊南飞，此非曹孟德之诗乎？西望夏口，东望武昌。山川相缪，郁乎苍苍；此非孟德之困于周郎者乎？方其破荆州，下江陵，顺流而东也，舳舻千里，旌旗蔽空，酾酒临江，横槊赋诗；固一世之雄也，而今安在哉？况吾与子，渔樵于江渚之上，侣鱼虾而友糜鹿，驾一叶之扁舟，举匏樽以相属；寄蜉蝣与天地，渺沧海之一粟。哀吾生之须臾，羡长江之无穷；挟飞仙以遨游，抱明月而长终；知不可乎骤得，托遗响于悲风。” \n' +
  '\n' +
  '　　苏子曰：“客亦知夫水与月乎？逝者如斯，而未尝往也；盈虚者如彼，而卒莫消长也。盖将自其变者而观之，而天地曾不能一瞬；自其不变者而观之，则物于我皆无尽也。而又何羡乎？且夫天地之间，物各有主。苟非吾之所有，虽一毫而莫取。惟江上之清风，与山间之明月，耳得之而为声，目遇之而成色。取之无禁，用之不竭。是造物者之无尽藏也，而吾与子之所共适。” \n' +
  '\n' +
  '　　客喜而笑，洗盏更酌，肴核既尽，杯盘狼藉。相与枕藉乎舟中，不知东方之既白。 ';

const example_user1_preview = {
  uuid: EXAMPLE_USER1_UUID,
  handle: EXAMPLE_USER1_HANDLE,
  full_name: EXAMPLE_USER1_FULL_NAME,
  karma: 0,
  social_annotations: {},
};

const EXAMPLE_USER2_UUID = 'example-user-2-uuid';
const EXAMPLE_USER2_HANDLE = 'example-user-2';

const example_user2_preview: IUserPreview = {
  uuid: EXAMPLE_USER2_UUID,
  handle: EXAMPLE_USER2_HANDLE,
  karma: 2791,
  social_annotations: {},
};

const EXAMPLE_SITE1_SUBDOMAIN = 'internet-things';

const example_site1: ISite = {
  auto_approval: false,
  members_count: 0,
  public_writable_submission: false,
  questions_count: 0,
  submissions_count: 0,
  description: '讨论互联网产品的设计和体验',
  uuid: '3noQmrdUbubY9ojPerYA',
  name: '互联网产品',
  subdomain: EXAMPLE_SITE1_SUBDOMAIN,
  public_readable: true,
  public_writable_question: true,
  public_writable_answer: true,
  public_writable_comment: true,
  create_question_coin_deduction: 2,
  topics: [],
  moderator: example_user2_preview,
  permission_type: 'public',
};

const example_site2: ISite = {
  auto_approval: false,
  members_count: 0,
  public_writable_submission: false,
  questions_count: 0,
  submissions_count: 0,
  description:
    '讨论互联网产品的设计和体验2 https://cha.fan/example/example/example/example/example/example/example/example/example',
  uuid: '3noQmrdUbubY9ojPerYB',
  name: '互联网产品2',
  subdomain: EXAMPLE_SITE1_SUBDOMAIN,
  public_readable: true,
  public_writable_question: true,
  public_writable_answer: true,
  public_writable_comment: true,
  create_question_coin_deduction: 2,
  topics: [],
  moderator: example_user2_preview,
  permission_type: 'public',
};

export const exampleQuestionPreview: IQuestionPreview = {
  uuid: '6gpPVpfHJnEh4NfbZ4VY',
  author: example_user1_preview,
  title: 'Twitter, Facebook 类型的社交网络在未来会不会变成政府依靠税收运营的公共基础设施？',
  site: example_site1,
  is_placed_at_home: false,
  created_at: '2021-02-02T20:02:56.170487+00:00',
  answers_count: 11,
  comments_count: 3,
};

export const exampleQuestionUpvotes: IQuestionUpvotes = {
  question_uuid: exampleQuestionPreview.uuid,
  upvoted: false,
  count: 2,
};

function randomString() {
  return Math.random()
    .toString(36)
    .substring(2, 5 + Math.ceil(Math.random() * 10));
}

function randomSentence() {
  let s = '';
  const words = Math.ceil(Math.random() * 20);
  for (let i = 0; i < words; i++) {
    s += randomString() + ' ';
  }
  return s;
}

export const randomUserPreviews: IUserPreview[] = [];
for (let i = 0; i < 10; i++) {
  const uuid = randomString();
  randomUserPreviews.push({
    uuid: uuid,
    handle: uuid + '_handle',
    full_name: i % 2 === 0 ? uuid + ' (FN)' : undefined,
    karma: 0,
    personal_introduction: randomSentence(),
    social_annotations: {},
    follows: {
      user_uuid: uuid,
      followers_count: i,
      followed_count: 10 - i,
      followed_by_me: i % 2 === 0,
    },
  });
}

export const exampleSubmission: ISubmission = {
  contributors: [],
  uuid: 'submission-0001',
  title: '知乎提交赴美 IPO 申请',
  desc: {
    source: 'Test',
    editor: 'markdown',
  },
  url: 'https://readhub.cn/topic/84nlE5nwJaO',
  created_at: '2021-03-05T19:30:54.694708+00:00',
  updated_at: '2021-03-05T19:30:57.482069+00:00',
  topics: [],
  author: example_user1_preview,
  comments: [],
  site: example_site1,
  view_times: 2,
};

export const exampleSubmissionUpvotes: ISubmissionUpvotes = {
  submission_uuid: exampleSubmission.uuid,
  upvoted: false,
  count: 2,
};

export const sites: ISite[] = [example_site1, example_site2];

const exampleAnswerUUID = 'answer-0001';

export const exampleAnswerPreview: IAnswerPreview = {
  uuid: exampleAnswerUUID,
  author: example_user1_preview,
  question: exampleQuestionPreview,
  body: exampleLongTextPreview,
  body_is_truncated: true,
  upvotes_count: 12,
  is_hidden_by_moderator: false,
};

export const exampleAnswer: IAnswer = {
  archives_count: 0,
  bookmarked: false,
  uuid: exampleAnswerUUID,
  author: example_user1_preview,
  site: example_site1,
  question: exampleQuestionPreview,
  updated_at: '2021-03-05T19:30:57.482069+00:00',
  is_published: true,
  comments: [],
  is_hidden_by_moderator: false,
  view_times: 100,
  comment_writable: true,
  bookmark_count: 12,
  visibility: 'anyone',
  content: {
    source: exampleLongText,
    rendered_text: exampleLongText,
    editor: 'markdown',
  },
};

export const exampleAnswerUpvotes: IAnswerUpvotes = {
  answer_uuid: exampleAnswerUUID,
  count: 23,
  upvoted: false,
};
