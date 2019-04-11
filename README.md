# ampify

> Convert plain HTML to Google AMP (Accelerated Mobile Pages)

## Installation

```sh
npm install ampify
```

## Usage

```js
const ampify = require('ampify');
const html = '<YOUR_HTML_CONTENT>';
const amp = await ampify(html, {cwd: 'amp'});
console.log(amp); // Content of AMP HTML
```

## Options

### cwd

### Assets (images/styles) file path

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
    <link rel="stylesheet" href="styles.css">
  </head>
  <img src="image.png">
</html>
```

### Output

```html
<html amp="">
  <head>
    <style amp-custom="">body{background-color:#fff}</style>
  </head>
  <amp-img src="image.png" width="600" height="400"></amp-img>
</html>
```

## Licence

MIT (c) Ruslan Kazakov and [contributors](https://github.com/rkazakov/ampify/graphs/contributors)

[PostXML]: https://github.com/postxml/postxml
[npm-url]: https://www.npmjs.org/package/ampify
[npm-image]: https://img.shields.io/npm/v/ampify.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/ampify.svg?style=flat-square
