import { Hono } from "hono";

type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/increment-count", async (c) => {
	const db = c.env.DB;
	const stmt = db.prepare("INSERT INTO Accesses DEFAULT VALUES;");

	try {
		await stmt.run();
	} catch (e) {
		return c.json({ success: false }, 500);
	}

	return c.json({ success: true }, 204);
});

export default app;
