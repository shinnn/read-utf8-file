'use strict';

const {equal, rejects} = require('assert').strict;
const {join} = require('path');
const {pathToFileURL} = require('url');
const {unlink, writeFile} = require('fs').promises;

const readUtf8File = require('.');
const test = require('testit');

test('read a UTF-8 file', async () => {
	equal(await readUtf8File(join(__dirname, '.gitignore')), 'coverage\nnode_modules\n');
});

test('strip BOM', async () => {
	const path = Buffer.from(join(__dirname, 'fixture-bom'));
	let result;

	try {
		await writeFile(path, Buffer.from([0xEF, 0xBB, 0xBF]));
		result = await readUtf8File(path, {});
	} finally {
		await unlink(path);
	}

	equal(result, '');
});

test('fail when the file is not UTF-8 encoded', async () => {
	await rejects(async () => readUtf8File(process.execPath), {
		code: 'ERR_UNSUPPORTED_FILE_ENCODING',
		message: `Expected a UTF-8 file, but the file at '${process.execPath}' is not UTF-8 encoded.`
	});
});

test('fail when it cannot read a file', async () => {
	await rejects(async () => readUtf8File(pathToFileURL('__this_file_does_not_exist__'), {}), {code: 'ENOENT'});
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
	await rejects(async () => readUtf8File(__filename, {flag: '???'}), {code: 'ERR_INVALID_OPT_VALUE'});
});

test('fail when it takes no arguments', async () => {
	await rejects(async () => readUtf8File(), {
		name: 'RangeError',
		message: 'Expected 1 or 2 arguments (<string|Buffer|Uint8Array|URL>[, <Object>]), but got no arguments.'
	});
});

test('fail when it takes more than 2 arguments', async () => {
	await rejects(async () => readUtf8File('!', {}, '!'), {
		name: 'RangeError',
		message: 'Expected 1 or 2 arguments (<string|Buffer|Uint8Array|URL>[, <Object>]), but got 3 arguments.'
	});
});
