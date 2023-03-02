import { Injectable } from '@nestjs/common';
import type { Pair } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PairService {
	constructor(private prisma: PrismaService) {}

	async all(): Promise<Pair[]> {
		return this.prisma.pair.findMany();
	}
}
