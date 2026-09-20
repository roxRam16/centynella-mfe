import { getInitials } from './text';

describe('getInitials', () => {
  it.each([
    ['Ana Pérez', 'AP'],
    ['ana maría pérez lópez', 'AM'],
    ['  luis  ', 'L'],
    ['', '?'],
  ])('"%s" → %s', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});
