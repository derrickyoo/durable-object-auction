import type { AuctionRoom } from './auction-room';

export async function callAuction<T>(env: Env, auctionId: string, fn: (stub: DurableObjectStub<AuctionRoom>) => Promise<T>) {
	// Core best practice is to completely discard the errored stub and create a brand-new stub.
	try {
		const stub = env.AUCTION.getByName(auctionId);
		return await fn(stub);
	} catch (err) {
		const stub = env.AUCTION.getByName(auctionId);
		return await fn(stub);
	}
}
