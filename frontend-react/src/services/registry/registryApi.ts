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
  createdAt: string;
  updatedAt: string;
  primaryPhone: string | null;
  primaryEmail: string | null;
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

export async function fetchSuppliers() {
  const response = await fetch(`${API_BASE_URL}/admin/suppliers`, {
    headers: getAuthHeaders(),
  });

  return parseResponse<{ suppliers: SupplierRecord[]; total: number }>(response);
}
