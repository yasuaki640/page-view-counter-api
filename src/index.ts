import { Hono } from "hono";

type Bindings = {
	DB: D1Database;
};

type IncrementRes =
	| { success: true; count: number }
	| { success: false };

const app = new Hono<{ Bindings: Bindings }>();

app.get("/increment-count", async (c) => {
	const db = c.env.DB;
	const insertStmt = db.prepare("INSERT INTO Accesses DEFAULT VALUES;");
	const countStmt = db.prepare("SELECT COUNT(*) AS count FROM Accesses;");

	try {
		await insertStmt.run();
		const count = await countStmt.first<number>("count") ?? 0;
		return c.json<IncrementRes>({ success: true, count }, 201);
	} catch (e) {
		console.error(e);
		return c.json<IncrementRes>({ success: false }, 500);
	}
});

export default app;
