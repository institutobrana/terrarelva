import { randomUUID } from "node:crypto";

import { pool } from "../db/pool.js";
import { toPublicUrl } from "../utils/publicUrl.js";

async function nextSupplierContactId() {
  return randomUUID();
}

async function replacePrimaryContacts(client, supplierId, payload) {
  await client.query(`DELETE FROM supplier_phones WHERE supplier_id = $1`, [supplierId]);
  await client.query(`DELETE FROM supplier_emails WHERE supplier_id = $1`, [supplierId]);

  const phones = Array.isArray(payload.phones) ? payload.phones : [];
  for (let index = 0; index < phones.length; index += 1) {
    const phone = phones[index];
    if (!phone || (!phone.phone && !phone.ddd && !phone.type)) {
      continue;
    }

    const id = await nextSupplierContactId();
    await client.query(
      `
        INSERT INTO supplier_phones (
          id, supplier_id, phone_type_text, ddd, phone_number, extension, is_primary
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        id,
        supplierId,
        phone.type ?? null,
        phone.ddd ?? null,
        phone.phone ?? "",
        phone.extension ?? null,
        index === 0,
      ],
    );
  }

  const emails = Array.isArray(payload.emails) ? payload.emails : [];
  for (let index = 0; index < emails.length; index += 1) {
    const email = emails[index];
    if (!email || (!email.email && !email.type)) {
      continue;
    }

    const id = await nextSupplierContactId();
    await client.query(
      `
        INSERT INTO supplier_emails (
          id, supplier_id, email_type_text, email, is_primary
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        id,
        supplierId,
        email.type ?? null,
        email.email ?? "",
        index === 0,
      ],
    );
  }
}

export async function createSupplier(payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const id = await nextSupplierContactId();
    const result = await client.query(
      `
        INSERT INTO suppliers (
          id, trade_name, company_name, cpf_cnpj, state_registration, website,
          segment_text, payment_details, notes, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, trade_name, company_name, cpf_cnpj, state_registration, website, segment_text, payment_details, notes, is_active, image_path, created_at, updated_at
      `,
      [
        id,
        payload.tradeName,
        payload.companyName ?? null,
        payload.cpfCnpj ?? null,
        payload.stateRegistration ?? null,
        payload.website ?? null,
        payload.segmentText ?? null,
        payload.paymentDetails ?? null,
        payload.notes ?? null,
        Boolean(payload.isActive),
      ],
    );

    await replacePrimaryContacts(client, id, payload);
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function updateSupplier(supplierId, payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
        UPDATE suppliers
        SET trade_name = $2,
            company_name = $3,
            cpf_cnpj = $4,
            state_registration = $5,
            website = $6,
            segment_text = $7,
            payment_details = $8,
            notes = $9,
            is_active = $10
        WHERE id = $1
        RETURNING id, trade_name, company_name, cpf_cnpj, state_registration, website, segment_text, payment_details, notes, is_active, image_path, created_at, updated_at
      `,
      [
        supplierId,
        payload.tradeName,
        payload.companyName ?? null,
        payload.cpfCnpj ?? null,
        payload.stateRegistration ?? null,
        payload.website ?? null,
        payload.segmentText ?? null,
        payload.paymentDetails ?? null,
        payload.notes ?? null,
        Boolean(payload.isActive),
      ],
    );

    if (!result.rows[0]) {
      const error = new Error("Fornecedor nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    if (Array.isArray(payload.phones) || Array.isArray(payload.emails)) {
      await replacePrimaryContacts(client, supplierId, payload);
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteSupplier(supplierId) {
  const result = await pool.query(
    `DELETE FROM suppliers
     WHERE id = $1
     RETURNING id`,
    [supplierId],
  );

  return result.rowCount > 0;
}

export async function replaceAndDeleteSupplier(supplierId, replacementId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sourceResult = await client.query(
      `SELECT id FROM suppliers WHERE id = $1 LIMIT 1`,
      [supplierId],
    );
    if (!sourceResult.rows[0]) {
      const error = new Error("Fornecedor nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const replacementResult = await client.query(
      `SELECT id FROM suppliers WHERE id = $1 LIMIT 1`,
      [replacementId],
    );
    if (!replacementResult.rows[0]) {
      const error = new Error("Fornecedor de substituicao nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    if (supplierId === replacementId) {
      const error = new Error("O fornecedor original e a substituicao nao podem ser iguais.");
      error.statusCode = 400;
      throw error;
    }

    await client.query(`UPDATE supplier_addresses SET supplier_id = $2 WHERE supplier_id = $1`, [supplierId, replacementId]);
    await client.query(`UPDATE supplier_phones SET supplier_id = $2 WHERE supplier_id = $1`, [supplierId, replacementId]);
    await client.query(`UPDATE supplier_emails SET supplier_id = $2 WHERE supplier_id = $1`, [supplierId, replacementId]);

    const deleteResult = await client.query(`DELETE FROM suppliers WHERE id = $1`, [supplierId]);
    await client.query("COMMIT");
    return deleteResult.rowCount > 0;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function getSupplierById(supplierId) {
  const supplierResult = await pool.query(
    `
      SELECT
        id,
        trade_name,
        company_name,
        cpf_cnpj,
        state_registration,
        website,
        segment_text,
        payment_details,
        notes,
        is_active,
        image_path,
        created_at,
        updated_at
      FROM suppliers
      WHERE id = $1
      LIMIT 1
    `,
    [supplierId],
  );

  const supplier = supplierResult.rows[0];
  if (!supplier) {
    return null;
  }

  const [addressesResult, phonesResult, emailsResult] = await Promise.all([
    pool.query(
      `
        SELECT
          id, supplier_id, address_type_text, street, number, complement,
          district, city, state, zip_code, is_primary, created_at, updated_at
        FROM supplier_addresses
        WHERE supplier_id = $1
        ORDER BY is_primary DESC, created_at ASC
      `,
      [supplierId],
    ),
    pool.query(
      `
        SELECT
          id, supplier_id, phone_type_text, ddd, phone_number, extension,
          is_primary, created_at, updated_at
        FROM supplier_phones
        WHERE supplier_id = $1
        ORDER BY is_primary DESC, created_at ASC
      `,
      [supplierId],
    ),
    pool.query(
      `
        SELECT
          id, supplier_id, email_type_text, email, is_primary, created_at, updated_at
        FROM supplier_emails
        WHERE supplier_id = $1
        ORDER BY is_primary DESC, created_at ASC
      `,
      [supplierId],
    ),
  ]);

  return {
    ...supplier,
    image_url: supplier.image_path ? toPublicUrl(`/uploads/fornecedores/${supplier.image_path}`) : null,
    addresses: addressesResult.rows,
    phones: phonesResult.rows,
    emails: emailsResult.rows,
  };
}

export async function createSupplierAddress(supplierId, payload) {
  const id = await nextSupplierContactId();
  const result = await pool.query(
    `
      INSERT INTO supplier_addresses (
        id, supplier_id, address_type_text, street, number, complement,
        district, city, state, zip_code, is_primary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, supplier_id, address_type_text, street, number, complement, district, city, state, zip_code, is_primary, created_at, updated_at
    `,
    [
      id,
      supplierId,
      payload.type ?? null,
      payload.streetType ?? null,
      payload.number ?? null,
      payload.complement ?? null,
      payload.neighborhood ?? null,
      payload.city ?? null,
      payload.state ?? null,
      payload.zipCode ?? null,
      Boolean(payload.isMain),
    ],
  );

  return result.rows[0];
}

export async function createSupplierPhone(supplierId, payload) {
  const id = await nextSupplierContactId();
  const result = await pool.query(
    `
      INSERT INTO supplier_phones (
        id, supplier_id, phone_type_text, ddd, phone_number, extension, is_primary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, supplier_id, phone_type_text, ddd, phone_number, extension, is_primary, created_at, updated_at
    `,
    [id, supplierId, payload.type ?? null, payload.ddd ?? null, payload.phone ?? "", payload.note ?? null, Boolean(payload.isMain)],
  );

  return result.rows[0];
}

export async function createSupplierEmail(supplierId, payload) {
  const id = await nextSupplierContactId();
  const result = await pool.query(
    `
      INSERT INTO supplier_emails (
        id, supplier_id, email_type_text, email, is_primary
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, supplier_id, email_type_text, email, is_primary, created_at, updated_at
    `,
    [id, supplierId, payload.type ?? null, payload.email ?? "", Boolean(payload.isMain)],
  );

  return result.rows[0];
}
