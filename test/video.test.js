const assert = require("./assert").includes;

describe("amp-video tag", () => {
  test("adds the amp video script in head", async () => {
    await assert(
      '<video src="test.mpg">',
      `<script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>`,
      {}
    );
  });

  test("should replace video tag with amp-video", async () => {
    await assert(
      '<video src="test.mpg">',
      '<amp-video src="test.mpg"></amp-video>',
      {}
    );
  });
});
