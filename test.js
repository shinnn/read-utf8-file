/* eslint unicode-bom: [error, always] */
// NOTE: this file explicitly includes BOM for testing purpose.
'use strict';

const path = require('path');

const readUtf8File = require('.');
const test = require('tape');

test('readUtf8File()', t => {
  t.plan(13);

  readUtf8File(path.resolve('.gitignore')).then(str => {
    t.strictEqual(str, 'coverage\nnode_modules\n', 'should read a UTF-8 file.');
  }).catch(t.fail);

  readUtf8File('test.js', {}).then(str => {
    t.strictEqual(str.charAt(0), '/', 'should strip BOM.');
  }).catch(t.fail);

  const nonUtf8Path = path.resolve('.git/objects/0f/f7b940c1d9ada0760194c1145d9f92458caa25');

  readUtf8File(nonUtf8Path).then(t.fail, err => {
    t.strictEqual(
      err.message,
      `Expected a UTF-8 file, but the file at '${nonUtf8Path}' is not UTF-8 encoded.`,
      'should fail when the file is not UTF-8 encoded.'
    );
  });

  readUtf8File('__this_file_does_not_exist__', {}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      'ENOENT: no such file or directory, open \'__this_file_does_not_exist__\'',
      'should fail when it cannot read the file.'
    );
  });

  readUtf8File().then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Expected 1 or 2 arguments (string[, object]), but got no arguments.',
      'should fail when it takes no arguments.'
    );
  });

  readUtf8File('received', {three: 'args'}, '😢').then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Expected 1 or 2 arguments (string[, object]), but got 3 arguments.',
      'should fail when it takes more than 2 arguments.'
    );
  });

  readUtf8File(null).then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Expected a file path (string) to read its contents, but got null.',
      'should fail when the first argument is not a string.'
    );
  });

  readUtf8File('').then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Expected a file path to read its contents, but got \'\' (empty string).',
      'should fail when the path is an empty string.'
    );
  });

  readUtf8File(__filename, [1, 2, 3]).then(t.fail, err => {
    t.strictEqual(
      err.message,
      'The second argument of read-utf8-file must be a plain object, but got [ 1, 2, 3 ].',
      'should fail when the second argument is not a plain object.'
    );
  });

  readUtf8File(__filename, {encoding: 'hex'}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      'read-utf8-file does not support `encoding` option ' +
      'because it only supports UTF-8 by design, but \'hex\' was provided.',
      'should fail when it takes `encoding` option.'
    );
  });

  readUtf8File(__filename, {flag: new Map()}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      '`flag` option must be valid file open flag (string), for example \'r\' & \'ax+\', but got Map {}.',
      'should fail when it takes non-string `flag` option.'
    );
  });

  readUtf8File(__filename, {flag: ''}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      '`flag` option must be valid file open flag, for example \'r\' & \'ax+\', but got \'\' (empty string).',
      'should fail when `flag` option is an empty string.'
    );
  });

  readUtf8File(__filename, {flag: '???'}).then(t.fail, err => {
    t.strictEqual(
      err.message,
      'Unknown file open flag: ???',
      'should fail when it takes invalid `flag` option.'
    );
  });
});
