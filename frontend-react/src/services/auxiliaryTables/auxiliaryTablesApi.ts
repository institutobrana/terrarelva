import { getStoredToken } from "@/services/auth/authStorage";
import { getApiBaseUrl } from "@/services/auth/apiBase";

export type AuxiliarySimpleTableApiId =
  | "payment-methods"
  | "indication-types"
  | "supplier-segments"
  | "material-groups"
  | "occupations";

export type AuxiliarySimpleRecord = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  isActive: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

type AuxiliarySimpleApiRecord = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  isActive?: boolean;
  ativo?: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type PaymentMethodRecord = AuxiliarySimpleRecord;

export type AuxiliarySimplePayload = {
  codigo?: string;
  nome: string;
  descricao?: string;
};

export type PaymentMethodPayload = AuxiliarySimplePayload;

type CollectionResponseConfig = {
  collectionKey: string;
  itemKey: string;
};

const responseConfigByTable: Record<AuxiliarySimpleTableApiId, CollectionResponseConfig> = {
  "payment-methods": {
    collectionKey: "paymentMethods",
    itemKey: "paymentMethod",
  },
  "indication-types": {
    collectionKey: "indicationTypes",
    itemKey: "indicationType",
  },
  "supplier-segments": {
    collectionKey: "supplierSegments",
    itemKey: "supplierSegment",
  },
  "material-groups": {
    collectionKey: "materialGroups",
    itemKey: "materialGroup",
  },
  occupations: {
    collectionKey: "occupations",
    itemKey: "occupation",
  },
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

function normalizeAuxiliarySimpleRecord(record: AuxiliarySimpleApiRecord): AuxiliarySimpleRecord {
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

export async function fetchAuxiliarySimpleTable(tableId: AuxiliarySimpleTableApiId) {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/${tableId}`, {
    headers: getAuthHeaders(),
  });

  const config = responseConfigByTable[tableId];
  const payload = await parseResponse<Record<string, AuxiliarySimpleApiRecord[] | number>>(response);
  const records = Array.isArray(payload[config.collectionKey]) ? payload[config.collectionKey] as AuxiliarySimpleApiRecord[] : [];

  return {
    total: typeof payload.total === "number" ? payload.total : records.length,
    records: records.map(normalizeAuxiliarySimpleRecord),
  };
}

export async function createAuxiliarySimpleTableEntry(tableId: AuxiliarySimpleTableApiId, payload: AuxiliarySimplePayload) {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/${tableId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const config = responseConfigByTable[tableId];
  const result = await parseResponse<Record<string, AuxiliarySimpleApiRecord>>(response);

  return {
    record: normalizeAuxiliarySimpleRecord(result[config.itemKey]),
  };
}

export async function updateAuxiliarySimpleTableEntry(tableId: AuxiliarySimpleTableApiId, id: string, payload: AuxiliarySimplePayload) {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/${tableId}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const config = responseConfigByTable[tableId];
  const result = await parseResponse<Record<string, AuxiliarySimpleApiRecord>>(response);

  return {
    record: normalizeAuxiliarySimpleRecord(result[config.itemKey]),
  };
}

export async function updateAuxiliarySimpleTableEntryStatus(tableId: AuxiliarySimpleTableApiId, id: string, isActive: boolean) {
  const response = await fetch(`${API_BASE_URL}/admin/auxiliary-tables/${tableId}/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });

  const config = responseConfigByTable[tableId];
  const result = await parseResponse<Record<string, AuxiliarySimpleApiRecord>>(response);

  return {
    record: normalizeAuxiliarySimpleRecord(result[config.itemKey]),
  };
}

export async function fetchPaymentMethods() {
  const result = await fetchAuxiliarySimpleTable("payment-methods");

  return {
    total: result.total,
    paymentMethods: result.records,
  };
}

export async function createPaymentMethod(payload: PaymentMethodPayload) {
  const result = await createAuxiliarySimpleTableEntry("payment-methods", payload);

  return {
    paymentMethod: result.record,
  };
}

export async function updatePaymentMethod(id: string, payload: PaymentMethodPayload) {
  const result = await updateAuxiliarySimpleTableEntry("payment-methods", id, payload);

  return {
    paymentMethod: result.record,
  };
}

export async function updatePaymentMethodStatus(id: string, isActive: boolean) {
  const result = await updateAuxiliarySimpleTableEntryStatus("payment-methods", id, isActive);

  return {
    paymentMethod: result.record,
  };
}
