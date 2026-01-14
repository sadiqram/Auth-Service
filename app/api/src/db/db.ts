// import { Pool } from 'pg';

// const pool = new Pool({
//     // user: process.env.DB_USER,
//     // host: process.env.DB_HOST,
//     // database: process.env.DB_NAME,
//     // password: process.env.DB_PASSWORD,
//     // port: parseInt(process.env.DB_PORT || '5432'),
//     connectionString: process.env.DATABASE_URL,
// });

// export default pool;

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3_000, // fail fast
  idleTimeoutMillis: 30_000,
  max: 10,
});

export default pool;
