import { vi, describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';

// Event.vue only needs the current user's id from the auth composable.
vi.mock('@/composables', () => ({
  useAuth: () => ({ currentUserId: ref('me-uuid') }),
}));

// Children that would drag in Vuetify / the store are replaced with plain
// markers so the assertions read as the sentence a user sees.
vi.mock('@/components/UserLink.vue', () => ({
  default: defineComponent({
    props: ['userPreview'],
    template: '<a class="user">@{{ userPreview.handle }}</a>',
  }),
}));
vi.mock('@/components/RelativeTime.vue', () => ({
  default: defineComponent({ template: '<span>刚刚</span>' }),
}));

import Event from '@/components/Event.vue';
import Interpolate from '@/components/Interpolate.vue';

const user = (handle: string, uuid = handle + '-uuid') => ({ uuid, handle, karma: 0 });
const question = { uuid: 'q1', title: '大家现在工作之余有什么爱好吗？' };
const comment = { uuid: 'c1', content: { rendered_text: '哈哈，也是。' } };

function render(content: Record<string, unknown>) {
  const w = mount(Event, {
    props: { event: { created_at: '2026-09-17T00:00:00Z', content } as never },
    global: { stubs: { RouterLink: RouterLinkStub } },
  });
  return w.text().replace(/\s+/g, '');
}

describe('Event', () => {
  it('renders the verb between the subject and the object', () => {
    expect(render({ verb: 'follow_user', subject: user('xsw0'), user: user('me', 'me-uuid') })).toBe(
      '@xsw0关注了我(刚刚)'
    );
  });

  it('places comment and question previews inside the sentence', () => {
    expect(
      render({ verb: 'comment_question', subject: user('RetroWaves'), comment, question })
    ).toBe('@RetroWaves添加了新评论「哈哈，也是。」（所属问题：「大家现在工作之余有什么爱好吗？」）(刚刚)');
  });

  it('resolves {question} from the answer when the event carries only an answer', () => {
    expect(
      render({
        verb: 'upvote_answer',
        subject: user('a'),
        answer: { uuid: 'a1', body: '回答正文', question },
      })
    ).toBe('@a赞了回答「回答正文」(所属问题：「大家现在工作之余有什么爱好吗？」)(刚刚)');
  });

  it('says 我 when the subject is the current user', () => {
    expect(render({ verb: 'create_question', subject: user('me', 'me-uuid'), question })).toBe(
      '我创建了问题「大家现在工作之余有什么爱好吗？」(刚刚)'
    );
  });

  it('falls back to the raw verb for an unknown event type', () => {
    expect(render({ verb: 'brand_new_verb' })).toBe('brand_new_verb(刚刚)');
  });
});

describe('Interpolate', () => {
  it('substitutes slots for placeholders and drops unfilled ones', () => {
    const w = mount(Interpolate, {
      props: { template: '{a}和{b}，还有{c}' },
      slots: { a: '<b>甲</b>', b: '乙' },
    });
    expect(w.text()).toBe('甲和乙，还有');
    expect(w.find('b').exists()).toBe(true);
  });
});
