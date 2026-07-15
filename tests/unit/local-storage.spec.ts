import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getLocalToken,
  saveLocalToken,
  removeLocalToken,
  getLocalValue,
  setLocalValue,
  saveLocalEdit,
  loadLocalEdit,
  clearLocalEdit,
} from '@/utils/local-storage';

describe('local-storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves and reads auth token', () => {
    expect(getLocalToken()).toBeNull();
    saveLocalToken('abc');
    expect(getLocalToken()).toBe('abc');
    removeLocalToken();
    expect(getLocalToken()).toBeNull();
  });

  it('getLocalValue returns default when missing', () => {
    expect(getLocalValue('missing', 'fallback')).toBe('fallback');
  });

  it('setLocalValue and getLocalValue round-trip', () => {
    setLocalValue('theme', 'dark');
    expect(getLocalValue('theme')).toBe('dark');
  });

  it('save/load/clear local edit drafts', () => {
    const edit = { title: 'draft', body: 'hello', editor: 'tiptap' as const, visible: true };
    saveLocalEdit('answer', 'uuid-1', edit as any);
    const loaded = loadLocalEdit('answer', 'uuid-1');
    expect(loaded).not.toBeNull();
    expect(loaded!.edit).toEqual(edit);
    expect(loaded!.createdAt).toBeTruthy();

    clearLocalEdit('answer', 'uuid-1');
    expect(loadLocalEdit('answer', 'uuid-1')).toBeNull();
  });

  it('returns null when localStorage throws on load', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(getLocalToken()).toBeNull();
    expect(getLocalValue('x', 'd')).toBe('d');
  });
});
