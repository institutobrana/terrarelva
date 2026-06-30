import { pool } from "../db/pool.js";

function getQualifiedTableName(tableName) {
  if (/^[a-z_]+$/.test(tableName)) {
    return tableName;
  }

  throw new Error("Nome de tabela auxiliar especial invalido.");
}

export async function listAppointmentAuxiliaryEntries(tableName, fieldsSql) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      ${fieldsSql},
      is_active,
      created_at,
      updated_at
    FROM ${safeTableName}
    ORDER BY code ASC, created_at DESC
  `);

  return result.rows;
}

export async function findAppointmentAuxiliaryEntryById(tableName, id, fieldsSql) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      ${fieldsSql},
      is_active,
      created_at,
      updated_at
    FROM ${safeTableName}
    WHERE id = $1
    LIMIT 1
  `, [id]);

  return result.rows[0] ?? null;
}

export async function findAppointmentAuxiliaryEntryByCode(tableName, code, fieldsSql) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    SELECT
      id,
      code,
      name,
      description,
      ${fieldsSql},
      is_active,
      created_at,
      updated_at
    FROM ${safeTableName}
    WHERE code = $1
    LIMIT 1
  `, [code]);

  return result.rows[0] ?? null;
}

export async function createAppointmentAuxiliaryEntry(tableName, insertColumnsSql, insertValues, returningFieldsSql) {
  const safeTableName = getQualifiedTableName(tableName);
  const placeholders = insertValues.map((_, index) => `$${index + 1}`).join(", ");
  const result = await pool.query(`
    INSERT INTO ${safeTableName} (
      ${insertColumnsSql}
    )
    VALUES (${placeholders})
    RETURNING
      id,
      code,
      name,
      description,
      ${returningFieldsSql},
      is_active,
      created_at,
      updated_at
  `, insertValues);

  return result.rows[0];
}

export async function updateAppointmentAuxiliaryEntry(tableName, updateAssignmentsSql, updateValues, returningFieldsSql) {
  const safeTableName = getQualifiedTableName(tableName);
  const result = await pool.query(`
    UPDATE ${safeTableName}
    SET
      ${updateAssignmentsSql}
    WHERE id = $1
    RETURNING
      id,
      code,
      name,
      description,
      ${returningFieldsSql},
      is_active,
      created_at,
      updated_at
  `, updateValues);

  return result.rows[0] ?? null;
}

export async function setAppointmentAuxiliaryEntryStatus(tableName, id, isActive, returningFieldsSql) {
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
      ${returningFieldsSql},
      is_active,
      created_at,
      updated_at
  `, [id, isActive]);

  return result.rows[0] ?? null;
}
