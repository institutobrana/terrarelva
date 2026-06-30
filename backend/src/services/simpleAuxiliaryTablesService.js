import { randomUUID } from "node:crypto";

import {
  createSimpleAuxiliaryTableEntry as createSimpleAuxiliaryTableEntryInRepository,
  findSimpleAuxiliaryTableEntryByCode,
  findSimpleAuxiliaryTableEntryById,
  listSimpleAuxiliaryTableEntries,
  setSimpleAuxiliaryTableEntryStatus as setSimpleAuxiliaryTableEntryStatusInRepository,
  updateSimpleAuxiliaryTableEntry as updateSimpleAuxiliaryTableEntryInRepository,
} from "../repositories/simpleAuxiliaryTablesRepository.js";

const simpleAuxiliaryTableDefinitions = {
  "indication-types": {
    tableName: "indication_types",
    codePrefix: "TI",
    entityName: "Tipo de indicacao",
    responseKey: "indicationTypes",
    itemKey: "indicationType",
  },
  "supplier-segments": {
    tableName: "supplier_segments",
    codePrefix: "SF",
    entityName: "Segmento de fornecedor",
    responseKey: "supplierSegments",
    itemKey: "supplierSegment",
  },
  "material-groups": {
    tableName: "material_groups",
    codePrefix: "GM",
    entityName: "Grupo de material",
    responseKey: "materialGroups",
    itemKey: "materialGroup",
  },
  occupations: {
    tableName: "client_occupations",
    codePrefix: "OC",
    entityName: "Ocupacao/profissao do cliente",
    responseKey: "occupations",
    itemKey: "occupation",
  },
};

function getDefinition(tableId) {
  const definition = simpleAuxiliaryTableDefinitions[tableId];
  if (definition) {
    return definition;
  }

  const error = new Error("Tabela auxiliar simples nao suportada.");
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

function toSimpleAuxiliaryRecord(row) {
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

async function generateCode(definition) {
  const rows = await listSimpleAuxiliaryTableEntries(definition.tableName);
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
  const existing = await findSimpleAuxiliaryTableEntryByCode(definition.tableName, candidate);

  if (existing && existing.id !== currentId) {
    const error = new Error(`Ja existe ${definition.entityName.toLowerCase()} com este codigo.`);
    error.statusCode = 409;
    throw error;
  }

  return candidate;
}

export async function listSimpleAuxiliaryEntries(tableId) {
  const definition = getDefinition(tableId);
  const rows = await listSimpleAuxiliaryTableEntries(definition.tableName);

  return {
    [definition.responseKey]: rows.map(toSimpleAuxiliaryRecord),
    total: rows.length,
  };
}

export async function createSimpleAuxiliaryEntry(tableId, payload) {
  const definition = getDefinition(tableId);
  const nome = normalizeRequiredName(payload.nome);
  if (!nome) {
    const error = new Error("Nome obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const codigo = await resolveUniqueCode(definition, payload.codigo);
  const descricao = normalizeOptionalText(payload.descricao);

  const created = await createSimpleAuxiliaryTableEntryInRepository(definition.tableName, {
    id: randomUUID(),
    code: codigo,
    name: nome,
    description: descricao,
  });

  return {
    [definition.itemKey]: toSimpleAuxiliaryRecord(created),
  };
}

export async function updateSimpleAuxiliaryEntry(tableId, id, payload) {
  const definition = getDefinition(tableId);
  const existing = await findSimpleAuxiliaryTableEntryById(definition.tableName, id);
  if (!existing) {
    const error = new Error(`${definition.entityName} nao encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  const nome = normalizeRequiredName(payload.nome);
  if (!nome) {
    const error = new Error("Nome obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const codigo = await resolveUniqueCode(definition, payload.codigo, id);
  const descricao = normalizeOptionalText(payload.descricao);

  const updated = await updateSimpleAuxiliaryTableEntryInRepository(definition.tableName, {
    id,
    code: codigo,
    name: nome,
    description: descricao,
  });

  return {
    [definition.itemKey]: toSimpleAuxiliaryRecord(updated),
  };
}

export async function setSimpleAuxiliaryEntryStatus(tableId, id, isActive) {
  const definition = getDefinition(tableId);
  const updated = await setSimpleAuxiliaryTableEntryStatusInRepository(definition.tableName, id, isActive);
  if (!updated) {
    const error = new Error(`${definition.entityName} nao encontrado.`);
    error.statusCode = 404;
    throw error;
  }

  return {
    [definition.itemKey]: toSimpleAuxiliaryRecord(updated),
  };
}
