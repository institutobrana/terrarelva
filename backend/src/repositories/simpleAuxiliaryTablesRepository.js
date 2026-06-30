import { pool } from "../db/pool.js";

function getQualifiedTableName(tableName) {
  if (/^[a-z_]+$/.test(tableName)) {
    return tableName;
  }

  throw new Error("Nome de tabela auxiliar invalido.");
}

export async function listSimpleAuxiliaryTableEntries(tableName) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM ${safeTableName}
    ORDER BY code ASC, created_at DESC
  `);

  return result.rows;
}

export async function findSimpleAuxiliaryTableEntryById(tableName, id) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM ${safeTableName}
    WHERE id = $1
    LIMIT 1
  `, [id]);

  return result.rows[0] ?? null;
}

export async function findSimpleAuxiliaryTableEntryByCode(tableName, code) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM ${safeTableName}
    WHERE code = $1
    LIMIT 1
  `, [code]);

  return result.rows[0] ?? null;
}

export async function createSimpleAuxiliaryTableEntry(tableName, { id, code, name, description }) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    INSERT INTO ${safeTableName} (
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

export async function updateSimpleAuxiliaryTableEntry(tableName, { id, code, name, description }) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    UPDATE ${safeTableName}
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

export async function setSimpleAuxiliaryTableEntryStatus(tableName, id, isActive) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    UPDATE ${safeTableName}
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
