import { NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { logger } from './config/logger';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			logger,
		}),
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
