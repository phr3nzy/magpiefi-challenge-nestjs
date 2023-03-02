import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as joi from 'joi';
import { PairController } from '../controllers/pair.controller';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { Logger } from '../services/logger.service';
import { PrismaService } from '../services/prisma.service';
import { PairService } from 'src/services/pair.service';

export type EnvironmentConfiguration = {
	NODE_ENV: 'development' | 'production' | 'testing';
	HOST: string;
	PORT: number;
	SERVICE_NAME: string;
	SERVICE_VERSION: string;
	LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
	DISABLE_LOGGING: boolean;
	DATABASE_URL: string;
	GRAPH_API_URL: string;
};

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: ['.env'],
			isGlobal: true,
			cache: true,
			validationSchema: joi.object<
				EnvironmentConfiguration,
				true,
				EnvironmentConfiguration
			>({
				NODE_ENV: joi
					.string()
					.required()
					.valid('development', 'production', 'testing'),
				HOST: joi.string().required(),
				PORT: joi.number().required(),
				SERVICE_NAME: joi.string().default('magpiefi-challenge'),
				SERVICE_VERSION: joi
					.string()
					.default('1.0.0')
					.regex(/^([\d]{1}).([\d]{1,8}).([\d]{1,8})([-_](alpha|beta|rc))?$/),
				LOG_LEVEL: joi
					.string()
					.valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
					.default('debug'),
				DISABLE_LOGGING: joi.boolean().default(false),
				DATABASE_URL: joi.string().required(),
				GRAPH_API_URL: joi.string().required(),
			}),
			validationOptions: {
				allowUnknown: true,
				abortEarly: true,
				convert: true,
			},
		}),
	],
	controllers: [AppController, PairController],
	providers: [AppService, Logger, PrismaService, PairService],
})
export class AppModule {}
