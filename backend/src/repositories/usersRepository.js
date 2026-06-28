import { pool } from "../db/pool.js";

const userSelectFields = `id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at`;

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT ${userSelectFields}
     FROM users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT ${userSelectFields}
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

export async function listUsersByStatus(status = "active") {
  const whereClause =
    status === "inactive" ? "WHERE is_active = FALSE" : status === "all" ? "" : "WHERE is_active = TRUE";

  const result = await pool.query(
    `SELECT id, name, email, role, is_active, last_login_at, created_at, updated_at
     FROM users
     ${whereClause}
     ORDER BY LOWER(name) ASC, created_at DESC`,
  );

  return result.rows;
}

export async function updateLastLogin(id) {
  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
}

export async function updatePasswordHash(id, passwordHash) {
  const result = await pool.query(
    `UPDATE users
     SET password_hash = $2
     WHERE id = $1
     RETURNING id, name, email, role, is_active, last_login_at, created_at, updated_at`,
    [id, passwordHash],
  );

  return result.rows[0] ?? null;
}

export async function updateUserActiveStatus(id, isActive) {
  const result = await pool.query(
    `UPDATE users
     SET is_active = $2
     WHERE id = $1
     RETURNING id, name, email, role, is_active, last_login_at, created_at, updated_at`,
    [id, isActive],
  );

  return result.rows[0] ?? null;
}
