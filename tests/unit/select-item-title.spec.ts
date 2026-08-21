import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { h, nextTick } from 'vue';

// Vuetify 2 named the item label prop `item-text`; Vuetify 3 renamed it to
// `item-title`. The old spelling is silently ignored and every option renders
// as "[object Object]" — the bug that hit 写文章 → 选择专栏 on cha.fan.
// These are the two item shapes the app feeds v-select/v-autocomplete.
const shapes = [
  { label: 'name/uuid (article columns, sites, topics)', items: [{ name: '纯粹测试用的专栏', uuid: 'u1' }], titleKey: 'name', valueKey: 'uuid' },
  { label: 'text/value (settings, visibility, report reasons)', items: [{ text: '公开可读', value: 'anyone' }], titleKey: 'text', valueKey: 'value' },
];

// jsdom lacks the two browser APIs Vuetify's overlay positioning reaches for.
(globalThis as unknown as { visualViewport: unknown }).visualViewport = {
  width: 1024,
  height: 768,
  offsetLeft: 0,
  offsetTop: 0,
  scale: 1,
  addEventListener() {},
  removeEventListener() {},
};
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Vuetify teleports the open menu to document.body, so each mount has to start
// from a clean body or the previous test's options are still in textContent.
async function renderMenu(props: Record<string, unknown>) {
  document.body.innerHTML = '';
  const vuetify = createVuetify({ components, directives });
  const wrapper = mount(
    { render: () => h(components.VSelect, { ...props, menu: true }) },
    { global: { plugins: [vuetify] }, attachTo: document.body }
  );
  await nextTick();
  await nextTick();
  return document.body.textContent ?? '';
}

describe('v-select option labels', () => {
  for (const shape of shapes) {
    it(`renders the label for ${shape.label}`, async () => {
      const text = await renderMenu({
        items: shape.items,
        'item-title': shape.titleKey,
        'item-value': shape.valueKey,
      });
      expect(text).toContain(Object.values(shape.items[0])[0]);
      expect(text).not.toContain('[object Object]');
    });

    it(`still breaks with the Vuetify 2 item-text spelling for ${shape.label}`, async () => {
      const text = await renderMenu({
        items: shape.items,
        'item-text': shape.titleKey,
        'item-value': shape.valueKey,
      });
      expect(text).toContain('[object Object]');
    });
  }
});
