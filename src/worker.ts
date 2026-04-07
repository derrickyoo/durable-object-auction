export default {
	async fetch(request, env, ctx): Promise<Response> {
		const newURL = new URL(request.url);
		const auctionId = newURL.searchParams.get('auctionId');
		if (!auctionId) return new Response('Missing auctionId', { status: 400 });

		if (request.method === 'POST') {
			const body = (await request.json()) as { title?: string };

			if (!body.title) {
				return new Response('Invalid payload', { status: 400 });
			}

			const stub = env.AUCTION.getByName(auctionId);
			await stub.initAuction({ title: body.title });

			return new Response(null, { status: 204 });
		}

		const stub = env.AUCTION.getByName(auctionId);
		const details = await stub.getDetails();
		return Response.json(details);
	},
} satisfies ExportedHandler<Env>;
