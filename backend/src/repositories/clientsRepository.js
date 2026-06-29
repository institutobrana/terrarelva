import { pool } from "../db/pool.js";

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
