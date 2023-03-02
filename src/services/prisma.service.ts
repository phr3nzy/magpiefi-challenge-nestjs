import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { EnvironmentConfiguration } from '../modules/app.module';
import { Logger } from './logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor(
		private logger: Logger,
		private config: ConfigService<EnvironmentConfiguration, true>,
	) {
		const environment =
			config.get<EnvironmentConfiguration['NODE_ENV']>('NODE_ENV');
		super({
			errorFormat: environment === 'production' ? 'minimal' : 'pretty',
			log: [
				{
					emit: 'event',
					level: 'query',
				},
				{
					emit: 'event',
					level: 'error',
				},
				{
					emit: 'event',
					level: 'info',
				},
				{
					emit: 'event',
					level: 'warn',
				},
			],
		});

		this.logger.setContext('prisma');
	}

	async onModuleInit() {
		await this.$connect();
	}

	async enableShutdownHooks(app: INestApplication) {
		this.$on('query' as any, event => {
			this.logger.debug(event);
		});

		this.$on('error' as any, event => {
			this.logger.error(event);
		});

		this.$on('info' as any, event => {
			this.logger.log(event);
		});

		this.$on('warn' as any, event => {
			this.logger.warn(event);
		});

		this.$on('beforeExit', async () => {
			await app.close();
		});
	}

	/**
	 * Runs a health check by invoking MongoDB's builtin ping command
	 * and returns a boolean indicating if the database is alive or not.
	 */
	async healthCheck() {
		const dbPing = (await this.$runCommandRaw({ ping: 1 })) as { ok: number };
		const dbIsAlive = dbPing.ok === 1;
		return dbIsAlive;
	}
}
