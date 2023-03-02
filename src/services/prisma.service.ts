import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	async onModuleInit() {
		await this.$connect();
	}

	async enableShutdownHooks(app: INestApplication) {
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
