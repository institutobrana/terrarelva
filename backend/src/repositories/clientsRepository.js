import { randomUUID } from "node:crypto";

import { pool } from "../db/pool.js";

async function nextClientId() {
  return randomUUID();
}

async function replaceClientContacts(client, clientId, payload) {
  const phones = Array.isArray(payload.phones) ? payload.phones : [];
  const emails = Array.isArray(payload.emails) ? payload.emails : [];
  const addresses = Array.isArray(payload.addresses) ? payload.addresses : [];

  console.log("[clients:tx] replacing contacts", {
    clientId,
    phones: phones.length,
    emails: emails.length,
    addresses: addresses.length,
  });

  await client.query(`DELETE FROM client_phones WHERE client_id = $1`, [clientId]);
  await client.query(`DELETE FROM client_emails WHERE client_id = $1`, [clientId]);
  await client.query(`DELETE FROM client_addresses WHERE client_id = $1`, [clientId]);

  console.log("INSERT PHONES:", phones);
  for (let index = 0; index < phones.length; index += 1) {
    const phone = phones[index];
    if (!phone || (!phone.phoneNumber && !phone.ddd && !phone.phoneTypeText)) {
      continue;
    }

    const id = await nextClientId();
    await client.query(
      `
        INSERT INTO client_phones (
          id, client_id, phone_type_text, ddd, phone_number, extension, is_primary
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        id,
        clientId,
        phone.phoneTypeText ?? null,
        phone.ddd ?? null,
        phone.phoneNumber ?? "",
        phone.extension ?? null,
        index === 0,
      ],
    );
  }

  console.log("INSERT EMAILS:", emails);
  for (let index = 0; index < emails.length; index += 1) {
    const email = emails[index];
    if (!email || (!email.email && !email.emailTypeText)) {
      continue;
    }

    const id = await nextClientId();
    await client.query(
      `
        INSERT INTO client_emails (
          id, client_id, email_type_text, email, is_primary
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        id,
        clientId,
        email.emailTypeText ?? null,
        email.email ?? "",
        index === 0,
      ],
    );
  }

  console.log("INSERT ADDRESSES:", addresses);
  for (let index = 0; index < addresses.length; index += 1) {
    const address = addresses[index];
    if (!address || (!address.street && !address.zipCode && !address.addressTypeText)) {
      continue;
    }

    const id = await nextClientId();
    await client.query(
      `
        INSERT INTO client_addresses (
          id, client_id, address_type_text, street, number, complement, district, city, state, zip_code, is_primary
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        id,
        clientId,
        address.addressTypeText ?? null,
        address.street ?? null,
        address.number ?? null,
        address.complement ?? null,
        address.district ?? null,
        address.city ?? null,
        address.state ?? null,
        address.zipCode ?? null,
        index === 0,
      ],
    );
  }
}

async function replaceClientBenefits(client, clientId, payload) {
  const benefits = Array.isArray(payload.benefits) ? payload.benefits : [];

  await client.query(`DELETE FROM client_benefits WHERE client_id = $1`, [clientId]);

  for (let index = 0; index < benefits.length; index += 1) {
    const benefit = benefits[index];
    if (!benefit || (!benefit.benefitTypeText && !benefit.beneficiaryCode && !benefit.validUntil)) {
      continue;
    }

    const id = await nextClientId();
    await client.query(
      `
        INSERT INTO client_benefits (
          id, client_id, benefit_type_text, beneficiary_code, valid_until, is_primary
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        id,
        clientId,
        benefit.benefitTypeText ?? null,
        benefit.beneficiaryCode ?? null,
        benefit.validUntil ?? null,
        Boolean(benefit.isPrimary ?? index === 0),
      ],
    );
  }
}

export async function createClient(payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("[clients:tx] BEGIN create");

    const id = await nextClientId();
    const result = await client.query(
      `
        INSERT INTO clients (
          id, full_name, gender, birth_date, cpf, document_type_text,
          document_number, responsible_name, father_name, mother_name, social_name, nickname, occupation, record_number, marital_status, spouse_name, indication_type_text, provider_text, public_visibility, status_text, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, TRUE)
        RETURNING id, full_name, gender, birth_date, internal_code, cpf, document_type_text, document_number, responsible_name, father_name, mother_name, social_name, nickname, occupation, record_number, marital_status, spouse_name, indication_type_text, provider_text, public_visibility, responsible_cpf, status_text, notes, is_active, created_at, updated_at
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
        payload.fatherName ?? null,
        payload.motherName ?? null,
        payload.socialName ?? null,
        payload.nickname ?? null,
        payload.occupation ?? null,
        payload.recordNumber ?? null,
        payload.maritalStatus ?? null,
        payload.spouseName ?? null,
        payload.indicationTypeText ?? null,
        payload.providerText ?? null,
        payload.publicVisibility ?? false,
        payload.statusText ?? null,
      ],
    );

    await replaceClientContacts(client, id, payload);
    await replaceClientBenefits(client, id, payload);
    await client.query("COMMIT");
    console.log("[clients:tx] COMMIT create", { clientId: id });
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.log("[clients:tx] ROLLBACK create", { error: error instanceof Error ? error.message : String(error) });
    throw error;
  } finally {
    client.release();
  }
}

export async function updateClient(clientId, payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("[clients:tx] BEGIN update", { clientId });

    const result = await client.query(
      `
        UPDATE clients
        SET full_name = $2,
            gender = $3,
            birth_date = $4,
            cpf = $5,
            document_type_text = $6,
            document_number = $7,
            responsible_name = $8,
            father_name = $9,
            mother_name = $10,
            social_name = $11,
            nickname = $12,
            occupation = $13,
            record_number = $14,
            marital_status = $15,
            spouse_name = $16,
            indication_type_text = $17,
            provider_text = $18,
            public_visibility = $19
        WHERE id = $1
        RETURNING id, full_name, gender, birth_date, internal_code, cpf, document_type_text, document_number, responsible_name, father_name, mother_name, social_name, nickname, occupation, record_number, marital_status, spouse_name, indication_type_text, provider_text, public_visibility, responsible_cpf, status_text, notes, is_active, created_at, updated_at
      `,
      [
        clientId,
        payload.fullName,
        payload.gender ?? null,
        payload.birthDate ?? null,
        payload.cpf ?? null,
        payload.documentTypeText ?? null,
        payload.documentNumber ?? null,
        payload.responsibleName ?? null,
        payload.fatherName ?? null,
        payload.motherName ?? null,
        payload.socialName ?? null,
        payload.nickname ?? null,
        payload.occupation ?? null,
        payload.recordNumber ?? null,
        payload.maritalStatus ?? null,
        payload.spouseName ?? null,
        payload.indicationTypeText ?? null,
        payload.providerText ?? null,
        payload.publicVisibility ?? false,
      ],
    );

    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await replaceClientContacts(client, clientId, payload);
    await replaceClientBenefits(client, clientId, payload);
    await client.query("COMMIT");
    console.log("[clients:tx] COMMIT update", { clientId });
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.log("[clients:tx] ROLLBACK update", {
      clientId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteClient(clientId) {
  const result = await pool.query(
    `
      DELETE FROM clients
      WHERE id = $1
      RETURNING id
    `,
    [clientId],
  );

  return result.rows[0] ?? null;
}

export async function resetClients() {
  await pool.query(`DELETE FROM clients;`);
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
      c.father_name,
      c.mother_name,
      c.social_name,
      c.nickname,
      c.occupation,
      c.record_number,
      c.marital_status,
      c.spouse_name,
      c.indication_type_text,
      c.provider_text,
      c.public_visibility,
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
        father_name,
        mother_name,
        social_name,
        nickname,
        occupation,
        record_number,
        marital_status,
        spouse_name,
        indication_type_text,
        provider_text,
        public_visibility,
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

export async function listClientBenefits(clientId) {
  const result = await pool.query(
    `
      SELECT
        id,
        benefit_type_text,
        beneficiary_code,
        valid_until,
        is_primary,
        created_at,
        updated_at
      FROM client_benefits
      WHERE client_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `,
    [clientId],
  );

  return result.rows;
}

export async function listClientPhones(clientId) {
  const result = await pool.query(
    `
      SELECT
        id,
        phone_type_text,
        ddd,
        phone_number,
        extension,
        is_primary,
        created_at,
        updated_at
      FROM client_phones
      WHERE client_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `,
    [clientId],
  );

  return result.rows;
}

export async function listClientEmails(clientId) {
  const result = await pool.query(
    `
      SELECT
        id,
        email_type_text,
        email,
        is_primary,
        created_at,
        updated_at
      FROM client_emails
      WHERE client_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `,
    [clientId],
  );

  return result.rows;
}

export async function listClientAddresses(clientId) {
  const result = await pool.query(
    `
      SELECT
        id,
        address_type_text,
        street,
        number,
        complement,
        district,
        city,
        state,
        zip_code,
        is_primary,
        created_at,
        updated_at
      FROM client_addresses
      WHERE client_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `,
    [clientId],
  );

  return result.rows;
}

export async function createClientPhone(clientId, payload) {
  const id = await nextClientId();
  const result = await pool.query(
    `
      INSERT INTO client_phones (
        id, client_id, phone_type_text, ddd, phone_number, extension, is_primary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, client_id, phone_type_text, ddd, phone_number, extension, is_primary, created_at, updated_at
    `,
    [
      id,
      clientId,
      payload.type ?? null,
      payload.ddd ?? null,
      payload.phone ?? "",
      payload.extension ?? null,
      Boolean(payload.isPrimary),
    ],
  );

  return result.rows[0];
}

export async function createClientEmail(clientId, payload) {
  const id = await nextClientId();
  const result = await pool.query(
    `
      INSERT INTO client_emails (
        id, client_id, email_type_text, email, is_primary
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, client_id, email_type_text, email, is_primary, created_at, updated_at
    `,
    [
      id,
      clientId,
      payload.type ?? null,
      payload.email ?? "",
      Boolean(payload.isPrimary),
    ],
  );

  return result.rows[0];
}

export async function createClientAddress(clientId, payload) {
  const id = await nextClientId();
  const result = await pool.query(
    `
      INSERT INTO client_addresses (
        id, client_id, address_type_text, street, number, complement, district, city, state, zip_code, is_primary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, client_id, address_type_text, street, number, complement, district, city, state, zip_code, is_primary, created_at, updated_at
    `,
    [
      id,
      clientId,
      payload.type ?? null,
      payload.street ?? null,
      payload.number ?? null,
      payload.complement ?? null,
      payload.district ?? null,
      payload.city ?? null,
      payload.state ?? null,
      payload.zipCode ?? null,
      Boolean(payload.isPrimary),
    ],
  );

  return result.rows[0];
}

export async function deleteClientPhone(clientId, phoneId) {
  const result = await pool.query(
    `
      DELETE FROM client_phones
      WHERE client_id = $1 AND id = $2
      RETURNING id
    `,
    [clientId, phoneId],
  );

  return result.rows[0] ?? null;
}

export async function deleteClientEmail(clientId, emailId) {
  const result = await pool.query(
    `
      DELETE FROM client_emails
      WHERE client_id = $1 AND id = $2
      RETURNING id
    `,
    [clientId, emailId],
  );

  return result.rows[0] ?? null;
}

export async function deleteClientAddress(clientId, addressId) {
  const result = await pool.query(
    `
      DELETE FROM client_addresses
      WHERE client_id = $1 AND id = $2
      RETURNING id
    `,
    [clientId, addressId],
  );

  return result.rows[0] ?? null;
}
