import std_scaler from '../std_scaler';

test('[ml] Standard Scaler', () => {
  const a = [
    [3.0, 0.0],
    [0.0, 2.0],
    [1.0, 1.0],
    [8.0, 1.0],
  ];
  expect(std_scaler(a)).toStrictEqual([
    [0, -1.414213562373095],
    [-0.9733285267845753, 1.414213562373095],
    [-0.6488856845230502, 0],
    [1.6222142113076254, 0],
  ]);
});
