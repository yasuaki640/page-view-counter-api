export type Bindings = {
	DB: D1Database;
	ALLOW_ORIGIN: string;
	RATE_LIMITER: {
		limit: (args: { key: string }) => Promise<{ success: boolean }>;
	};
};

export type IncrementRes =
	| { success: true; count: number }
	| { success: false };
