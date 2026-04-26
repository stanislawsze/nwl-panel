import { describe, expect, it } from 'vitest';

import { title } from './format';

describe('title', () => {
  it('formats role-like values for labels', () => {
    expect(title('support')).toBe('Support');
    expect(title('current_tenant')).toBe('Current tenant');
  });

  it('handles empty values', () => {
    expect(title(null)).toBe('Unknown');
    expect(title(undefined)).toBe('Unknown');
  });
});
