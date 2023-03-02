import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';

@Controller({
	path: 'health',
})
export class HealthController {
	constructor(private readonly prismaService: PrismaService) {}

	@Get('/')
	async getMetadata() {
		const dbIsAlive = await this.prismaService.healthCheck();
		return {
			status: dbIsAlive ? 'ok' : 'failing',
			dbIsAlive,
		};
	}
}
