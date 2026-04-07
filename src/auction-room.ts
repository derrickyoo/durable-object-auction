import { DurableObject } from 'cloudflare:workers';

export class AuctionRoom extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async getDetails() {
		return {
			auctionId: this.ctx.id.toString(),
			status: 'not initialized',
		};
	}
}
