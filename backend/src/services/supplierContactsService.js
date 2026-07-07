import {
  createSupplier,
  createSupplierAddress,
  createSupplierEmail,
  createSupplierPhone,
  deleteSupplier,
  getSupplierById,
  replaceAndDeleteSupplier,
  updateSupplier,
} from "../repositories/supplierContactsRepository.js";
import { pool } from "../db/pool.js";

export async function getSupplierDetails(supplierId) {
  const supplier = await getSupplierById(supplierId);
  if (!supplier) {
    const error = new Error("Fornecedor nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return supplier;
}

export async function createSupplierRecord(payload) {
  return createSupplier(payload);
}

export async function updateSupplierRecord(supplierId, payload) {
  return updateSupplier(supplierId, payload);
}

export async function deleteSupplierRecord(supplierId) {
  return deleteSupplier(supplierId);
}

export async function checkDeleteSupplierRecord(supplierId) {
  const supplier = await pool.query(
    `SELECT id
     FROM suppliers
     WHERE id = $1
     LIMIT 1`,
    [supplierId],
  );

  if (!supplier.rows[0]) {
    const error = new Error("Fornecedor nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return {
    canDelete: true,
    usedIn: [],
  };
}

export async function replaceAndDeleteSupplierRecord(supplierId, replacementId) {
  return replaceAndDeleteSupplier(supplierId, replacementId);
}

export async function addSupplierAddress(supplierId, payload) {
  return createSupplierAddress(supplierId, payload);
}

export async function addSupplierPhone(supplierId, payload) {
  return createSupplierPhone(supplierId, payload);
}

export async function addSupplierEmail(supplierId, payload) {
  return createSupplierEmail(supplierId, payload);
}
