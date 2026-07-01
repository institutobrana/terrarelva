import { randomUUID } from "node:crypto";

import { pool } from "../db/pool.js";

async function nextClientId() {
  return randomUUID();
}

export async function createClient(payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const id = await nextClientId();
    const result = await client.query(
      `
        INSERT INTO clients (
          id, full_name, gender, birth_date, cpf, document_type_text,
          document_number, responsible_name, status_text, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
        RETURNING id, full_name, gender, birth_date, internal_code, cpf, document_type_text, document_number, responsible_name, responsible_cpf, status_text, notes, is_active, created_at, updated_at
      `,
      [
        id,
        payload.fullName,
        payload.gender ?? null,
        payload.birthDate ?? null,
        payload.cpf ?? null,
        payload.documentTypeText ?? null,
        payload.documentNumber ?? null,
        payload.responsibleName ?? null,
        payload.statusText ?? null,
      ],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function listClients() {
  const result = await pool.query(`
    SELECT
      c.id,
      c.full_name,
      c.gender,
      c.birth_date,
      c.internal_code,
      c.cpf,
      c.document_type_text,
      c.document_number,
      c.responsible_name,
      c.responsible_cpf,
      c.status_text,
      c.notes,
      c.is_active,
      c.created_at,
      c.updated_at,
      cp.phone_type_text AS primary_phone_type_text,
      cp.ddd AS primary_phone_ddd,
      cp.phone_number AS primary_phone_number,
      cp.extension AS primary_phone_extension,
      ce.email_type_text AS primary_email_type_text,
      ce.email AS primary_email
    FROM clients c
    LEFT JOIN LATERAL (
      SELECT phone_type_text, ddd, phone_number, extension
      FROM client_phones
      WHERE client_id = c.id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1
    ) cp ON TRUE
    LEFT JOIN LATERAL (
      SELECT email_type_text, email
      FROM client_emails
      WHERE client_id = c.id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1
    ) ce ON TRUE
    ORDER BY LOWER(c.full_name) ASC, c.created_at DESC
  `);

  return result.rows;
}

export async function getClientById(clientId) {
  const result = await pool.query(
    `
      SELECT
        id,
        full_name,
        gender,
        birth_date,
        internal_code,
        cpf,
        document_type_text,
        document_number,
        responsible_name,
        responsible_cpf,
        status_text,
        notes,
        is_active,
        created_at,
        updated_at
      FROM clients
      WHERE id = $1
      LIMIT 1
    `,
    [clientId],
  );

  return result.rows[0] ?? null;
}
