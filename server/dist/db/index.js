import { Pool } from "pg";
import { env } from "../config/env.js";
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
export const query = (text, params) => pool.query(text, params);
//# sourceMappingURL=index.js.map