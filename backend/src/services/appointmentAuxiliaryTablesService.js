import { randomUUID } from "node:crypto";

import {
  createAppointmentAuxiliaryEntry,
  findAppointmentAuxiliaryEntryByCode,
  findAppointmentAuxiliaryEntryById,
  listAppointmentAuxiliaryEntries,
  setAppointmentAuxiliaryEntryStatus,
  updateAppointmentAuxiliaryEntry,
} from "../repositories/appointmentAuxiliaryTablesRepository.js";

const appointmentAuxiliaryDefinitions = {
  "appointment-reasons": {
    tableName: "appointment_reasons",
    codePrefix: "MA",
    entityName: "Motivo de agendamento",
    collectionKey: "appointmentReasons",
    itemKey: "appointmentReason",
    fieldsSql: "type, color, productive_commitment",
    returningFieldsSql: "type, color, productive_commitment",
  },
  "appointment-statuses": {
    tableName: "appointment_statuses",
    codePrefix: "SA",
    entityName: "Situacao de agendamento",
    collectionKey: "appointmentStatuses",
    itemKey: "appointmentStatus",
    fieldsSql: "history, color, hide_appointment, consider_client_no_show",
    returningFieldsSql: "history, color, hide_appointment, consider_client_no_show",
  },
};

function getDefinition(tableId) {
  const definition = appointmentAuxiliaryDefinitions[tableId];
  if (definition) {
    return definition;
  }

  const error = new Error("Tabela auxiliar especial nao suportada.");
  error.statusCode = 404;
  throw error;
}

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

function normalizeAppointmentReasonType(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (normalized === "agendamento" || normalized === "compromisso") {
    return normalized;
  }

  const error = new Error("Tipo do motivo invalido.");
  error.statusCode = 400;
  throw error;
}

function normalizeOptionalColor(value) {
  const normalized = normalizeOptionalText(value);
  return normalized ? normalized.toUpperCase() : null;
}

function toAppointmentAuxiliaryRecord(tableId, row) {
  if (tableId === "appointment-reasons") {
    return {
      id: row.id,
      codigo: row.code,
      nome: row.name,
      descricao: row.description,
      tipo: row.type,
      cor: row.color,
      compromissoProdutivo: row.productive_commitment,
      isActive: row.is_active,
      criadoEm: row.created_at,
      atualizadoEm: row.updated_at,
    };
  }

  return {
    id: row.id,
    codigo: row.code,
    nome: row.name,
    descricao: row.description,
    historico: row.history,
    cor: row.color,
    ocultarAgendamento: row.hide_appointment,
    considerarFaltaCliente: row.consider_client_no_show,
    isActive: row.is_active,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  };
}

async function generateCode(definition) {
  const rows = await listAppointmentAuxiliaryEntries(definition.tableName, definition.fieldsSql);
  const usedCodes = new Set(rows.map((row) => row.code));
  let nextIndex = rows.length + 1;

  while (usedCodes.has(`${definition.codePrefix}-${String(nextIndex).padStart(3, "0")}`)) {
    nextIndex += 1;
  }

  return `${definition.codePrefix}-${String(nextIndex).padStart(3, "0")}`;
}

async function resolveUniqueCode(definition, inputCode, currentId = null) {
  const normalizedCode = normalizeOptionalText(inputCode);
  const candidate = normalizedCode ?? await generateCode(definition);
  const existing = await findAppointmentAuxiliaryEntryByCode(definition.tableName, candidate, definition.fieldsSql);

  if (existing && existing.id !== currentId) {
    const error = new Error(`Ja existe ${definition.entityName.toLowerCase()} com este codigo.`);
    error.statusCode = 409;
    throw error;
  }

  return candidate;
}

function buildAppointmentReasonPayload(payload) {
  const nome = normalizeRequiredName(payload.nome);
  if (!nome) {
    const error = new Error("Nome obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const tipo = normalizeAppointmentReasonType(payload.tipo);
  const cor = normalizeOptionalColor(payload.cor);
  const compromissoProdutivo = payload.compromissoProdutivo === true;

  if (tipo === "compromisso" && !cor) {
    const error = new Error("Cor obrigatoria para motivo do tipo compromisso.");
    error.statusCode = 400;
    throw error;
  }

  return {
    nome,
    descricao: normalizeOptionalText(payload.descricao),
    tipo,
    cor: tipo === "compromisso" ? cor : null,
    compromissoProdutivo: tipo === "compromisso" ? compromissoProdutivo : false,
  };
}

function buildAppointmentStatusPayload(payload) {
  const nome = normalizeRequiredName(payload.nome);
  if (!nome) {
    const error = new Error("Nome obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  return {
    nome,
    descricao: normalizeOptionalText(payload.descricao),
    historico: normalizeOptionalText(payload.historico),
    cor: normalizeOptionalColor(payload.cor),
    ocultarAgendamento: payload.ocultarAgendamento === true,
    considerarFaltaCliente: payload.considerarFaltaCliente === true,
  };
}

export async function listAppointmentAuxiliaryTable(tableId) {
  const definition = getDefinition(tableId);
  const rows = await listAppointmentAuxiliaryEntries(definition.tableName, definition.fieldsSql);

  return {
    [definition.collectionKey]: rows.map((row) => toAppointmentAuxiliaryRecord(tableId, row)),
    total: rows.length,
  };
}

export async function createAppointmentAuxiliaryTableEntry(tableId, payload) {
  const definition = getDefinition(tableId);
  const codigo = await resolveUniqueCode(definition, payload.codigo);

  if (tableId === "appointment-reasons") {
    const normalized = buildAppointmentReasonPayload(payload);
    const created = await createAppointmentAuxiliaryEntry(
      definition.tableName,
      "id, code, name, description, type, color, productive_commitment",
      [randomUUID(), codigo, normalized.nome, normalized.descricao, normalized.tipo, normalized.cor, normalized.compromissoProdutivo],
      definition.returningFieldsSql,
    );

    return { [definition.itemKey]: toAppointmentAuxiliaryRecord(tableId, created) };
  }

  const normalized = buildAppointmentStatusPayload(payload);
  const created = await createAppointmentAuxiliaryEntry(
    definition.tableName,
    "id, code, name, description, history, color, hide_appointment, consider_client_no_show",
    [randomUUID(), codigo, normalized.nome, normalized.descricao, normalized.historico, normalized.cor, normalized.ocultarAgendamento, normalized.considerarFaltaCliente],
    definition.returningFieldsSql,
  );

  return { [definition.itemKey]: toAppointmentAuxiliaryRecord(tableId, created) };
}

export async function updateAppointmentAuxiliaryTableEntry(tableId, id, payload) {
  const definition = getDefinition(tableId);
  const existing = await findAppointmentAuxiliaryEntryById(definition.tableName, id, definition.fieldsSql);
  if (!existing) {
    const error = new Error(`${definition.entityName} nao encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  const codigo = await resolveUniqueCode(definition, payload.codigo, id);

  if (tableId === "appointment-reasons") {
    const normalized = buildAppointmentReasonPayload(payload);
    const updated = await updateAppointmentAuxiliaryEntry(
      definition.tableName,
      "code = $2, name = $3, description = $4, type = $5, color = $6, productive_commitment = $7",
      [id, codigo, normalized.nome, normalized.descricao, normalized.tipo, normalized.cor, normalized.compromissoProdutivo],
      definition.returningFieldsSql,
    );

    return { [definition.itemKey]: toAppointmentAuxiliaryRecord(tableId, updated) };
  }

  const normalized = buildAppointmentStatusPayload(payload);
  const updated = await updateAppointmentAuxiliaryEntry(
    definition.tableName,
    "code = $2, name = $3, description = $4, history = $5, color = $6, hide_appointment = $7, consider_client_no_show = $8",
    [id, codigo, normalized.nome, normalized.descricao, normalized.historico, normalized.cor, normalized.ocultarAgendamento, normalized.considerarFaltaCliente],
    definition.returningFieldsSql,
  );

  return { [definition.itemKey]: toAppointmentAuxiliaryRecord(tableId, updated) };
}

export async function setAppointmentAuxiliaryTableEntryStatus(tableId, id, isActive) {
  const definition = getDefinition(tableId);
  const updated = await setAppointmentAuxiliaryEntryStatus(definition.tableName, id, isActive, definition.returningFieldsSql);
  if (!updated) {
    const error = new Error(`${definition.entityName} nao encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  return { [definition.itemKey]: toAppointmentAuxiliaryRecord(tableId, updated) };
}
