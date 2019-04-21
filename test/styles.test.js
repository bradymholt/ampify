const path = require("path");
const assert = require("./assert").includes;

describe("inline styles", () => {
  test("should inject inline css into style tag", async () => {
    await assert(
      '<link rel="stylesheet" href="styles.css">',
      '<style amp-custom>body { background-color: #FFF; }',
      { cwd: __dirname.split(path.sep).pop() }
    );
  });
});
