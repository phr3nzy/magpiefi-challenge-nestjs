import ajvErrors from 'ajv-errors';
import ajvFormats from 'ajv-formats';
import type { FastifyRequest, FastifyServerOptions } from 'fastify';
import { parse } from 'qs';
import { v4 as uuid } from 'uuid';
import { AJV_CONFIG } from './ajv';
import { logger } from './logger';

// Generate a request id - this is used for logging and tracing
function genReqId(_: FastifyRequest) {
	return uuid();
}

/**
 * Server configuration
 */
export const SERVER_CONFIG: FastifyServerOptions = {
	ajv: {
		customOptions: AJV_CONFIG,
		plugins: [ajvFormats, ajvErrors],
	},
	trustProxy: true,
	logger,
	ignoreTrailingSlash: true,
	pluginTimeout: 60000, // 1 minute
	bodyLimit: 8192 * 2, // 16KB
	caseSensitive: false,
	connectionTimeout: 60000, // 1 minute,
	forceCloseConnections: 'idle',
	ignoreDuplicateSlashes: false,
	requestIdHeader: 'x-req-id',
	requestIdLogLabel: 'requestId',
	onProtoPoisoning: 'error',
	onConstructorPoisoning: 'error',
	genReqId,
	querystringParser: (str: string) =>
		parse(str, {
			allowPrototypes: false,
			charset: 'utf-8',
			charsetSentinel: true,
			parseArrays: false,
			interpretNumericEntities: true,
			parameterLimit: 5,
			strictNullHandling: true,
			plainObjects: false,
		}),
};

export default SERVER_CONFIG;
