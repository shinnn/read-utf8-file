/* eslint unicode-bom: [error, always] */
// NOTE: this file explicitly includes BOM for testing purpose.
'use strict';

const {dirname, join, resolve} = require('path');

const readUtf8File = require('.');
const test = require('tape');

test('readUtf8File()', async t => {
	t.equal(
		await readUtf8File(resolve('.gitignore')),
		'.nyc_output\ncoverage\nnode_modules\n',
		'should read a UTF-8 file.'
	);

	t.equal(
		(await readUtf8File(Buffer.from('test.js'), {})).charAt(0),
		'/',
		'should strip BOM.'
	);

	const nonUtf8Path = join(dirname(require.resolve('istanbul-reports/lib/html', {
		paths: [require.resolve('nyc')]
	})), 'assets', 'sort-arrow-sprite.png');

	try {
		await readUtf8File(nonUtf8Path);
	} catch ({message}) {
		t.equal(
			message,
			`Expected a UTF-8 file, but the file at '${nonUtf8Path}' is not UTF-8 encoded.`,
			'should fail when the file is not UTF-8 encoded.'
		);
	}

	try {
		await readUtf8File('__this_file_does_not_exist__', {});
	} catch ({code}) {
		t.equal(
			code,
			'ENOENT',
			'should fail when it cannot read the file.'
		);
	}

	t.end();
});

test('Argument validation', async t => {
	async function getError(...args) {
		try {
			return await readUtf8File(...args);
		} catch (err) {
			return err;
		}
	}

	t.equal(
		(await getError()).message,
		'Expected 1 or 2 arguments (string[, object]), but got no arguments.',
		'should fail when it takes no arguments.'
	);

	t.equal(
		(await getError('received', {three: 'args'}, '😢')).message,
		'Expected 1 or 2 arguments (string[, object]), but got 3 arguments.',
		'should fail when it takes more than 2 arguments.'
	);

	t.equal(
		(await getError(null)).code,
		'ERR_INVALID_ARG_TYPE',
		'should fail when the first argument is not a string.'
	);

	t.equal(
		(await getError('')).message,
		'Expected a valid file path to read its contents, which must includes at least one character, but got \'\' (empty string).',
		'should fail when the path is an empty string.'
	);

	t.equal(
		(await getError(Buffer.alloc(0))).message,
		'Expected a valid file path to read its contents, which must includes at least one character, but got an empty Buffer.',
		'should fail when the path is an empty Buffer.'
	);

	t.equal(
		(await getError(2)).message,
		'read-utf8-file doesn\'t support reading from FD 0 (stdin), FD 1 (stdout) nor FD 2 (stderr), but got 2 (number).',
		'should fail when it takes stdin/stdout/stderr file descriptor.'
	);

	t.equal(
		(await getError(__filename, [1, 2, 3])).message,
		'The second argument of read-utf8-file must be a plain object, but got [ 1, 2, 3 ] (array).',
		'should fail when the second argument is not a plain object.'
	);

	t.equal(
		(await getError(__filename, {encoding: 'hex'})).message,
		'read-utf8-file does not support `encoding` option because it only supports UTF-8 by design, but \'hex\' was provided.',
		'should fail when it takes `encoding` option.'
	);

	t.equal(
		(await getError(__filename, {flag: new Map()})).message,
		'`flag` option must be valid file open flag (string), for example \'r\' & \'ax+\', but got Map {}.',
		'should fail when it takes non-string `flag` option.'
	);

	t.equal(
		(await getError(__filename, {flag: ''})).message,
		'`flag` option must be valid file open flag, for example \'r\' & \'ax+\', but got \'\' (empty string).',
		'should fail when `flag` option is an empty string.'
	);

	t.equal(
		(await getError(__filename, {flag: '???'})).code,
		'ERR_INVALID_OPT_VALUE',
		'should fail when it takes invalid `flag` option.'
	);

	t.end();
});
