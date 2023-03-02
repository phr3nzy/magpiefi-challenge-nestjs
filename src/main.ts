import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { logger } from './config/logger';
import SERVER_CONFIG from './config/server';
import type { EnvironmentConfiguration } from './modules/app.module';
import { AppModule } from './modules/app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(SERVER_CONFIG),
		{
			logger: {
				error(message: string, ...optionalParams: unknown[]) {
					logger.error(optionalParams, message);
				},
				log(message: string, ...optionalParams: unknown[]) {
					logger.info(optionalParams, message);
				},
				warn(message: string, ...optionalParams: unknown[]) {
					logger.warn(optionalParams, message);
				},
				debug(message: string, ...optionalParams: unknown[]) {
					logger.debug(optionalParams, message);
				},
				verbose(message: string, ...optionalParams: unknown[]) {
					logger.trace(optionalParams, message);
				},
			},
		},
	);

	const configService = app.get(ConfigService<EnvironmentConfiguration, true>);

	await app.listen(configService.get('PORT'), configService.get('HOST'));
}

bootstrap()
	.then(() => {
		logger.info('Ready to accept requests.');
	})
	.catch(error =>
		logger.error(
			error,
			'An error occured while attempting to bootstrap the server',
		),
	);
