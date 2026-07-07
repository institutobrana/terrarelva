import {
  createClient as createClientInRepository,
  createClientAddress as createClientAddressInRepository,
  createClientEmail as createClientEmailInRepository,
  createClientPhone as createClientPhoneInRepository,
  deleteClient as deleteClientFromRepository,
  deleteClientAddress as deleteClientAddressFromRepository,
  deleteClientEmail as deleteClientEmailFromRepository,
  deleteClientPhone as deleteClientPhoneFromRepository,
  getClientById as getClientByIdFromRepository,
  listClientBenefits as listClientBenefitsFromRepository,
  listClientAddresses as listClientAddressesFromRepository,
  listClientEmails as listClientEmailsFromRepository,
  listClientPhones as listClientPhonesFromRepository,
  listClients as listClientsFromRepository,
  resetClients as resetClientsInRepository,
  updateClient as updateClientInRepository,
} from "../repositories/clientsRepository.js";

function formatPhone(row) {
  if (!row.primary_phone_number) {
    return null;
  }

  const pieces = [row.primary_phone_ddd ? `(${row.primary_phone_ddd})` : null, row.primary_phone_number, row.primary_phone_extension ? `ramal ${row.primary_phone_extension}` : null]
    .filter(Boolean);

  return pieces.join(" ");
}

export async function listClients() {
  const rows = await listClientsFromRepository();

  return {
    clients: rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      gender: row.gender,
      birthDate: row.birth_date,
      internalCode: row.internal_code,
      cpf: row.cpf,
      documentTypeText: row.document_type_text,
      documentNumber: row.document_number,
      responsibleName: row.responsible_name,
      fatherName: row.father_name,
      motherName: row.mother_name,
      socialName: row.social_name,
      nickname: row.nickname,
      occupation: row.occupation,
      recordNumber: row.record_number,
      maritalStatus: row.marital_status,
      spouseName: row.spouse_name,
      indicationTypeText: row.indication_type_text,
      providerText: row.provider_text,
      publicVisibility: row.public_visibility,
      responsibleCpf: row.responsible_cpf,
      statusText: row.status_text,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      primaryPhone: formatPhone(row),
      primaryEmail: row.primary_email,
    })),
    total: rows.length,
  };
}

export async function getClientDetails(clientId) {
  const client = await getClientByIdFromRepository(clientId);
  if (!client) {
    const error = new Error("Cliente nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const [phones, emails, addresses, benefits] = await Promise.all([
    listClientPhonesFromRepository(clientId),
    listClientEmailsFromRepository(clientId),
    listClientAddressesFromRepository(clientId),
    listClientBenefitsFromRepository(clientId),
  ]);

  return {
    client: {
      id: client.id,
      fullName: client.full_name,
      gender: client.gender,
      birthDate: client.birth_date,
      internalCode: client.internal_code,
      cpf: client.cpf,
      documentTypeText: client.document_type_text,
      documentNumber: client.document_number,
      responsibleName: client.responsible_name,
      fatherName: client.father_name,
      motherName: client.mother_name,
      socialName: client.social_name,
      nickname: client.nickname,
      occupation: client.occupation,
      recordNumber: client.record_number,
      maritalStatus: client.marital_status,
      spouseName: client.spouse_name,
      indicationTypeText: client.indication_type_text,
      providerText: client.provider_text,
      publicVisibility: client.public_visibility,
      responsibleCpf: client.responsible_cpf,
      statusText: client.status_text,
      notes: client.notes,
      isActive: client.is_active,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      phones: phones.map((phone) => ({
        id: phone.id,
        phoneTypeText: phone.phone_type_text,
        ddd: phone.ddd,
        phoneNumber: phone.phone_number,
        extension: phone.extension,
        isPrimary: phone.is_primary,
        createdAt: phone.created_at,
        updatedAt: phone.updated_at,
      })),
      emails: emails.map((email) => ({
        id: email.id,
        emailTypeText: email.email_type_text,
        email: email.email,
        isPrimary: email.is_primary,
        createdAt: email.created_at,
        updatedAt: email.updated_at,
      })),
      addresses: addresses.map((address) => ({
        id: address.id,
        addressTypeText: address.address_type_text,
        street: address.street,
        number: address.number,
        complement: address.complement,
        district: address.district,
        city: address.city,
        state: address.state,
        zipCode: address.zip_code,
        isPrimary: address.is_primary,
        createdAt: address.created_at,
        updatedAt: address.updated_at,
      })),
      benefits: benefits.map((benefit) => ({
        id: benefit.id,
        benefitTypeText: benefit.benefit_type_text,
        beneficiaryCode: benefit.beneficiary_code,
        validUntil: benefit.valid_until,
        isPrimary: benefit.is_primary,
        createdAt: benefit.created_at,
        updatedAt: benefit.updated_at,
      })),
    },
  };
}

export async function createClient(payload) {
  const dbPayload = {
    fullName: typeof payload.name === "string" ? payload.name : "",
    gender: typeof payload.gender === "string" ? payload.gender : null,
    birthDate: typeof payload.birth_date === "string" ? payload.birth_date : null,
    cpf: typeof payload.cpf === "string" ? payload.cpf : null,
    documentTypeText: typeof payload.document_type === "string" ? payload.document_type : null,
    documentNumber: typeof payload.document_number === "string" ? payload.document_number : null,
    responsibleName: typeof payload.responsible === "string" ? payload.responsible : null,
    fatherName: typeof payload.fatherName === "string" ? payload.fatherName : null,
    motherName: typeof payload.motherName === "string" ? payload.motherName : null,
    socialName: typeof payload.socialName === "string" ? payload.socialName : null,
    nickname: typeof payload.nickname === "string" ? payload.nickname : null,
    occupation: typeof payload.occupation === "string" ? payload.occupation : null,
    recordNumber: typeof payload.recordNumber === "string" ? payload.recordNumber : null,
    maritalStatus: typeof payload.maritalStatus === "string" ? payload.maritalStatus : null,
    spouseName: typeof payload.spouseName === "string" ? payload.spouseName : null,
    indicationTypeText: typeof payload.indicationType === "string" ? payload.indicationType : null,
    providerText: typeof payload.provider === "string" ? payload.provider : null,
    publicVisibility: typeof payload.publicVisibility === "boolean" ? payload.publicVisibility : false,
    statusText: typeof payload.status_text === "string" ? payload.status_text : "Ativo",
    benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
    phones: Array.isArray(payload.phones) ? payload.phones : [],
    emails: Array.isArray(payload.emails) ? payload.emails : [],
    addresses: Array.isArray(payload.addresses) ? payload.addresses : [],
  };

  console.log("[clients:create] payload recebido:", {
    ...dbPayload,
    phones: dbPayload.phones,
    emails: dbPayload.emails,
    addresses: dbPayload.addresses,
  });
  console.log("PHONES:", dbPayload.phones);
  console.log("EMAILS:", dbPayload.emails);
  console.log("ADDRESSES:", dbPayload.addresses);
  console.log("BENEFITS:", dbPayload.benefits);

  const client = await createClientInRepository(dbPayload);
  return {
    client: {
      id: client.id,
      fullName: client.full_name,
      gender: client.gender,
      birthDate: client.birth_date,
      internalCode: client.internal_code,
      cpf: client.cpf,
      documentTypeText: client.document_type_text,
      documentNumber: client.document_number,
      responsibleName: client.responsible_name,
      fatherName: client.father_name,
      motherName: client.mother_name,
      socialName: client.social_name,
      nickname: client.nickname,
      occupation: client.occupation,
      recordNumber: client.record_number,
      maritalStatus: client.marital_status,
      spouseName: client.spouse_name,
      indicationTypeText: client.indication_type_text,
      providerText: client.provider_text,
      publicVisibility: client.public_visibility,
      responsibleCpf: client.responsible_cpf,
      statusText: client.status_text,
      notes: client.notes,
      isActive: client.is_active,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      primaryPhone: null,
      primaryEmail: null,
      benefits: dbPayload.benefits,
    },
  };
}

export async function updateClient(clientId, payload) {
  const dbPayload = {
    fullName: typeof payload.name === "string" ? payload.name : "",
    gender: typeof payload.gender === "string" ? payload.gender : null,
    birthDate: typeof payload.birth_date === "string" ? payload.birth_date : null,
    cpf: typeof payload.cpf === "string" ? payload.cpf : null,
    documentTypeText: typeof payload.document_type === "string" ? payload.document_type : null,
    documentNumber: typeof payload.document_number === "string" ? payload.document_number : null,
    responsibleName: typeof payload.responsible === "string" ? payload.responsible : null,
    fatherName: typeof payload.fatherName === "string" ? payload.fatherName : null,
    motherName: typeof payload.motherName === "string" ? payload.motherName : null,
    socialName: typeof payload.socialName === "string" ? payload.socialName : null,
    nickname: typeof payload.nickname === "string" ? payload.nickname : null,
    occupation: typeof payload.occupation === "string" ? payload.occupation : null,
    recordNumber: typeof payload.recordNumber === "string" ? payload.recordNumber : null,
    maritalStatus: typeof payload.maritalStatus === "string" ? payload.maritalStatus : null,
    spouseName: typeof payload.spouseName === "string" ? payload.spouseName : null,
    indicationTypeText: typeof payload.indicationType === "string" ? payload.indicationType : null,
    providerText: typeof payload.provider === "string" ? payload.provider : null,
    publicVisibility: typeof payload.publicVisibility === "boolean" ? payload.publicVisibility : false,
    statusText: typeof payload.status_text === "string" ? payload.status_text : "Ativo",
    benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
    phones: Array.isArray(payload.phones) ? payload.phones : [],
    emails: Array.isArray(payload.emails) ? payload.emails : [],
    addresses: Array.isArray(payload.addresses) ? payload.addresses : [],
  };

  console.log("[clients:update] payload recebido:", {
    clientId,
    ...dbPayload,
    phones: dbPayload.phones,
    emails: dbPayload.emails,
    addresses: dbPayload.addresses,
  });
  console.log("PHONES:", dbPayload.phones);
  console.log("EMAILS:", dbPayload.emails);
  console.log("ADDRESSES:", dbPayload.addresses);
  console.log("BENEFITS:", dbPayload.benefits);

  const client = await updateClientInRepository(clientId, dbPayload);
  if (!client) {
    const error = new Error("Cliente nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return {
    client: {
      id: client.id,
      fullName: client.full_name,
      gender: client.gender,
      birthDate: client.birth_date,
      internalCode: client.internal_code,
      cpf: client.cpf,
      documentTypeText: client.document_type_text,
      documentNumber: client.document_number,
      responsibleName: client.responsible_name,
      fatherName: client.father_name,
      motherName: client.mother_name,
      socialName: client.social_name,
      nickname: client.nickname,
      occupation: client.occupation,
      recordNumber: client.record_number,
      maritalStatus: client.marital_status,
      spouseName: client.spouse_name,
      indicationTypeText: client.indication_type_text,
      providerText: client.provider_text,
      publicVisibility: client.public_visibility,
      responsibleCpf: client.responsible_cpf,
      statusText: client.status_text,
      notes: client.notes,
      isActive: client.is_active,
      createdAt: client.created_at,
      updatedAt: client.updated_at,
      primaryPhone: null,
      primaryEmail: null,
      benefits: dbPayload.benefits,
    },
  };
}

export async function deleteClient(clientId) {
  const deleted = await deleteClientFromRepository(clientId);
  if (!deleted) {
    const error = new Error("Cliente nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return { success: true };
}

export async function resetClients() {
  await resetClientsInRepository();
  return { success: true, message: "Todos os clientes foram removidos" };
}

export async function addClientPhone(clientId, payload) {
  return createClientPhoneInRepository(clientId, payload);
}

export async function addClientEmail(clientId, payload) {
  return createClientEmailInRepository(clientId, payload);
}

export async function addClientAddress(clientId, payload) {
  return createClientAddressInRepository(clientId, payload);
}

export async function removeClientPhone(clientId, phoneId) {
  const deleted = await deleteClientPhoneFromRepository(clientId, phoneId);
  if (!deleted) {
    const error = new Error("Telefone nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return { success: true };
}

export async function removeClientEmail(clientId, emailId) {
  const deleted = await deleteClientEmailFromRepository(clientId, emailId);
  if (!deleted) {
    const error = new Error("Email nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return { success: true };
}

export async function removeClientAddress(clientId, addressId) {
  const deleted = await deleteClientAddressFromRepository(clientId, addressId);
  if (!deleted) {
    const error = new Error("Endereco nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return { success: true };
}
