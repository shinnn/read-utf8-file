'use strict';

const {inspect, promisify} = require('util');

const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');
const isUtf8 = require('is-utf8');
const {readFile} = require('graceful-fs');
const stripBom = require('strip-bom');

const PATH_ERROR = 'Expected a valid file path to read its contents, which must includes at least one character';
const FLAG_ERROR = '`flag` option must be valid file open flag (string), for example \'r\' & \'ax+\'';
const FD_ERROR = 'read-utf8-file doesn\'t support reading from FD 0 (stdin), FD 1 (stdout) nor FD 2 (stderr)';
const promisifiedReadFile = promisify(readFile);

module.exports = async function readUtf8File(...args) {
	const argLen = args.length;

	if (argLen !== 1 && argLen !== 2) {
		throw new RangeError(`Expected 1 or 2 arguments (string[, object]), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	const [filePath, options] = args;

	if (filePath === '') {
		throw new TypeError(`${PATH_ERROR}, but got '' (empty string).`);
	}

	if (Buffer.isBuffer(filePath) && filePath.length === 0) {
		throw new TypeError(`${PATH_ERROR}, but got an empty Buffer.`);
	}

	if (filePath === 0 || filePath === 1 || filePath === 2) {
		throw new TypeError(`${FD_ERROR}, but got ${inspectWithKind(filePath)}.`);
	}

	if (options) {
		if (!isPlainObj(options)) {
			throw new TypeError(`The second argument of read-utf8-file must be a plain object, but got ${
				inspectWithKind(options)
			}.`);
		}

		if ('encoding' in options) {
			throw new TypeError(`read-utf8-file does not support \`encoding\` option because it only supports UTF-8 by design, but ${
				inspect(options.encoding)
			} was provided.`);
		}

		const typeOfFlag = typeof options.flag;

		if (options.flag && typeOfFlag !== 'string' && typeOfFlag !== 'number') {
			throw new TypeError(`${FLAG_ERROR}, but got ${inspect(options.flag)}.`);
		} else if (options.flag === '') {
			throw new Error(`${FLAG_ERROR.replace(' (string)', '')}, but got '' (empty string).`);
		}
	}

	const contents = await promisifiedReadFile(...args);

	if (!isUtf8(contents)) {
		throw new Error(`Expected a UTF-8 file, but the file at ${inspect(filePath)} is not UTF-8 encoded.`);
	}

	return stripBom(contents.toString());
};
