import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentConfiguration } from 'src/modules/app.module';

@Injectable()
export class AppService {
	constructor(
		private configService: ConfigService<EnvironmentConfiguration, true>,
	) {}

	getMetadataRoute() {
		return {
			description:
				this.configService.get<EnvironmentConfiguration['SERVICE_NAME']>(
					'SERVICE_NAME',
				),
			version:
				this.configService.get<EnvironmentConfiguration['SERVICE_VERSION']>(
					'SERVICE_VERSION',
				),
			status:
				this.configService.get<EnvironmentConfiguration['NODE_ENV']>(
					'NODE_ENV',
				) === 'production'
					? 'live'
					: 'dev',
		};
	}
}
