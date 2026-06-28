import { pool } from "../db/pool.js";
import { runMigrations } from "../db/runMigrations.js";

try {
  await runMigrations();
  console.log("Migrations executed successfully.");
} finally {
  await pool.end();
}
