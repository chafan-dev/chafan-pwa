/**
 * Test: AppIcon component and icon map integrity
 *
 * Validates that AppIcon.vue exists and all icon names in iconMap resolve to valid SVG paths.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('AppIcon and iconMap', () => {
  const iconsDir = path.join(__dirname, '../icons');

  it('AppIcon.vue should exist', () => {
    expect(fs.existsSync(path.join(iconsDir, 'AppIcon.vue'))).toBe(true);
  });

  it('AppIcon.vue should use v-bind="$attrs" and <script setup>', () => {
    const content = fs.readFileSync(path.join(iconsDir, 'AppIcon.vue'), 'utf-8');
    expect(content).toContain('v-bind="$attrs"');
    expect(content).toContain('<script setup');
  });

  it('iconMap should export a non-empty record', async () => {
    const { iconMap } = await import('../icons/iconMap');
    expect(Object.keys(iconMap).length).toBeGreaterThan(50);
    // All values should be non-empty strings (SVG paths)
    for (const [name, path] of Object.entries(iconMap)) {
      expect(typeof path).toBe('string');
      expect((path as string).length).toBeGreaterThan(0);
    }
  });

  it('ZhihuIcon.vue should still exist as a custom SVG icon', () => {
    expect(fs.existsSync(path.join(iconsDir, 'ZhihuIcon.vue'))).toBe(true);
  });
});
