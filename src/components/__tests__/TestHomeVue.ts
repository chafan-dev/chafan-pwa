import { combinedActivities } from '@/home';
import { IActivity } from '@/interfaces';

test('TestHomeVue', () => {
  expect(combinedActivities([])).toStrictEqual([]);
  const inputActivities: IActivity[] = [
    {
      id: 1,
      site_uuid: '',
      created_at: '2021-01-30T23:31:21.630841-08:00',
      verb: 'upvote_question',
      event: {
        created_at: '2021-01-30T23:31:21.630841-08:00',
        content: {
          verb: 'upvote_question',
          subject: {
            uuid: 'u1',
            handle: 'u1',
            karma: 0,
          },
          question: {
            uuid: 'q1',
            title: 'q1 title',
            site: null!,
            is_placed_at_home: false,
            created_at: '2021-01-29T23:31:21.630841-08:00',
            answers_count: 0,
            upvotes_count: 0,
            comments_count: 0,
          },
        },
      },
    },
  ];
  expect(combinedActivities(inputActivities)).toStrictEqual(inputActivities);
  inputActivities.push({
    id: 2,
    site_uuid: '',
    created_at: '2021-01-30T23:31:21.630841-08:00',
    verb: 'upvote_question',
    event: {
      created_at: '2021-01-30T23:31:21.630841-08:00',
      content: {
        verb: 'upvote_question',
        subject: {
          uuid: 'u2',
          handle: 'u2',
          karma: 0,
        },
        question: {
          uuid: 'q1',
          title: 'q1 title',
          site: null!,
          is_placed_at_home: false,
          created_at: '2021-01-29T23:31:21.630841-08:00',
          answers_count: 0,
          upvotes_count: 0,
          comments_count: 0,
        },
      },
    },
  });
  expect(combinedActivities(inputActivities)).toStrictEqual([
    {
      id: 1,
      site_uuid: '',
      created_at: '2021-01-30T23:31:21.630841-08:00',
      verb: 'upvote_question_combined',
      event: {
        created_at: '2021-01-30T23:31:21.630841-08:00',
        content: {
          verb: 'upvote_question_combined',
          subjects: [
            {
              uuid: 'u1',
              handle: 'u1',
              karma: 0,
            },
            {
              uuid: 'u2',
              handle: 'u2',
              karma: 0,
            },
          ],
          question: {
            uuid: 'q1',
            title: 'q1 title',
            site: null!,
            is_placed_at_home: false,
            created_at: '2021-01-29T23:31:21.630841-08:00',
            answers_count: 0,
            upvotes_count: 0,
            comments_count: 0,
          },
        },
      },
    },
  ]);
});
