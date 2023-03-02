import { Options } from 'ajv';
import logger from './logger';

/**
 * Ajv configuration
 */
export const AJV_CONFIG = {
	allErrors: true,
	removeAdditional: 'all',
	useDefaults: true,
	coerceTypes: true,
	validateSchema: true,
	ownProperties: true,
	logger: {
		log(...args) {
			logger.info(args);
		},
		error(...args) {
			logger.error(args);
		},
		warn(...args) {
			logger.warn(args);
		},
	},
} as Options;

export default AJV_CONFIG;
