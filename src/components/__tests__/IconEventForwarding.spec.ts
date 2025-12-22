/**
 * Test: Icon components must forward events via v-on="$listeners"
 *
 * Background:
 * In Vue 2.7, $attrs and $listeners are separate. When converting class-based
 * components to Composition API, we must include BOTH:
 *   - v-bind="$attrs" (forwards non-prop attributes)
 *   - v-on="$listeners" (forwards event listeners)
 *
 * In Vue 3, $listeners is merged into $attrs, so only v-bind="$attrs" is needed.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Icon components event forwarding (Vue 2.7)', () => {
  const iconsDir = path.join(__dirname, '../icons');

  // Get all icon component files
  const iconFiles = fs.readdirSync(iconsDir).filter((file) => file.endsWith('.vue'));

  it('should have icon components to test', () => {
    expect(iconFiles.length).toBeGreaterThan(0);
  });

  iconFiles.forEach((iconFile) => {
    describe(iconFile, () => {
      const filePath = path.join(iconsDir, iconFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      it('must include v-on="$listeners" for Vue 2.7 event forwarding', () => {
        // Check if component uses v-bind="$attrs" (indicating it's a forwarding component)
        const usesAttrs = content.includes('v-bind="$attrs"');

        if (usesAttrs) {
          // If it uses $attrs, it MUST also use $listeners in Vue 2.7
          const usesListeners = content.includes('v-on="$listeners"');
          expect(usesListeners).toBe(true);
        }
      });

      it('should use <script setup> syntax if it uses v-bind="$attrs"', () => {
        // Only check for <script setup> on components using the forwarding pattern
        // Some icons (e.g., ZhihuIcon with custom SVG) may have different structure
        const usesAttrs = content.includes('v-bind="$attrs"');

        if (usesAttrs) {
          const usesScriptSetup = content.includes('<script setup');
          expect(usesScriptSetup).toBe(true);
        }
      });
    });
  });
});
