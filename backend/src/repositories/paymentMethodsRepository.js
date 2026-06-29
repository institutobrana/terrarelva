import { pool } from "../db/pool.js";

export async function listPaymentMethods() {
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM payment_methods
    ORDER BY LOWER(name) ASC, created_at DESC
  `);

  return result.rows;
}

export async function findPaymentMethodById(id) {
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM payment_methods
    WHERE id = $1
    LIMIT 1
  `, [id]);

  return result.rows[0] ?? null;
}

export async function findPaymentMethodByCode(code) {
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM payment_methods
    WHERE code = $1
    LIMIT 1
  `, [code]);

  return result.rows[0] ?? null;
}

export async function createPaymentMethod({ id, code, name, description }) {
  const result = await pool.query(`
    INSERT INTO payment_methods (
      id,
      code,
      name,
      description
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `, [id, code, name, description]);

  return result.rows[0];
}

export async function updatePaymentMethod({ id, code, name, description }) {
  const result = await pool.query(`
    UPDATE payment_methods
    SET
      code = $2,
      name = $3,
      description = $4
    WHERE id = $1
    RETURNING
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `, [id, code, name, description]);

  return result.rows[0] ?? null;
}

export async function setPaymentMethodStatus(id, isActive) {
  const result = await pool.query(`
    UPDATE payment_methods
    SET is_active = $2
    WHERE id = $1
    RETURNING
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `, [id, isActive]);

  return result.rows[0] ?? null;
}
