import { pool } from "../db/pool.js";
import { runMigrations } from "../db/runMigrations.js";
import { bootstrapAdmin } from "../services/authService.js";

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: npm run db:seed-admin -- "Admin Name" admin@example.com strong-password');
  process.exit(1);
}

try {
  await runMigrations();
  const user = await bootstrapAdmin({ name, email, password });
  console.log(`Admin created: ${user.email}`);
} finally {
  await pool.end();
}
