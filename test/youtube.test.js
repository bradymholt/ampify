const assert = require("./assert").includes;

describe("amp-youtube script", () => {
  test("adds the amp youtube script in head", async () => {
    await assert(
      `<iframe src="http://www.youtube.com/embed/OO9oKhs80aI" width="560" height="315" frameborder="0" allowfullscreen></iframe>`,
      `<script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js">`,
      {}
    );
  });
});

describe("amp-youtube tag", () => {
  test("should replace youtube iframe tag with amp-youtube", async () => {
    await assert(
      `<html>
        <head></head>
        <body><iframe
            src="http://www.youtube.com/embed/OO9oKhs80aI"
            width="560"
            height="315"
            frameborder="0"
            allowfullscreen>
          </iframe>
        </body>
        </html>`,
      `\
    <amp-youtube data-videoid="OO9oKhs80aI" width="560" height="315" layout="responsive">
    </amp-youtube>`,
      {}
    );
  });

  test("should replace https://www.youtube.com/", async () => {
    await assert(
      `<html>
        <head></head>
        <body><iframe
            src="https://www.youtube.com/embed/OO9oKhs80aI"
            width="560"
            height="315"
            frameborder="0"
            allowfullscreen>
          </iframe>
        </body>
        </html>`,
      `\
    <amp-youtube data-videoid="OO9oKhs80aI" width="560" height="315" layout="responsive">
    </amp-youtube>`,
      {}
    );
  });
});
