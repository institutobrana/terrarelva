import { listClients as listClientsFromRepository } from "../repositories/clientsRepository.js";

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
