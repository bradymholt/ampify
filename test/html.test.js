const assert = require('./assert').includes;

describe('html amp tag', () => {
  test('should add amp attribute on html tag', async () => {
    await assert(
      '<html></html>',
      '<html amp>',
      {},
    );
  });
});
