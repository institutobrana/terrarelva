import { pool } from "../db/pool.js";

export async function listSuppliers() {
  const result = await pool.query(`
    SELECT
      s.id,
      s.trade_name,
      s.company_name,
      s.cpf_cnpj,
      s.state_registration,
      s.website,
      s.segment_text,
      s.payment_details,
      s.notes,
      s.is_active,
      s.image_path,
      s.created_at,
      s.updated_at,
      sp.phone_type_text AS primary_phone_type_text,
      sp.ddd AS primary_phone_ddd,
      sp.phone_number AS primary_phone_number,
      sp.extension AS primary_phone_extension,
      se.email_type_text AS primary_email_type_text,
      se.email AS primary_email
    FROM suppliers s
    LEFT JOIN LATERAL (
      SELECT phone_type_text, ddd, phone_number, extension
      FROM supplier_phones
      WHERE supplier_id = s.id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1
    ) sp ON TRUE
    LEFT JOIN LATERAL (
      SELECT email_type_text, email
      FROM supplier_emails
      WHERE supplier_id = s.id
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 1
    ) se ON TRUE
    ORDER BY LOWER(s.trade_name) ASC, s.created_at DESC
  `);

  return result.rows;
}
