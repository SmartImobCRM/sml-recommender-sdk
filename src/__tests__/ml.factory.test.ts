import { Factory } from '../../lib';

test('[ml] Factory', () => {
  const f1 = new Factory({ imoveis: [] });
  expect(f1.dummy_names.length).toBeGreaterThan(1);
  expect(f1.dummy_ws.length).toBeGreaterThan(1);
});
