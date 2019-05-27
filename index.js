'use strict';

const {inspect, promisify} = require('util');
const {readFile} = require('fs');

const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');
const isUtf8 = require('is-utf8');

const ARG_ERROR = 'Expected 1 or 2 arguments (<string|Buffer|Uint8Array|URL|integer>[, <Object>])';
const PATH_ERROR = 'Expected a valid file path to read its contents, which must includes at least one character';
const FLAG_ERROR = '`flag` option must be valid file open flags (<string|integer>)';
const FD_ERROR = 'read-utf8-file doesn\'t support reading from FD 0 (stdin), FD 1 (stdout) nor FD 2 (stderr)';
const promisifiedReadFile = promisify(readFile);

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

	const [filePath, options] = args;

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

	if (filePath === 0 || filePath === 1 || filePath === 2) {
		const error = new TypeError(`${FD_ERROR}, but got ${inspectWithKind(filePath)}.`);

		error.code = 'ERR_INVALID_ARG_VALUE';
		throw error;
	}

	if (options) {
		if (!isPlainObj(options)) {
			const error = new TypeError(`The second argument of read-utf8-file must be a plain object, but got ${
				inspectWithKind(options)
			}.`);

			error.code = 'ERR_INVALID_ARG_TYPE';
			throw error;
		}

		if ('encoding' in options) {
			throw new TypeError(`read-utf8-file does not support \`encoding\` option because it only supports UTF-8 by design, but ${
				inspect(options.encoding)
			} was provided.`);
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

	const buffer = await promisifiedReadFile(...args);

	if (!isUtf8(buffer)) {
		const error = new Error(`Expected a UTF-8 file, but the file at ${inspect(filePath)} is not UTF-8 encoded.`);

		error.code = 'ERR_UNSUPPORTED_FILE_ENCODING';
		throw error;
	}

	// https://www.unicode.org/faq/utf_bom.html#bom4
	if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
		return buffer.slice(3).toString();
	}

	return buffer.toString();
};
