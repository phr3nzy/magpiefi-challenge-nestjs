import { Injectable } from '@nestjs/common';
import { Client, createClient } from 'urql';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfiguration } from 'src/modules/app.module';
import { Logger } from './logger.service';

export type PairsQueryResult = {
	pairs: {
		id: string;
		token0: {
			id: string;
			symbol: string;
			name: string;
			derivedETH: string;
		};
		token1: {
			id: string;
			symbol: string;
			name: string;
			derivedETH: string;
		};
		reserve0: string;
		reserve1: string;
		reserveUSD: string;
		trackedReserveETH: string;
		token0Price: string;
		token1Price: string;
		volumeUSD: string;
		txCount: string;
	}[];
};

@Injectable()
export class UrqlService {
	private client: Client;
	constructor(
		private logger: Logger,
		private config: ConfigService<EnvironmentConfiguration, true>,
	) {
		this.client = createClient({
			url: config.get<EnvironmentConfiguration['GRAPH_API_URL']>(
				'GRAPH_API_URL',
			),
		});

		this.logger.setContext('urql');
	}

	async fetchPairs(skip = 0) {
		const { data, error } = await this.client
			.query<PairsQueryResult, { skip: number }>(
				`
									query pairs($skip: Int!) {
										pairs(first: 1000, skip: $skip) {
											id
											token0 {
												id
												symbol
												name
												derivedETH
											}
											token1 {
												id
												symbol
												name
												derivedETH
											}
											reserve0
											reserve1
											reserveUSD
											trackedReserveETH
											token0Price
											token1Price
											volumeUSD
											txCount
										}
									}
								`,
				{ skip },
			)
			.toPromise();

		if (!data || error) {
			this.logger.error('Failed to fetch pairs', { error, data });
			throw new Error('Failed to fetch pairs');
		}

		const formattedPairs = data.pairs.flatMap(pair => ({
			pairId: pair.id,
			token0: {
				id: pair.token0.id,
				symbol: pair.token0.symbol,
				name: pair.token0.name,
				derivedETH: parseFloat(pair.token0.derivedETH),
			},
			token1: {
				id: pair.token1.id,
				symbol: pair.token1.symbol,
				name: pair.token1.name,
				derivedETH: parseFloat(pair.token1.derivedETH),
			},
			reserve0: parseFloat(pair.reserve0),
			reserve1: parseFloat(pair.reserve1),
			reserveUSD: parseFloat(pair.reserveUSD),
			trackedReserveETH: parseFloat(pair.trackedReserveETH),
			token0Price: parseFloat(pair.token0Price),
			token1Price: parseFloat(pair.token1Price),
			volumeUSD: parseFloat(pair.volumeUSD),
			txCount: parseFloat(pair.txCount),
		}));

		return formattedPairs;
	}
}
