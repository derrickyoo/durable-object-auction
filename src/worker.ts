export default {
	async fetch(request, env, ctx): Promise<Response> {
		const workerURL = new URL(request.url);
		const auctionId = workerURL.searchParams.get('auctionId');
		if (!auctionId) return new Response('Missing auctionId', { status: 400 });
		const stub = env.AUCTION.getByName(auctionId);

		if (request.method === 'POST' && workerURL.pathname === '/') {
			const body = (await request.json()) as { title?: string };

			if (!body.title) {
				return new Response('Invalid payload', { status: 400 });
			}

			const stub = env.AUCTION.getByName(auctionId);
			await stub.initAuction({ title: body.title, startingPrice: 100 });

			return new Response(null, { status: 204 });
		}

		if (request.method === 'POST' && workerURL.pathname === '/bids') {
			const body = (await request.json()) as { userId?: string; amount?: number; idempotencyKey: string };
			if (!body.userId || !body.amount) {
				return new Response('Invalid payload', { status: 400 });
			}

			// await stub.addBid(body.userId, body.amount);

			try {
				await stub.placeBid({ userId: body.userId, amount: body.amount, idempotencyKey: body.idempotencyKey });
			} catch (err: any) {
				if (err.message === 'AUCTION_NOT_FOUND') return new Response('Not found', { status: 404 });
				if (err.message === 'AUCTION_NOT_ACTIVE') return new Response('Not active', { status: 404 });
				if (err.message === 'BID_TOO_LOW') return new Response('Bid too low', { status: 404 });

				throw err;
			}
			return new Response(null, { status: 204 });
		}

		if (workerURL.pathname === '/bids') {
			const bids = await stub.listRecentBids();
			return Response.json(bids);
		}

		if (workerURL.pathname === '/history') {
			const limit = Number(workerURL.searchParams.get('limit') ?? 50);
			const offset = Number(workerURL.searchParams.get('offset') ?? 0);
			const history = await stub.getHistory(limit, offset);
			return Response.json(history);
		}

		const details = await stub.getDetails();
		return Response.json(details);
	},
} satisfies ExportedHandler<Env>;
