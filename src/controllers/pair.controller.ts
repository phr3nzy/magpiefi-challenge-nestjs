import { Controller, Get } from '@nestjs/common';
import { PairService } from '../services/pair.service';

@Controller({
	path: 'pairs',
})
export class PairController {
	constructor(private readonly pairService: PairService) {}

	@Get('/')
	async getAllPairs() {
		const pairs = await this.pairService.all();
		return { success: true, message: 'Successfully fetched all pairs.', pairs };
	}
}
