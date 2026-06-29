import { listSuppliers as listSuppliersFromRepository } from "../repositories/suppliersRepository.js";

function formatPhone(row) {
  if (!row.primary_phone_number) {
    return null;
  }

  const pieces = [row.primary_phone_ddd ? `(${row.primary_phone_ddd})` : null, row.primary_phone_number, row.primary_phone_extension ? `ramal ${row.primary_phone_extension}` : null]
    .filter(Boolean);

  return pieces.join(" ");
}

export async function listSuppliers() {
  const rows = await listSuppliersFromRepository();

  return {
    suppliers: rows.map((row) => ({
      id: row.id,
      tradeName: row.trade_name,
      companyName: row.company_name,
      cpfCnpj: row.cpf_cnpj,
      stateRegistration: row.state_registration,
      website: row.website,
      segmentText: row.segment_text,
      paymentDetails: row.payment_details,
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
