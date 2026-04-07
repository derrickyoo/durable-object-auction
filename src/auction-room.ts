import { DurableObject } from 'cloudflare:workers';

export class AuctionRoom extends DurableObject<Env> {
	private title: string | null = null;
	private memoryCounter = 0;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		this.ctx.blockConcurrencyWhile(async () => {
			this.ctx.storage.sql.exec(`
				CREATE TABLE IF NOT EXISTS lifecycle_runner
				(
					id INTEGER PRIMARY KEY,
					value INTEGER NOT NULL
				)
			`);
		});
	}

	async bumpLifecycleCounters(): Promise<{ memory: number; durable: number }> {
		this.memoryCounter += 1;

		// ⚠️ Normally in SQLite, this read and write would result in a race condition
		// ✅ Durable Objects handles race conditions

		// read
		const current =
			this.ctx.storage.sql.exec<{ value: number }>('SELECT value FROM lifecycle_counter WHERE id = 1').toArray()[0]?.value ?? 0;

		const next = current + 1;

		// write
		this.ctx.storage.sql.exec('INSERT OR REPLACE INTO lifecycle_counter (id, value) VALUES (1, ?)', next);

		return { memory: this.memoryCounter, durable: next };
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
