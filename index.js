/*!
 * read-utf8-file | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/read-utf8-file
*/
'use strict';

var inspect = require('util').inspect;

var fs = require('graceful-fs');
var isPlainObj = require('is-plain-obj');
var isUtf8 = require('is-utf8');
var stripBom = require('strip-bom');

var PATH_ERROR = 'Expected a file path (string) to read its contents';
var FLAG_ERROR = '`flag` option must be valid file open flag (string), for example \'r\' & \'ax+\'';

module.exports = function readUtf8File(filePath, options) {
  if (typeof filePath !== 'string') {
    return Promise.reject(new TypeError(
      PATH_ERROR +
      ', but got ' +
      inspect(filePath) +
      '.'
    ));
  }

  if (filePath.length === 0) {
    return Promise.reject(new Error(
      PATH_ERROR.replace(' (string)', '') +
      ', but got \'\' (empty string).'
    ));
  }

  if (options) {
    if (!isPlainObj(options)) {
      return Promise.reject(new TypeError(
        'The second argument of read-utf8-file must be a plain object, ' +
        'but got ' +
        inspect(options) +
        '.'
      ));
    }

    if ('encoding' in options) {
      return Promise.reject(new TypeError(
        'read-utf8-file does not support `encoding` option' +
        ' because it only supports UTF-8 by design, but ' +
        inspect(options.encoding) +
        ' was provided.'
      ));
    }

    var typeOfFlag = typeof options.flag;

    if (options.flag && typeOfFlag !== 'string' && typeOfFlag !== 'number') {
      return Promise.reject(new TypeError(FLAG_ERROR + ', but got ' + inspect(options.flag) + '.'));
    } else if (options.flag === '') {
      return Promise.reject(new Error(FLAG_ERROR.replace(' (string)', '') + ', but got \'\' (empty string).'));
    }
  }

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, options, (err, content) => {
      if (err) {
        reject(err);
        return;
      }

      if (!isUtf8(content)) {
        reject(new Error(
          'Expected a UTF-8 file, but the file at ' +
          inspect(filePath) +
          ' is not UTF-8 encoded.'
        ));
      }

      resolve(stripBom(content.toString()));
    });
  });
};
