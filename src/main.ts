import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { logger } from './config/logger';
import SERVER_CONFIG from './config/server';

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
	await app.listen(3000);
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
