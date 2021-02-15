import stopwords from '../stopwords';

test('[util] Stopwords', () => {
  expect(stopwords.length).toBeGreaterThan(10);
  expect(stopwords[0]).toBeDefined();
  expect(typeof stopwords[0]).toBe('string');
});
