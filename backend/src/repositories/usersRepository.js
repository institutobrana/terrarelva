import { pool } from "../db/pool.js";

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createUser({ id, name, email, passwordHash, role, isActive = true }) {
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, is_active, last_login_at, created_at, updated_at`,
    [id, name, email, passwordHash, role, isActive],
  );

  return result.rows[0];
}

export async function updateLastLogin(id) {
  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
}
