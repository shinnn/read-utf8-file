# read-utf8-file

[![npm version](https://img.shields.io/npm/v/read-utf8-file.svg)](https://www.npmjs.com/package/read-utf8-file)
[![Build Status](https://travis-ci.com/shinnn/read-utf8-file.svg?branch=master)](https://travis-ci.com/shinnn/read-utf8-file)
[![codecov](https://codecov.io/gh/shinnn/read-utf8-file/branch/master/graph/badge.svg)](https://codecov.io/gh/shinnn/read-utf8-file)

A [Node.js](https://nodejs.org/) module to read the contents of a UTF-8 file

```javascript
const readUtf8File = require('read-utf8-file');

(async () => {
  const contents = await readUtf8File('/path/to/utf8-file.txt');
  //=> 'string of file contents'
})();
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/about-npm/).

```
npm install read-utf8-file
```

## API

```javascript
const readUtf8File = require('read-utf8-file');
```

### readUtf8File(*filePath* [, *options*])

*filePath*: `string | Buffer | Uint8Array | URL` (file path)  
*options*: `Object` ([`fs.promises.readFile()`](https://nodejs.org/api/fs.html#fs_fspromises_readfile_path_options) options except for `encoding`)  
Return: `Promise<string>` (entire file contents except for [BOM](https://unicode.org/faq/utf_bom.html))

```javascript
// file-with-bom.txt: '\uFEFFabc'

(async () => {
  await readUtf8File('file-with-bom.txt'); //=> 'abc'
})();
```

If the file is not [UTF-8](https://tools.ietf.org/html/rfc3629) encoded, the `Promise` will be rejected. So this module is more suitable than built-in `fs.readFile()` for the case when the program doesn't support non-UTF-8 files.

```javascript
(async () => {
  await readUtf8File('/path/to/non-utf8-file');
  // rejects with Error: Expected a UTF-8 file, but the file at '/path/to/non-utf8-file' is not UTF-8 encoded.
})();
```

## License

[ISC License](./LICENSE) © 2017 - 2019 Watanabe Shinnosuke
