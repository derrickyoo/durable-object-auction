export default {
	async fetch(request, env, ctx): Promise<Response> {
		const workerURL = new URL(request.url);
		const auctionId = workerURL.searchParams.get('auctionId');
		if (!auctionId) return new Response('Missing auctionId', { status: 400 });
		const stub = env.AUCTION.getByName(auctionId);

		if (request.method === 'POST') {
			const body = (await request.json()) as { title?: string };

			if (!body.title) {
				return new Response('Invalid payload', { status: 400 });
			}

			const stub = env.AUCTION.getByName(auctionId);
			await stub.initAuction({ title: body.title });

			return new Response(null, { status: 204 });
		}

		if (workerURL.pathname === '/bump') {
			const stub = env.AUCTION.getByName(auctionId);
			const counters = await stub.bumpLifecycleCounters();
			return Response.json(counters);
		}

		const details = await stub.getDetails();
		return Response.json(details);
	},
} satisfies ExportedHandler<Env>;
