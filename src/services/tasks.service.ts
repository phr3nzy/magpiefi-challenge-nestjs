import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { UrqlService } from './urql.service';
import { Logger } from './logger.service';
import { PairService } from './pair.service';
import type { Pair } from '@prisma/client';

@Injectable()
export class TasksService {
	constructor(
		private logger: Logger,
		private prismaService: PrismaService,
		private pairService: PairService,
		private urqlService: UrqlService,
	) {}

	@Cron(CronExpression.EVERY_30_MINUTES, {
		name: 'pairs-synchronization',
	})
	async syncPairs() {
		this.logger.log('Synchronizing pairs...');
		const pairsToSkip = 0;
		const fetchedPairs = await this.urqlService.fetchPairs(pairsToSkip);

		// Let's first check if we have pairs in the database. This is so we update the few that we have
		// and create the ones we don't.
		const pairsInDb = await this.pairService.all();

		if (pairsInDb.length > 0) {
			const pairsInDbMap = new Map<string, Pair>();
			pairsInDb.forEach(pair => pairsInDbMap.set(pair.pairId, pair));

			const pairsToSyncMap = new Map<string, (typeof fetchedPairs)[number]>();
			fetchedPairs.forEach(pair => pairsToSyncMap.set(pair.pairId, pair));
			const pairIdsToSync = pairsToSyncMap.keys();

			const pairsToCreate: ReturnType<typeof this.prismaService.pair.create>[] =
				[];
			const pairsToUpdate: ReturnType<typeof this.prismaService.pair.update>[] =
				[];

			for (const pairIdToSync of pairIdsToSync) {
				// If we have pairs in the database matching ones in the fetched payload,
				// we update the respective records
				if (pairsInDbMap.has(pairIdToSync)) {
					const recordToUpdate = pairsToSyncMap.get(pairIdToSync);
					if (recordToUpdate) {
						const { pairId, ...pair } = recordToUpdate;
						pairsToUpdate.push(
							this.prismaService.pair.update({
								where: { pairId },
								data: {
									...pair,
								},
							}),
						);
					}
				} else {
					// If we don't have that specific pairId in the database,
					// we create a record for it
					const recordToCreate = pairsToSyncMap.get(pairIdToSync);
					if (recordToCreate) {
						pairsToCreate.push(
							this.prismaService.pair.create({
								data: {
									...recordToCreate,
								},
							}),
						);
					}
				}
			}

			// Run the transaction by first creating the pairs we don't have
			// and then updating the ones that we do
			const trxPayload: ReturnType<
				typeof this.prismaService.pair.create &
					typeof this.prismaService.pair.update
			>[] = [];

			if (pairsToCreate.length >= 1) {
				this.logger.log(`${pairsToCreate.length} pairs to be created...`);
				trxPayload.push(...pairsToCreate);
			}

			if (pairsToUpdate.length >= 1) {
				this.logger.log(`${pairsToUpdate.length} pairs to be updated...`);
				trxPayload.push(...pairsToUpdate);
			}

			if (trxPayload.length >= 1) {
				const upsertedPairs = await this.prismaService.$transaction([
					...trxPayload,
				]);

				this.logger.log(`${upsertedPairs.length} pairs updated/created.`);
			} else {
				this.logger.log('Nothing to update/create');
			}
		} else {
			const createdPairs = await this.prismaService.pair.createMany({
				data: fetchedPairs,
			});
			this.logger.log(`${createdPairs.count} pairs created.`);
		}
		this.logger.log('Pairs syncronized.');
	}
}
