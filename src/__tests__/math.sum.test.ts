import sum from '../sum';

test('[math] Sum', () => {
  const a = [2, 7, 1];
  expect(sum(a)).toBe(10);
});
