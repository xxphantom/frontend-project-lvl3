import _ from 'lodash';

test('Example test', () => {
  const result = _.join(['I', 'Love', 'Hexlet!'], ' ');
  expect('I Love Hexlet!').toBe(result);
});
