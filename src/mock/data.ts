import { IQuestionPreview, IQuestionUpvotes, ISite, IUserPreview } from '@/interfaces';

const EXAMPLE_USER1_UUID = 'example-user-1-uuid';
const EXAMPLE_USER1_HANDLE = 'example-user-1';
const EXAMPLE_USER1_FULL_NAME = 'Example User 1';

const example_user1_preview = {
  uuid: EXAMPLE_USER1_UUID,
  handle: EXAMPLE_USER1_HANDLE,
  full_name: EXAMPLE_USER1_FULL_NAME,
  karma: 0,
};

const EXAMPLE_USER2_UUID = 'example-user-2-uuid';
const EXAMPLE_USER2_HANDLE = 'example-user-2';

const example_user2_preview: IUserPreview = {
  uuid: EXAMPLE_USER2_UUID,
  handle: EXAMPLE_USER2_HANDLE,
  karma: 2791,
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
