import { pool } from "../db/pool.js";

const clients = [
  {
    id: "0d6711d0-55bd-4c1a-9e56-0c0e9f100001",
    phoneId: "0d6711d0-55bd-4c1a-9e56-0c0e9f100011",
    emailId: "0d6711d0-55bd-4c1a-9e56-0c0e9f100021",
    fullName: "Marina Sousa",
    gender: "feminino",
    birthDate: "1992-03-14",
    internalCode: "CLI-0001",
    cpf: "12345678901",
    documentTypeText: "RG",
    documentNumber: "MG-12.345.678",
    responsibleName: "Carlos Sousa",
    responsibleCpf: "98765432100",
    statusText: "Ativo",
    notes: "Cliente de exemplo para validar a grade e os modais.",
    phoneTypeText: "Celular",
    ddd: "31",
    phoneNumber: "998765432",
    extension: null,
    emailTypeText: "Principal",
    email: "marina.sousa@example.com",
  },
  {
    id: "0d6711d0-55bd-4c1a-9e56-0c0e9f100002",
    phoneId: "0d6711d0-55bd-4c1a-9e56-0c0e9f100012",
    emailId: "0d6711d0-55bd-4c1a-9e56-0c0e9f100022",
    fullName: "Lucas Fernandes",
    gender: "masculino",
    birthDate: "1987-09-02",
    internalCode: "CLI-0002",
    cpf: "23456789012",
    documentTypeText: "CNH",
    documentNumber: "1234567890",
    responsibleName: null,
    responsibleCpf: null,
    statusText: "Ativo",
    notes: "Segundo cliente de exemplo para selecao e edicao.",
    phoneTypeText: "Comercial",
    ddd: "11",
    phoneNumber: "33445566",
    extension: "203",
    emailTypeText: "Principal",
    email: "lucas.fernandes@example.com",
  },
];

const suppliers = [
  {
    id: "7f7822f0-55bd-4c1a-9e56-0c0e9f200001",
    phoneId: "7f7822f0-55bd-4c1a-9e56-0c0e9f200011",
    emailId: "7f7822f0-55bd-4c1a-9e56-0c0e9f200021",
    tradeName: "Ervas Serra Verde",
    companyName: "Serra Verde Insumos Naturais LTDA",
    cpfCnpj: "12345678000199",
    stateRegistration: "123456789",
    website: "https://serraverde.example.com",
    segmentText: "Materias-primas",
    paymentDetails: "PIX e transferencia em 15 dias.",
    notes: "Fornecedor base para testes do cadastro.",
    phoneTypeText: "Comercial",
    ddd: "31",
    phoneNumber: "40028922",
    extension: "12",
    emailTypeText: "Comercial",
    email: "contato@serraverde.example.com",
  },
  {
    id: "7f7822f0-55bd-4c1a-9e56-0c0e9f200002",
    phoneId: "7f7822f0-55bd-4c1a-9e56-0c0e9f200012",
    emailId: "7f7822f0-55bd-4c1a-9e56-0c0e9f200022",
    tradeName: "Embalart",
    companyName: "Embalart Solucoes em Embalagem SA",
    cpfCnpj: "98765432000155",
    stateRegistration: "998877665",
    website: "https://embalart.example.com",
    segmentText: "Embalagens",
    paymentDetails: "Boleto em 21 dias.",
    notes: "Fornecedor de embalagens para validacao de filtros.",
    phoneTypeText: "Comercial",
    ddd: "21",
    phoneNumber: "22223333",
    extension: null,
    emailTypeText: "Financeiro",
    email: "financeiro@embalart.example.com",
  },
];

async function seedClients() {
  for (const client of clients) {
    await pool.query(
      `
        INSERT INTO clients (
          id, full_name, gender, birth_date, internal_code, cpf, document_type_text, document_number,
          responsible_name, responsible_cpf, status_text, notes, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE)
        ON CONFLICT (id) DO UPDATE
        SET
          full_name = EXCLUDED.full_name,
          gender = EXCLUDED.gender,
          birth_date = EXCLUDED.birth_date,
          internal_code = EXCLUDED.internal_code,
          cpf = EXCLUDED.cpf,
          document_type_text = EXCLUDED.document_type_text,
          document_number = EXCLUDED.document_number,
          responsible_name = EXCLUDED.responsible_name,
          responsible_cpf = EXCLUDED.responsible_cpf,
          status_text = EXCLUDED.status_text,
          notes = EXCLUDED.notes,
          is_active = EXCLUDED.is_active
      `,
      [
        client.id,
        client.fullName,
        client.gender,
        client.birthDate,
        client.internalCode,
        client.cpf,
        client.documentTypeText,
        client.documentNumber,
        client.responsibleName,
        client.responsibleCpf,
        client.statusText,
        client.notes,
      ],
    );

    await pool.query(
      `
        INSERT INTO client_phones (id, client_id, phone_type_text, ddd, phone_number, extension, is_primary)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE)
        ON CONFLICT (id) DO UPDATE
        SET
          phone_type_text = EXCLUDED.phone_type_text,
          ddd = EXCLUDED.ddd,
          phone_number = EXCLUDED.phone_number,
          extension = EXCLUDED.extension,
          is_primary = EXCLUDED.is_primary
      `,
      [client.phoneId, client.id, client.phoneTypeText, client.ddd, client.phoneNumber, client.extension],
    );

    await pool.query(
      `
        INSERT INTO client_emails (id, client_id, email_type_text, email, is_primary)
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (id) DO UPDATE
        SET
          email_type_text = EXCLUDED.email_type_text,
          email = EXCLUDED.email,
          is_primary = EXCLUDED.is_primary
      `,
      [client.emailId, client.id, client.emailTypeText, client.email],
    );
  }
}

async function seedSuppliers() {
  for (const supplier of suppliers) {
    await pool.query(
      `
        INSERT INTO suppliers (
          id, trade_name, company_name, cpf_cnpj, state_registration, website,
          segment_text, payment_details, notes, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
        ON CONFLICT (id) DO UPDATE
        SET
          trade_name = EXCLUDED.trade_name,
          company_name = EXCLUDED.company_name,
          cpf_cnpj = EXCLUDED.cpf_cnpj,
          state_registration = EXCLUDED.state_registration,
          website = EXCLUDED.website,
          segment_text = EXCLUDED.segment_text,
          payment_details = EXCLUDED.payment_details,
          notes = EXCLUDED.notes,
          is_active = EXCLUDED.is_active
      `,
      [
        supplier.id,
        supplier.tradeName,
        supplier.companyName,
        supplier.cpfCnpj,
        supplier.stateRegistration,
        supplier.website,
        supplier.segmentText,
        supplier.paymentDetails,
        supplier.notes,
      ],
    );

    await pool.query(
      `
        INSERT INTO supplier_phones (id, supplier_id, phone_type_text, ddd, phone_number, extension, is_primary)
        VALUES ($1, $2, $3, $4, $5, $6, TRUE)
        ON CONFLICT (id) DO UPDATE
        SET
          phone_type_text = EXCLUDED.phone_type_text,
          ddd = EXCLUDED.ddd,
          phone_number = EXCLUDED.phone_number,
          extension = EXCLUDED.extension,
          is_primary = EXCLUDED.is_primary
      `,
      [supplier.phoneId, supplier.id, supplier.phoneTypeText, supplier.ddd, supplier.phoneNumber, supplier.extension],
    );

    await pool.query(
      `
        INSERT INTO supplier_emails (id, supplier_id, email_type_text, email, is_primary)
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (id) DO UPDATE
        SET
          email_type_text = EXCLUDED.email_type_text,
          email = EXCLUDED.email,
          is_primary = EXCLUDED.is_primary
      `,
      [supplier.emailId, supplier.id, supplier.emailTypeText, supplier.email],
    );
  }
}

try {
  await seedClients();
  await seedSuppliers();
  console.log("Clients and suppliers seeded successfully.");
} finally {
  await pool.end();
}
