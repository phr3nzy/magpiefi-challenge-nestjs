import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Pair } from '@prisma/client';

@Injectable()
export class PairService {
	constructor(private prisma: PrismaService) {}

	async all(): Promise<Pair[]> {
		return this.prisma.pair.findMany();
	}

	async insertMany(pairs: Pair[]) {
		return this.prisma.pair.createMany({
			data: pairs,
		});
	}
}
