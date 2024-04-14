import { Hono } from "hono";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";

type Bindings = {
	DB: D1Database;
	ALLOW_ORIGIN: string;
};

type IncrementRes = { success: true; count: number } | { success: false };

const app = new Hono<{ Bindings: Bindings }>();

const corsMiddleware = createMiddleware<{ Bindings: Bindings }>(
	async (c, next) => {
		const middleware = cors({ origin: c.env.ALLOW_ORIGIN });
		return middleware(c, next);
	},
);
app.use(corsMiddleware);

app.get("/increment-count", async (c) => {
	const db = c.env.DB;
	const insertStmt = db.prepare("INSERT INTO Accesses DEFAULT VALUES;");
	const countStmt = db.prepare("SELECT COUNT(*) AS count FROM Accesses;");

	try {
		await insertStmt.run();
		const count = (await countStmt.first<number>("count")) ?? 0;
		return c.json<IncrementRes>({ success: true, count }, 201);
	} catch (e) {
		console.error(e);
		return c.json<IncrementRes>({ success: false }, 500);
	}
});

export default app;
