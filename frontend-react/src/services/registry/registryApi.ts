import { getStoredToken } from "@/services/auth/authStorage";
import { getApiBaseUrl } from "@/services/auth/apiBase";

export type ClientRecord = {
  id: string;
  fullName: string;
  gender: string | null;
  birthDate: string | null;
  internalCode: string | null;
  cpf: string | null;
  documentTypeText: string | null;
  documentNumber: string | null;
  responsibleName: string | null;
  responsibleCpf: string | null;
  statusText: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
};

export type ClientDetailsRecord = Omit<ClientRecord, "primaryPhone" | "primaryEmail">;

export type ClientCreatePayload = {
  fullName: string;
  gender?: string | null;
  birthDate?: string | null;
  cpf?: string | null;
  documentTypeText?: string | null;
  documentNumber?: string | null;
  responsibleName?: string | null;
  statusText?: string | null;
};

export type SupplierRecord = {
  id: string;
  tradeName: string;
  companyName: string | null;
  cpfCnpj: string | null;
  stateRegistration: string | null;
  website: string | null;
  segmentText: string | null;
  paymentDetails: string | null;
  notes: string | null;
  isActive: boolean;
  imagePath: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
};

export type SupplierAddressRecord = {
  id: string;
  supplier_id: string;
  address_type_text: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type SupplierPhoneRecord = {
  id: string;
  supplier_id: string;
  phone_type_text: string | null;
  ddd: string | null;
  phone_number: string;
  extension: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type SupplierEmailRecord = {
  id: string;
  supplier_id: string;
  email_type_text: string | null;
  email: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type SupplierDetailsRecord = {
  id: string;
  trade_name: string;
  company_name: string | null;
  cpf_cnpj: string | null;
  state_registration: string | null;
  website: string | null;
  segment_text: string | null;
  payment_details: string | null;
  notes: string | null;
  is_active: boolean;
  image_path: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  addresses: SupplierAddressRecord[];
  phones: SupplierPhoneRecord[];
  emails: SupplierEmailRecord[];
};

export type SupplierUpsertPayload = {
  tradeName: string;
  companyName?: string | null;
  cpfCnpj?: string | null;
  stateRegistration?: string | null;
  website?: string | null;
  segmentText?: string | null;
  paymentDetails?: string | null;
  notes?: string | null;
  isActive?: boolean;
  phones?: Array<{
    type: string | null;
    ddd: string | null;
    phone: string;
    extension?: string | null;
  }>;
  emails?: Array<{
    type: string | null;
    email: string;
  }>;
};

export class RegistryApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RegistryApiError";
    this.status = status;
  }
}

const API_BASE_URL = getApiBaseUrl();

function getAuthHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new RegistryApiError("Sessao expirada.", 401);
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Falha ao processar requisicao." }));
    throw new RegistryApiError(payload.error ?? "Falha ao processar requisicao.", response.status);
  }

  return response.json();
}

export async function fetchClients() {
  const response = await fetch(`${API_BASE_URL}/admin/clients`, {
    headers: getAuthHeaders(),
  });

  return parseResponse<{ clients: ClientRecord[]; total: number }>(response);
}

export async function fetchClientById(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/clients/${id}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse<{ client: ClientDetailsRecord }>(response);
}

export async function createClient(payload: ClientCreatePayload) {
  const response = await fetch(`${API_BASE_URL}/admin/clients`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<{ client: ClientDetailsRecord }>(response);
}

export async function fetchSuppliers() {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers`, {
    headers: getAuthHeaders(),
  });

  return parseResponse<{ suppliers: SupplierRecord[]; total: number }>(response);
}

export async function fetchSupplierById(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse<{ supplier: SupplierDetailsRecord }>(response);
}

export async function createSupplier(payload: SupplierUpsertPayload) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<{ supplier: SupplierDetailsRecord }>(response);
}

export async function updateSupplier(id: string, payload: SupplierUpsertPayload) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<{ supplier: SupplierDetailsRecord }>(response);
}

export async function uploadSupplierImage(id: string, file: File) {
  const token = getStoredToken();
  if (!token) {
    throw new RegistryApiError("Sessao expirada.", 401);
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseResponse<{ imagePath: string; imageUrl: string; fileName: string }>(response);
}

export async function checkDeleteSupplier(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}/delete-check`, {
    headers: getAuthHeaders(),
  });

  return parseResponse<{ canDelete: boolean; usedIn: string[] }>(response);
}

export async function deleteSupplier(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return parseResponse<{ success: boolean }>(response);
}

export async function replaceAndDeleteSupplier(id: string, replacementId: string) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${id}/replace-and-delete`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ replacementId }),
  });

  return parseResponse<{ success: boolean }>(response);
}

export async function createSupplierAddress(supplierId: string, payload: {
  type: string | null;
  streetType: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  isMain: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${supplierId}/addresses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function createSupplierPhone(supplierId: string, payload: {
  type: string | null;
  ddd: string | null;
  phone: string;
  note: string | null;
  isMain: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${supplierId}/phones`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function createSupplierEmail(supplierId: string, payload: {
  type: string | null;
  email: string;
  isMain: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers/${supplierId}/emails`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}
