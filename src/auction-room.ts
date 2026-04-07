import { DurableObject } from 'cloudflare:workers';

export class AuctionRoom extends DurableObject<Env> {
	private title: string | null = null;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async initAuction(input: { title: string }) {
		this.title = input.title;
	}

	async getDetails() {
		return {
			auctionId: this.ctx.id.toString(),
			title: this.title,
			status: !this.title ? 'not initialized' : 'active',
		};
	}
}
