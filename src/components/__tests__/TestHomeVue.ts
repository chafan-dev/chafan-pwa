import { CombinedActivities } from '@/CombinedActivities';
import { IActivity } from '@/interfaces';

test('TestHomeVue', () => {
  expect(new CombinedActivities().items).toStrictEqual([]);
  const inputActivities: IActivity[] = [
    {
      id: 1,
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
            social_annotations: {},
          },
          question: {
            uuid: 'q1',
            author: {
              uuid: 'u1',
              handle: 'u1',
              karma: 0,
              social_annotations: {},
            },
            title: 'q1 title',
            site: null!,
            is_placed_at_home: false,
            created_at: '2021-01-29T23:31:21.630841-08:00',
            answers_count: 0,
            comments_count: 0,
          },
        },
      },
    },
  ];
  const c1 = new CombinedActivities();
  for (const a1 of inputActivities) {
    c1.add(a1, 'tail');
  }
  expect(c1.items).toStrictEqual(inputActivities);
  inputActivities.push({
    id: 2,
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
          social_annotations: {},
        },
        question: {
          uuid: 'q1',
          title: 'q1 title',
          author: {
            uuid: 'u3',
            handle: 'u3',
            karma: 0,
            social_annotations: {},
          },
          site: null!,
          is_placed_at_home: false,
          created_at: '2021-01-29T23:31:21.630841-08:00',
          answers_count: 0,
          comments_count: 0,
        },
      },
    },
  });

  inputActivities.push({
    id: 3,
    created_at: '2021-01-30T23:31:21.630841-08:00',
    verb: 'upvote_question',
    event: {
      created_at: '2021-01-30T23:31:21.630841-08:00',
      content: {
        verb: 'upvote_question',
        subject: {
          uuid: 'u3',
          handle: 'u3',
          karma: 0,
          social_annotations: {},
        },
        question: {
          uuid: 'q1',
          title: 'q1 title',
          author: {
            uuid: 'u3',
            handle: 'u3',
            karma: 0,
            social_annotations: {},
          },
          site: null!,
          is_placed_at_home: false,
          created_at: '2021-01-29T23:31:21.630841-08:00',
          answers_count: 0,
          comments_count: 0,
        },
      },
    },
  });

  const c2 = new CombinedActivities();
  for (const a2 of inputActivities) {
    c2.add(a2, 'tail');
  }
  expect(c1.items).toStrictEqual([
    {
      id: 1,
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
            social_annotations: {},
          },
          subjects: [
            {
              uuid: 'u1',
              handle: 'u1',
              karma: 0,
              social_annotations: {},
            },
            {
              uuid: 'u2',
              handle: 'u2',
              karma: 0,
              social_annotations: {},
            },
            {
              uuid: 'u3',
              handle: 'u3',
              karma: 0,
              social_annotations: {},
            },
          ],
          question: {
            uuid: 'q1',
            author: {
              uuid: 'u1',
              handle: 'u1',
              karma: 0,
              social_annotations: {},
            },
            title: 'q1 title',
            site: null!,
            is_placed_at_home: false,
            created_at: '2021-01-29T23:31:21.630841-08:00',
            answers_count: 0,
            comments_count: 0,
          },
        },
      },
    },
  ]);
});
