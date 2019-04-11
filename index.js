const fs = require("fs");
const url = require("url");
const axios = require("axios");
const cheerio = require("cheerio");
const sizeOf = require("image-size");
const CleanCss = require("clean-css");
const pretty = require('pretty');

module.exports = async (html, options) => {
  const cheerioOptions = options || {
    cwd: options.cwd || "",
    round: options.round || true,
    normalizeWhitespace: options.normalizeWhitespace || false,
    xmlMode: options.xmlMode || false,
    decodeEntities: options.decodeEntities || false
  };
  const round = cheerioOptions.round
    ? numb => Math.round(numb / 5) * 5
    : numb => numb;

  // Load html
  const $ = cheerio.load(html, cheerioOptions);

  const headElement = $("head");

  /* AMP Boilerplate */

  // add amp atrribute to <html/> element
  $("html")
    .first()
    .attr("amp", "");

  // set charset to utf-8
  headElement.find("meta[charset]").remove();
  headElement.prepend('<meta charset="utf-8">');

  /* meta viewport */
  headElement.find("meta[name='viewport']").remove();
  headElement.append(
    '<meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">'
  );

  /* amp-boilerplate styles */
  if (headElement.find("style[amp-boilerplate]").length === 0) {
    headElement.append(
      '<style amp-boilerplate="">body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>'
    );
  }

  // AMP script
  headElement.find("script[src*='cdn.ampproject.org']").remove();
  headElement.append(
    '<script async src="https://cdn.ampproject.org/v0.js"></script>'
  );

  /* remove non-AMP scripts */
  $("script").each((index, element) => {
    const el = $(element);
    if (
      el.attr("custom-element") == "amp-analytics" ||
      el.attr("src") && el.attr("src").indexOf("cdn.ampproject.org") > -1
    ) {
      return;
    } else {
      el.remove();
    }
  });

  /* Fetch images and CSS */
  const promises = [];
  const externalSrcContent = {};

  // Fetch external images
  $("img:not([width]):not([height])").each((index, element) => {
    const src = $(element).attr("src");
    // skip if already fetched
    if (externalSrcContent[src]) {
      return;
    }
    if (src && src.indexOf("//") !== -1) {
      // set a flag
      externalSrcContent[src] = true;
      const imageUrl = element.attribs.src;
      promises.push(
        axios.get(imageUrl, { responseType: "arraybuffer" }).then(response => {
          externalSrcContent[src] = response;
        })
      );
    }
  });

  // Fetch external CSS
  $("link[rel=stylesheet]").each((index, element) => {
    const src = $(element).attr("href");
    if (isGoogleFontHostSrc(src)) {
      // External links to fonts are allowed; we'll make a specific exception for Google Fonts
      return;
    }
    if (externalSrcContent[src]) {
      // We've already cached this one
      return;
    }

    try {
      if (src && src.indexOf("//") !== -1) {
        let cssSrc = src;
        if (src.indexOf("//") === 0) {
          cssSrc = `https:${src}`;
        }
        externalSrcContent[src] = true;
        promises.push(
          axios.get(cssSrc).then(response => {
            externalSrcContent[src] = response;
          })
        );
      }
    } catch (err) {
      console.dir(err);
    }
  });

  await Promise.all(promises);

  /* Set <img/> element height/width dimensions */
  $("img:not([width]):not([height])").each((index, element) => {
    const src = $(element).attr("src");
    if (!src) {
      return $(element).remove();
    }
    if (src.indexOf("//") === -1) {
      const image = `${options.cwd}/${$(element).attr("src")}`;
      if (fs.existsSync(image)) {
        const size = sizeOf(image);
        $(element).attr({
          width: round(size.width),
          height: round(size.height)
        });
      }
    } else if (src.indexOf("//") !== -1) {
      const response = externalSrcContent[src];
      if (response === true) {
        throw new Error("No image for", src);
      }
      const size = sizeOf(Buffer.from(response.data, "binary"));
      $(element).attr({
        width: round(size.width),
        height: round(size.height)
      });
    }
  });

  /* Fetch external stylesheet content */
  let styles = "";
  $("link[rel=stylesheet]").each((index, element) => {
    const src = $(element).attr("href");
    let path = src;

    try {
      if (isGoogleFontHostSrc(src)) {
        return;
      }

      const isRemoteSrcReference = src.indexOf("//") !== -1;
      if (isRemoteSrcReference) {
        const response = externalSrcContent[src];
        if (response === true) {
          throw new Error("No CSS for", src);
        }
        styles += response.data;
      } else {
        // Local file reference
        path = `${options.cwd}/${src}`;
        if (fs.existsSync(path)) {
          const fileContent = String(fs.readFileSync(path));
          styles += fileContent;
        }
      }
    } catch (err) {
      console.dir(err);
    }

    $(element).remove();
  });

  /* Gather internal styles */
  $("style:not([amp-boilerplate])").each((index, element) => {
    styles += $(element).html();
    $(element).remove();
  });

  // Add styles to <head/>
  const minifiedStyles = new CleanCss().minify(styles).styles;
  const finalizedStyles = scrubCss(minifiedStyles);
  headElement.find("style[amp-custom]").remove();
  headElement.append(`<style amp-custom>${finalizedStyles}</style>`);

  /* youtube */
  let youTubeVideoEmbeded = false;
  $(
    'iframe[src*="http://www.youtube.com"],iframe[src*="https://www.youtube.com"],iframe[src*="http://youtu.be/"],iframe[src*="https://youtu.be/"]'
  ).each((index, element) => {
    youTubeVideoEmbeded = true;
    const src = $(element).attr("src");
    const width = $(element).attr("width");
    const height = $(element).attr("height");
    const path = url.parse(src).pathname.split("/");
    const ampYoutube = `
    <amp-youtube
      data-videoid="${path[path.length - 1]}"
      width="${width}"
      height="${height}"
      layout="responsive">
    </amp-youtube>`;
    $(element).replaceWith(ampYoutube);
  });

  if (youTubeVideoEmbeded) {
    headElement.prepend(
      '<script async custom-element="amp-youtube" src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js">'
    );
  }

  /* Convert HTML tags to AMP tags */
  const includeTags = {
    amp: ["img", "video"]
  };
  $(includeTags.amp.join(",")).each((index, element) => {
    const ampElement = Object.assign(element, {
      name: `amp-${element.name}`
    });
    $(element).html($(ampElement).html());
  });

  const outerHtml = $.html();
  const prettyOuterHtml = pretty(outerHtml);
  return prettyOuterHtml;
};

function isGoogleFontHostSrc(src) {
  return src.indexOf("fonts.googleapis.com") > -1;
}

function scrubCss(css) {
  return css.replace(/\!important/g, "");
}
