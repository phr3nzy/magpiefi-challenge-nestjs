import 'make-promises-safe';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import type { EnvironmentConfiguration } from './modules/app.module';
import { AppModule } from './modules/app.module';
import { Logger } from './services/logger.service';
import { PrismaService } from './services/prisma.service';
import ajvFormats from 'ajv-formats';
import ajvErrors from 'ajv-errors';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { parse } from 'qs';
import { v4 as uuid } from 'uuid';

// Generate a request id - this is used for logging and tracing
function genReqId(_: FastifyRequest) {
	return uuid();
}

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			ajv: {
				customOptions: {
					allErrors: true,
					removeAdditional: 'all',
					useDefaults: true,
					coerceTypes: true,
					validateSchema: true,
					ownProperties: true,
				},
				plugins: [ajvFormats, ajvErrors],
			},
			trustProxy: true,
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
		}),
		{
			autoFlushLogs: true,
		},
	);

	const configService = app.get(ConfigService<EnvironmentConfiguration, true>);
	const logger = new Logger(configService);
	app.useLogger(logger);
	const fastifyInstance = app.getHttpAdapter().getInstance() as FastifyInstance;
	fastifyInstance.log = logger.pinoLogger;

	const prismaService = app.get(PrismaService);
	await prismaService.enableShutdownHooks(app);

	await app.listen(configService.get('PORT'), configService.get('HOST'));
}

void bootstrap();
