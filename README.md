# ampify [![NPM Package](https://img.shields.io/npm/v/@bradymholt/ampify.svg)](https://www.npmjs.com/package/@bradymholt/ampify)

> Convert plain HTML to Google AMP (Accelerated Mobile Pages)

## Installation

```sh
npm install @bradymholt/ampify
```

## Usage

```js
const ampify = require("ampify");
const html = "<YOUR_HTML_CONTENT>";
const amp = await ampify(html, { cwd: "amp" });
console.log(amp); // Content of AMP HTML
```

## Options

### cwd

### Assets (images/styles) file path

When `<link rel=stylesheet>` and `<img/>` tags with a local file reference are encountered, they will read and processed. This option specifies where the files are located (i.e. `` fs.existsSync(`${options.cwd}/${imagSrc}`)) ``.

- Type: `String`
- Default: `''`

### round

### Enable images dimensions rounding

- Type: `String`
- Default: `true`

## Example

### Input

```html
<html>
  <head>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <img src="image.png" />
  </body>
</html>
```

### Output

```html
<html amp>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
    <noscript>
      <style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style>
    </noscript>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
  </head>
  <body>
    <amp-img src="image.png" width="600" height="400"></amp-img>
  </body>
</html>
```
