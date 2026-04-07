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
			await stub.initAuction({ title: body.title });

			return new Response(null, { status: 204 });
		}

		if (request.method === 'POST' && workerURL.pathname === '/bids') {
			const body = (await request.json()) as { userId?: string; amount?: number };
			if (!body.userId || !body.amount) {
				return new Response('Invalid payload', { status: 400 });
			}

			await stub.addBid(body.userId, body.amount);
			return new Response(null, { status: 204 });
		}

		const details = await stub.getDetails();
		return Response.json(details);
	},
} satisfies ExportedHandler<Env>;
