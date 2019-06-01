'use strict';

const {inspect} = require('util');
const {open, realpath} = require('fs').promises;

const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');
const isUtf8 = require('is-utf8');

const ARG_ERROR = 'Expected 1 or 2 arguments (<string|Buffer|Uint8Array|URL>[, <Object>])';
const PATH_ERROR = 'Expected a valid file path to read its contents, which must includes at least one character';
const FLAG_ERROR = '`flag` option must be valid file open flags (<string|integer>)';

// When the first 4 bytes are UTF-8, in most cases the entire file contents would be UTF-8.
const ENOUGH_BYTES = 4;

function validateUtf8(buffer, path) {
	if (isUtf8(buffer)) {
		return;
	}

	const error = new Error(`Expected a UTF-8 file, but the file at ${inspect(path)} is not UTF-8 encoded.`);

	error.code = 'ERR_UNSUPPORTED_FILE_ENCODING';
	Error.captureStackTrace(error, validateUtf8);
	throw error;
}

module.exports = async function readUtf8File(...args) {
	const argLen = args.length;

	if (argLen === 0) {
		const error = new RangeError(`${ARG_ERROR}, but got no arguments.`);

		error.code = 'ERR_MISSING_ARGS';
		throw error;
	}

	if (argLen > 2) {
		const error = new RangeError(`${ARG_ERROR}, but got ${argLen} arguments.`);

		error.code = 'ERR_TOO_MANY_ARGS';
		throw error;
	}

	const [filePath, options = {}] = args;

	if (filePath !== undefined && filePath !== null && filePath.length === 0) {
		let error;

		if (typeof filePath === 'string') {
			error = new TypeError(`${PATH_ERROR}, but got '' (empty string).`);
		} else if (Buffer.isBuffer(filePath)) {
			error = new TypeError(`${PATH_ERROR}, but got an empty Buffer.`);
		} else {
			error = new TypeError(`${PATH_ERROR}, but got an empty Uint8Array.`);
		}

		error.code = 'ERR_INVALID_ARG_VALUE';
		throw error;
	}

	if (argLen === 2) {
		if (!isPlainObj(options)) {
			const error = new TypeError(`The second argument of read-utf8-file must be a plain object, but got ${
				inspectWithKind(options)
			}.`);

			error.code = 'ERR_INVALID_ARG_TYPE';
			throw error;
		}

		if (Reflect.getOwnPropertyDescriptor(options, 'encoding')) {
			const error = new TypeError(`read-utf8-file does not support \`encoding\` option because it only supports UTF-8 by design, but ${
				inspect(options.encoding)
			} was provided.`);

			error.code = 'ERR_INVALID_OPT_VALUE';
			throw error;
		}

		const typeOfFlag = typeof options.flag;

		if (options.flag && typeOfFlag !== 'string' && typeOfFlag !== 'number') {
			const error = new TypeError(`${FLAG_ERROR}, but got ${inspect(options.flag)}.`);

			error.code = 'ERR_INVALID_OPT_VALUE';
			throw error;
		}

		if (options.flag === '') {
			const error = new Error(`${FLAG_ERROR.replace(' (string)', '')}, but got '' (empty string).`);

			error.code = 'ERR_INVALID_OPT_VALUE';
			throw error;
		}
	}

	const buffers = [];
	const firstBuffer = Buffer.alloc(ENOUGH_BYTES);
	const flag = options.flag || 'r';
	const [fileHandle, absolutePath] = await Promise.all([open(filePath, flag), realpath(filePath)]);
	const {bytesRead} = await fileHandle.read(firstBuffer, 0, ENOUGH_BYTES, null);
	const allBytesRead = bytesRead < ENOUGH_BYTES;

	if (allBytesRead) {
		await fileHandle.close();
	}

	buffers.push(firstBuffer.slice(
		// https://www.unicode.org/faq/utf_bom.html#bom4
		firstBuffer[0] === 0xEF && firstBuffer[1] === 0xBB && firstBuffer[2] === 0xBF ? 3 : 0,
		bytesRead
	));
	validateUtf8(buffers[0], absolutePath);

	if (allBytesRead) {
		return buffers[0].toString();
	}

	buffers.push(await fileHandle.readFile());
	await fileHandle.close();

	const buffer = Buffer.concat(buffers, buffers[0].length + buffers[1].length);

	validateUtf8(buffer, absolutePath);
	return buffer.toString();
};
