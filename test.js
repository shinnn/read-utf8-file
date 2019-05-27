/* eslint unicode-bom: [error, always] */
// NOTE: this file explicitly includes BOM for testing purpose.
'use strict';

const {join} = require('path');
const {equal, rejects} = require('assert').strict;

const readUtf8File = require('.');
const test = require('testit');

test('read a UTF-8 file', async () => {
	equal(await readUtf8File(join(__dirname, '.gitignore')), 'coverage\nnode_modules\n');
});

test('should strip BOM', async () => {
	equal((await readUtf8File(Buffer.from('test.js'), {})).charAt(0), '/');
});

test('fail when the file is not UTF-8 encoded', async () => {
	/* eslint-disable node/no-extraneous-require */
	const nonUtf8FilePath = require.resolve('istanbul-reports/lib/html/assets/sort-arrow-sprite.png');
	/* eslint-enable node/no-extraneous-require */

	equal((await readUtf8File(Buffer.from('test.js'), {})).charAt(0), '/');
	await rejects(async () => readUtf8File(nonUtf8FilePath), {
		code: 'ERR_UNSUPPORTED_FILE_ENCODING',
		message: `Expected a UTF-8 file, but the file at '${nonUtf8FilePath}' is not UTF-8 encoded.`
	});
});

test('fail when it cannot read a file', async () => {
	await rejects(async () => readUtf8File('__this_file_does_not_exist__', {}), {code: 'ENOENT'});
});

test('fail when the first argument is not a string', async () => {
	await rejects(async () => readUtf8File(null), {
		name: 'TypeError',
		code: 'ERR_INVALID_ARG_TYPE'
	});
});

test('fail when the path is an empty string', async () => {
	await rejects(async () => readUtf8File(''), {
		code: 'ERR_INVALID_ARG_VALUE',
		message: 'Expected a valid file path to read its contents, which must includes at least one character, but got \'\' (empty string).'
	});
});

test('fail when the path is an empty Buffer', async () => {
	await rejects(async () => readUtf8File(Buffer.alloc(0)), {
		code: 'ERR_INVALID_ARG_VALUE',
		message: 'Expected a valid file path to read its contents, which must includes at least one character, but got an empty Buffer.'
	});
});

test('fail when the path is an empty Uint8Array', async () => {
	await rejects(async () => readUtf8File(new Uint8Array()), {
		code: 'ERR_INVALID_ARG_VALUE',
		message: 'Expected a valid file path to read its contents, which must includes at least one character, but got an empty Uint8Array.'
	});
});

test('fail when it takes stdin/stdout/stderr file descriptor', async () => {
	await rejects(async () => readUtf8File(2), {
		code: 'ERR_INVALID_ARG_VALUE',
		message: 'read-utf8-file doesn\'t support reading from FD 0 (stdin), FD 1 (stdout) nor FD 2 (stderr), but got 2 (number).'
	});
});

test('fail when the second argument is not a plain Object', async () => {
	await rejects(async () => readUtf8File(__filename, [1, 2, 3]), {
		name: 'TypeError',
		message: 'The second argument of read-utf8-file must be a plain object, but got [ 1, 2, 3 ] (array).'
	});
});

test('fail when it takes `encoding` option', async () => {
	await rejects(async () => readUtf8File(__filename, {encoding: 'hex'}), {
		name: 'TypeError',
		message: 'read-utf8-file does not support `encoding` option because it only supports UTF-8 by design, but \'hex\' was provided.'
	});
});

test('fail when it takes non-string `flag` option', async () => {
	await rejects(async () => readUtf8File(__filename, {flag: new Map()}), {
		name: 'TypeError',
		message: '`flag` option must be valid file open flags (<string|integer>), but got Map {}.'
	});
});

test('fail when `flag` option is an empty string', async () => {
	await rejects(async () => readUtf8File(__filename, {flag: ''}), {
		message: '`flag` option must be valid file open flags (<string|integer>), but got \'\' (empty string).'
	});
});

test('fail when it takes invalid `flag` option', async () => {
	await rejects(async () => readUtf8File(__filename, {flag: '???'}), {
		code: 'ERR_INVALID_OPT_VALUE'
	});
});

test('fail when it takes no arguments', async () => {
	await rejects(async () => readUtf8File(), {
		name: 'RangeError',
		message: 'Expected 1 or 2 arguments (<string|Buffer|Uint8Array|URL|integer>[, <Object>]), but got no arguments.'
	});
});

test('fail when it takes more than 2 arguments', async () => {
	await rejects(async () => readUtf8File('!', {}, '!'), {
		name: 'RangeError',
		message: 'Expected 1 or 2 arguments (<string|Buffer|Uint8Array|URL|integer>[, <Object>]), but got 3 arguments.'
	});
});
