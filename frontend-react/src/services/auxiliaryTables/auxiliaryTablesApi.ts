import { getStoredToken } from "@/services/auth/authStorage";
import { getApiBaseUrl } from "@/services/auth/apiBase";

export type PaymentMethodRecord = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  isActive: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

type PaymentMethodApiRecord = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  isActive?: boolean;
  ativo?: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type PaymentMethodPayload = {
  codigo?: string;
  nome: string;
  descricao?: string;
};

export class AuxiliaryTablesApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuxiliaryTablesApiError";
    this.status = status;
  }
}

const API_BASE_URL = getApiBaseUrl();

function getAuthHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new AuxiliaryTablesApiError("Sessao expirada.", 401);
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Falha ao processar requisicao." }));
    throw new AuxiliaryTablesApiError(payload.error ?? "Falha ao processar requisicao.", response.status);
  }

  return response.json();
}

function normalizePaymentMethod(record: PaymentMethodApiRecord): PaymentMethodRecord {
  return {
    id: record.id,
    codigo: record.codigo,
    nome: record.nome,
    descricao: record.descricao,
    isActive: typeof record.isActive === "boolean" ? record.isActive : Boolean(record.ativo),
    criadoEm: record.criadoEm,
    atualizadoEm: record.atualizadoEm,
  };
}

export async function fetchPaymentMethods() {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/payment-methods`, {
    headers: getAuthHeaders(),
  });

  const payload = await parseResponse<{ paymentMethods: PaymentMethodApiRecord[]; total: number }>(response);

  return {
    total: payload.total,
    paymentMethods: payload.paymentMethods.map(normalizePaymentMethod),
  };
}

export async function createPaymentMethod(payload: PaymentMethodPayload) {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/payment-methods`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await parseResponse<{ paymentMethod: PaymentMethodApiRecord }>(response);

  return {
    paymentMethod: normalizePaymentMethod(result.paymentMethod),
  };
}

export async function updatePaymentMethod(id: string, payload: PaymentMethodPayload) {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/payment-methods/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await parseResponse<{ paymentMethod: PaymentMethodApiRecord }>(response);

  return {
    paymentMethod: normalizePaymentMethod(result.paymentMethod),
  };
}

export async function updatePaymentMethodStatus(id: string, isActive: boolean) {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/payment-methods/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });

  const result = await parseResponse<{ paymentMethod: PaymentMethodApiRecord }>(response);

  return {
    paymentMethod: normalizePaymentMethod(result.paymentMethod),
  };
}
