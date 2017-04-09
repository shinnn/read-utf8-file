# read-utf8-file

[![NPM version](https://img.shields.io/npm/v/read-utf8-file.svg)](https://www.npmjs.com/package/read-utf8-file)
[![Build Status](https://travis-ci.org/shinnn/read-utf8-file.svg?branch=master)](https://travis-ci.org/shinnn/read-utf8-file)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/read-utf8-file.svg)](https://coveralls.io/github/shinnn/read-utf8-file?branch=master)

A [Node](https://nodejs.org/) module to read the contents of a UTF-8 file

```javascript
const readUtf8File = require('read-utf8-file');

readUtf8File('/path/to/utf8-file.txt').then(contents => {
  contents; //=> 'string of file contents'
});
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install read-utf8-file
```

## API

```javascript
const readUtf8File = require('read-utf8-file');
```

### readUtf8File(*filePath* [, *options*])

*filePath*: `String` (file path)  
*options*: `Object` ([`fs.readFile`](https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback) options except for `encoding`)  
Return: [`Promise`](https://promisesaplus.com/) of `String` (entire file contents except for [BOM](http://unicode.org/faq/utf_bom.html))

```javascript
// file-with-bom.txt: '\uFEFFabc'

readUtf8File('file-with-bom.txt').then(contents => {
  contents; //=> 'abc'
});
```

Note that if the file is not [UTF-8](https://tools.ietf.org/html/rfc3629) encoded, the promise will be rejected. So this module is more suitable than built-in `fs.readFile` for the case when your application doesn't accept non-UTF-8 files.

```javascript
readUtf8File('/path/to/non-utf8-file.exe').catch(err => {
  err.message; //=> "Error: Expected a UTF-8 file, but the file at '/path/to/non-utf8-file.exe' is not UTF-8 encoded."
});
```

## License

Copyright (c) 2016 - 2017 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
