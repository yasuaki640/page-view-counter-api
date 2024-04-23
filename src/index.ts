import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import type { Bindings, IncrementRes } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

const corsMiddleware = createMiddleware<{ Bindings: Bindings }>(
	async (c, next) => {
		const middleware = cors({ origin: c.env.ALLOW_ORIGIN });
		return middleware(c, next);
	},
);
app.use(corsMiddleware);

app.get(
	"/increment-count",
	zValidator("query", z.object({ visitorId: z.string() })),
	async (c) => {
		// biome-ignore lint: lint/style/noNonNullAssertion
		const visitorId = c.req.query("visitorId")!;
		const { success } = await c.env.RATE_LIMITER.limit({ key: visitorId });

		try {
			if (!success) {
				const count = await selectCount(c.env.DB);
				return c.json<IncrementRes>({ success: true, count }, 200);
			}

			await incrementCount(c.env.DB);
			const count = await selectCount(c.env.DB);
			return c.json<IncrementRes>({ success: true, count }, 201);
		} catch (e) {
			console.error(e);
			return c.json<IncrementRes>({ success: false }, 500);
		}
	},
);

// Database operations
const selectCount = async (db: Bindings["DB"]) => {
	const countStmt = db.prepare("SELECT COUNT(*) AS count FROM Accesses;");
	return (await countStmt.first<number>("count")) ?? 0;
};

const incrementCount = async (db: Bindings["DB"]) => {
	const insertStmt = db.prepare("INSERT INTO Accesses DEFAULT VALUES;");
	await insertStmt.run();
};

export default app;
