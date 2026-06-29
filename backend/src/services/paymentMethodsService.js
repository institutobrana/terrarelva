import { randomUUID } from "node:crypto";

import {
  createPaymentMethod,
  findPaymentMethodByCode,
  findPaymentMethodById,
  listPaymentMethods as listPaymentMethodsFromRepository,
  setPaymentMethodStatus as setPaymentMethodStatusFromRepository,
  updatePaymentMethod as updatePaymentMethodFromRepository,
} from "../repositories/paymentMethodsRepository.js";

function normalizeOptionalText(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeRequiredName(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function toPaymentMethod(row) {
  return {
    id: row.id,
    codigo: row.code,
    nome: row.name,
    descricao: row.description,
    isActive: row.is_active,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

async function generatePaymentMethodCode() {
  const rows = await listPaymentMethodsFromRepository();
  const usedCodes = new Set(rows.map((row) => row.code));
  let nextIndex = rows.length + 1;

  while (usedCodes.has(`FP-${String(nextIndex).padStart(3, "0")}`)) {
    nextIndex += 1;
  }

  return `FP-${String(nextIndex).padStart(3, "0")}`;
}

async function resolveUniqueCode(inputCode, currentId = null) {
  const normalizedCode = normalizeOptionalText(inputCode);
  const candidate = normalizedCode ?? await generatePaymentMethodCode();
  const existing = await findPaymentMethodByCode(candidate);

  if (existing && existing.id !== currentId) {
    const error = new Error("Ja existe uma forma de pagamento com este codigo.");
    error.statusCode = 409;
    throw error;
  }

  return candidate;
}

export async function listPaymentMethods() {
  const rows = await listPaymentMethodsFromRepository();

  return {
    paymentMethods: rows.map(toPaymentMethod),
    total: rows.length,
  };
}

export async function createPaymentMethodEntry(payload) {
  const nome = normalizeRequiredName(payload.nome);
  if (!nome) {
    const error = new Error("Nome obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const codigo = await resolveUniqueCode(payload.codigo);
  const descricao = normalizeOptionalText(payload.descricao);

  const created = await createPaymentMethod({
    id: randomUUID(),
    code: codigo,
    name: nome,
    description: descricao,
  });

  return toPaymentMethod(created);
}

export async function updatePaymentMethodEntry(id, payload) {
  const existing = await findPaymentMethodById(id);
  if (!existing) {
    const error = new Error("Forma de pagamento nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  const nome = normalizeRequiredName(payload.nome);
  if (!nome) {
    const error = new Error("Nome obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const codigo = await resolveUniqueCode(payload.codigo, id);
  const descricao = normalizeOptionalText(payload.descricao);

  const updated = await updatePaymentMethodFromRepository({
    id,
    code: codigo,
    name: nome,
    description: descricao,
  });

  return toPaymentMethod(updated);
}

export async function setPaymentMethodStatus(id, isActive) {
  const updated = await setPaymentMethodStatusFromRepository(id, isActive);
  if (!updated) {
    const error = new Error("Forma de pagamento nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  return toPaymentMethod(updated);
}
