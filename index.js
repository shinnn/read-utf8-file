'use strict';

const {inspect} = require('util');

const inspectWithKind = require('inspect-with-kind');
const isPlainObj = require('is-plain-obj');
const isUtf8 = require('is-utf8');
const {readFile} = require('graceful-fs');
const stripBom = require('strip-bom');

const PATH_ERROR = 'Expected a file path (string) to read its contents';
const FLAG_ERROR = '`flag` option must be valid file open flag (string), for example \'r\' & \'ax+\'';

module.exports = function readUtf8File(...args) {
	const argLen = args.length;

	if (argLen !== 1 && argLen !== 2) {
		return Promise.reject(new RangeError(`Expected 1 or 2 arguments (string[, object]), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`));
	}

	const filePath = args[0];

	if (typeof filePath !== 'string') {
		return Promise.reject(new TypeError(`${PATH_ERROR}, but got ${inspectWithKind(filePath)}.`));
	}

	if (filePath.length === 0) {
		return Promise.reject(new TypeError(`${PATH_ERROR.replace(' (string)', '')}, but got '' (empty string).`));
	}

	const options = args[1];

	if (options) {
		if (!isPlainObj(options)) {
			return Promise.reject(new TypeError(`The second argument of read-utf8-file must be a plain object, but got ${
				inspectWithKind(options)
			}.`));
		}

		if ('encoding' in options) {
			return Promise.reject(new TypeError(`read-utf8-file does not support \`encoding\` option because it only supports UTF-8 by design, but ${
				inspect(options.encoding)
			} was provided.`));
		}

		const typeOfFlag = typeof options.flag;

		if (options.flag && typeOfFlag !== 'string' && typeOfFlag !== 'number') {
			return Promise.reject(new TypeError(`${FLAG_ERROR}, but got ${inspect(options.flag)}.`));
		} else if (options.flag === '') {
			return Promise.reject(new Error(`${FLAG_ERROR.replace(' (string)', '')}, but got '' (empty string).`));
		}
	}

	return new Promise((resolve, reject) => {
		readFile(filePath, options, (err, content) => {
			if (err) {
				reject(err);
				return;
			}

			if (!isUtf8(content)) {
				reject(new Error(`Expected a UTF-8 file, but the file at ${inspect(filePath)} is not UTF-8 encoded.`));
			}

			resolve(stripBom(content.toString()));
		});
	});
};
