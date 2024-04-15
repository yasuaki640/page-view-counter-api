export type Bindings = {
	DB: D1Database;
	ALLOW_ORIGIN: string;
};

export type IncrementRes =
	| { success: true; count: number }
	| { success: false };
