import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, {
	LoggerOptions,
	multistream,
	Logger as PinoLogger,
	StreamEntry,
} from 'pino';
import pretty from 'pino-pretty';
import { EnvironmentConfiguration } from 'src/modules/app.module';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends ConsoleLogger {
	public pinoLogger: PinoLogger;
	public loggerOptions: LoggerOptions;

	constructor(private config: ConfigService<EnvironmentConfiguration, true>) {
		super();
		const environment =
			this.config.get<EnvironmentConfiguration['NODE_ENV']>('NODE_ENV');
		const name =
			this.config.get<EnvironmentConfiguration['SERVICE_NAME']>('SERVICE_NAME');
		const level =
			this.config.get<EnvironmentConfiguration['LOG_LEVEL']>('LOG_LEVEL');
		const disabled =
			this.config.get<EnvironmentConfiguration['DISABLE_LOGGING']>(
				'DISABLE_LOGGING',
			);

		// Set up the streams we want to log to.
		const streams: StreamEntry[] = [];

		// If we're in development or testing, we want to pretty print the logs.
		if (environment === 'development' || environment === 'testing') {
			streams.push({
				stream: pretty({ colorize: true, sync: environment === 'testing' }),
				level,
			});
		} else {
			// Otherwise, we just want to log to stdout.
			streams.push({ stream: process.stdout, level });
		}

		this.loggerOptions = {
			name,
			level,
			enabled: !disabled,
			timestamp: true,
		};

		this.pinoLogger = pino(this.loggerOptions, multistream(streams));
	}

	override log(message: any, context?: string): void;
	override log(message: any, ...optionalParams: any[]): void;
	override log(message: string, context?: unknown, ...rest: any[]): void {
		this.pinoLogger.info(message, context, rest);
	}

	override error(message: any, stack?: string, context?: string): void;
	override error(message: any, ...optionalParams: any[]): void;
	override error(
		message: string,
		stack?: unknown,
		context?: unknown,
		...rest: unknown[]
	): void {
		this.pinoLogger.error(message, stack, context, rest);
	}

	override debug(message: any, context?: string): void;
	override debug(message: any, ...optionalParams: any[]): void;
	override debug(message: string, context?: unknown, ...rest: unknown[]): void {
		this.pinoLogger.debug(message, context, rest);
	}

	override warn(message: any, context?: string): void;
	override warn(message: any, ...optionalParams: any[]): void;
	override warn(message: string, context?: unknown, ...rest: unknown[]): void {
		this.pinoLogger.warn(message, context, rest);
	}

	override verbose(message: any, context?: string): void;
	override verbose(message: any, ...optionalParams: any[]): void;
	override verbose(
		message: string,
		context?: unknown,
		...rest: unknown[]
	): void {
		this.pinoLogger.trace(message, context, rest);
	}
}
