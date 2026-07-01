import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import Busboy from "busboy";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { applyCors } from "./config/cors.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { runMigrations } from "./db/runMigrations.js";
import { authenticate } from "./middleware/authenticate.js";
import {
  authenticateUser,
  changeAuthenticatedUserPassword,
  createInternalUser,
  ensureAdminRole,
  getCurrentUser,
  listInternalUsers,
  setInternalUserAccess,
} from "./services/authService.js";
import { createClient, getClientDetails, listClients } from "./services/clientsService.js";
import {
  createAppointmentAuxiliaryTableEntry,
  deleteAppointmentAuxiliaryTableEntry,
  listAppointmentAuxiliaryTable,
  setAppointmentAuxiliaryTableEntryStatus,
  updateAppointmentAuxiliaryTableEntry,
} from "./services/appointmentAuxiliaryTablesService.js";
import {
  createPaymentMethodEntry,
  deletePaymentMethodEntry,
  listPaymentMethods,
  setPaymentMethodStatus,
  updatePaymentMethodEntry,
} from "./services/paymentMethodsService.js";
import {
  createSimpleAuxiliaryEntry,
  deleteSimpleAuxiliaryEntry,
  listSimpleAuxiliaryEntries,
  setSimpleAuxiliaryEntryStatus,
  updateSimpleAuxiliaryEntry,
} from "./services/simpleAuxiliaryTablesService.js";
import { listSuppliers } from "./services/suppliersService.js";
import {
  checkDeleteSupplierRecord,
  createSupplierRecord,
  addSupplierAddress,
  addSupplierEmail,
  addSupplierPhone,
  deleteSupplierRecord,
  getSupplierDetails,
  replaceAndDeleteSupplierRecord,
  updateSupplierRecord,
} from "./services/supplierContactsService.js";
import { readJsonBody, sendJson } from "./utils/http.js";
import { setCurrentRequestPublicBaseUrl, toPublicUrl } from "./utils/publicUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, "../uploads");
const suppliersUploadsDirectory = path.join(uploadsDirectory, "fornecedores");

fs.mkdirSync(suppliersUploadsDirectory, { recursive: true });

function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function guessImageExtension(mimeType, originalFileName) {
  const originalExtension = path.extname(originalFileName || "").toLowerCase();
  if (originalExtension && originalExtension.length <= 5) {
    return originalExtension;
  }

  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "image/gif") return ".gif";
  return ".png";
}

async function saveSupplierImageUpload(supplierId, request) {
  const supplierExists = await pool.query(`SELECT id FROM suppliers WHERE id = $1 LIMIT 1`, [supplierId]);
  if (!supplierExists.rows[0]) {
    const error = new Error("Fornecedor nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.includes("multipart/form-data")) {
    const error = new Error("Content-Type invalido.");
    error.statusCode = 400;
    throw error;
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: request.headers });
    let storedPath = null;
    let storedFileName = null;

    busboy.on("file", (fieldName, fileStream, info) => {
      if (fieldName !== "image") {
        fileStream.resume();
        return;
      }

      const originalFileName = info.filename || "fornecedor";
      const safeBaseName = sanitizeFileName(path.basename(originalFileName, path.extname(originalFileName)));
      const extension = guessImageExtension(info.mimeType, originalFileName);
      storedFileName = `${supplierId}-${Date.now()}-${randomUUID()}-${safeBaseName}${extension}`;
      storedPath = storedFileName;
      const absolutePath = path.join(suppliersUploadsDirectory, storedFileName);
      const writeStream = fs.createWriteStream(absolutePath);

      fileStream.pipe(writeStream);
      writeStream.on("error", reject);
    });

    busboy.on("error", reject);
    busboy.on("finish", () => resolve({ storedPath, storedFileName }));
    request.pipe(busboy);
  });

  if (!uploadResult.storedPath) {
    const error = new Error("Arquivo de imagem nao encontrado.");
    error.statusCode = 400;
    throw error;
  }

  await pool.query(
    `UPDATE suppliers
     SET image_path = $2
     WHERE id = $1`,
    [supplierId, uploadResult.storedPath],
  );

  return {
    imagePath: uploadResult.storedPath,
    imageUrl: toPublicUrl(`/uploads/fornecedores/${uploadResult.storedPath}`),
    fileName: uploadResult.storedFileName,
  };
}

const ADM_MASTER_EMAIL = "gleissontel@gmail.com";

function ensureAdmMasterAccess(claims, response) {
  if (claims?.email !== ADM_MASTER_EMAIL) {
    sendJson(response, 403, { error: "Acesso negado" });
    return false;
  }

  return true;
}

async function buildAuxiliaryDeleteCheck(tableId, entryId) {
  const usedIn = [];

  if (tableId === "payment-methods") {
    return { canDelete: true, usedIn };
  }

  if (tableId === "indication-types") {
    return { canDelete: true, usedIn };
  }

  if (tableId === "supplier-segments") {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM suppliers
       WHERE segment_text IS NOT NULL
         AND LOWER(TRIM(segment_text)) = (
           SELECT LOWER(TRIM(name))
           FROM supplier_segments
           WHERE id = $1
           LIMIT 1
         )`,
      [entryId],
    );

    const count = result.rows[0]?.count ?? 0;
    if (count > 0) {
      return { canDelete: false, usedIn: ["suppliers"] };
    }

    return { canDelete: true, usedIn };
  }

  if (tableId === "material-groups") {
    return { canDelete: true, usedIn };
  }

  if (tableId === "occupations") {
    return { canDelete: true, usedIn };
  }

  if (tableId === "appointment-reasons") {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM appointments
       WHERE reason_id = $1`,
      [entryId],
    );

    if ((result.rows[0]?.count ?? 0) > 0) {
      return { canDelete: false, usedIn: ["appointments"] };
    }

    return { canDelete: true, usedIn };
  }

  if (tableId === "appointment-statuses") {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM appointments
       WHERE status_id = $1`,
      [entryId],
    );

    if ((result.rows[0]?.count ?? 0) > 0) {
      return { canDelete: false, usedIn: ["appointments"] };
    }

    return { canDelete: true, usedIn };
  }

  return { canDelete: false, usedIn: ["tabela nao suportada"] };
}

async function replaceAndDeleteAuxiliaryEntry(tableId, entryId, replacementId) {
  if (tableId !== "supplier-segments") {
    const result = await pool.query(`
      DELETE FROM ${tableId === "payment-methods" ? "payment_methods" : tableId === "indication-types" ? "indication_types" : tableId === "material-groups" ? "material_groups" : "client_occupations"}
      WHERE id = $1
      RETURNING id
    `, [entryId]);

    return { deleted: result.rowCount > 0 };
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sourceResult = await client.query(
      `SELECT id, name
       FROM supplier_segments
       WHERE id = $1
       LIMIT 1`,
      [entryId],
    );
    if (!sourceResult.rows[0]) {
      const error = new Error("Segmento de fornecedor nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const replacementResult = await client.query(
      `SELECT id, name
       FROM supplier_segments
       WHERE id = $1
       LIMIT 1`,
      [replacementId],
    );
    if (!replacementResult.rows[0]) {
      const error = new Error("Registro de substituicao nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    if (entryId === replacementId) {
      const error = new Error("O registro original e a substituicao nao podem ser iguais.");
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      `UPDATE suppliers
       SET segment_text = $2
       WHERE segment_text IS NOT NULL
         AND LOWER(TRIM(segment_text)) = LOWER(TRIM($1))`,
      [sourceResult.rows[0].name, replacementResult.rows[0].name],
    );

    const deleteResult = await client.query(
      `DELETE FROM supplier_segments
       WHERE id = $1`,
      [entryId],
    );

    await client.query("COMMIT");
    return { deleted: deleteResult.rowCount > 0 };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function replaceAndDeleteAppointmentAuxiliaryEntry(tableId, entryId, replacementId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const sourceTable = tableId === "appointment-reasons" ? "appointment_reasons" : "appointment_statuses";
    const sourceColumn = tableId === "appointment-reasons" ? "reason_id" : "status_id";

    const sourceResult = await client.query(
      `SELECT id
       FROM ${sourceTable}
       WHERE id = $1
       LIMIT 1`,
      [entryId],
    );
    if (!sourceResult.rows[0]) {
      const error = new Error(tableId === "appointment-reasons" ? "Motivo de agendamento nao encontrado." : "Situacao de agendamento nao encontrada.");
      error.statusCode = 404;
      throw error;
    }

    const replacementResult = await client.query(
      `SELECT id
       FROM ${sourceTable}
       WHERE id = $1
       LIMIT 1`,
      [replacementId],
    );
    if (!replacementResult.rows[0]) {
      const error = new Error("Registro de substituicao nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    if (entryId === replacementId) {
      const error = new Error("O registro original e a substituicao nao podem ser iguais.");
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      `UPDATE appointments
       SET ${sourceColumn} = $2
       WHERE ${sourceColumn} = $1`,
      [entryId, replacementId],
    );

    const deleteResult = await client.query(
      `DELETE FROM ${sourceTable}
       WHERE id = $1`,
      [entryId],
    );

    await client.query("COMMIT");
    return { deleted: deleteResult.rowCount > 0 };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

const server = http.createServer(async (request, response) => {
  const requestHost = request.headers.host ?? `${env.host}:${env.port}`;
  const requestProtocol = request.headers["x-forwarded-proto"]?.toString().split(",")[0]?.trim() || "http";
  setCurrentRequestPublicBaseUrl(`${requestProtocol}://${requestHost}`);
  const requestUrl = new URL(request.url, `${requestProtocol}://${requestHost}`);

  if (requestUrl.pathname.startsWith("/uploads/")) {
    try {
      const relativePath = requestUrl.pathname.replace("/uploads/", "");
      const possibleBases = [
        path.join(process.cwd(), "backend", "uploads"),
        path.join(process.cwd(), "uploads"),
        uploadsDirectory,
      ];
      const filePath = possibleBases
        .map((basePath) => path.join(basePath, relativePath))
        .find((candidatePath) => fs.existsSync(candidatePath));

      console.log("SERVINDO ARQUIVO:", filePath);

      if (!filePath || !fs.existsSync(filePath)) {
        console.log("ARQUIVO NÃO ENCONTRADO:", filePath);
        response.writeHead(404);
        response.end("Arquivo não encontrado");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
      };

      const contentType = contentTypes[ext] || "application/octet-stream";

      response.writeHead(200, { "Content-Type": contentType });
      fs.createReadStream(filePath).pipe(response);
      return;
    } catch (error) {
      console.error("Erro ao servir arquivo:", error);
      response.writeHead(500);
      response.end("Erro interno ao servir arquivo");
      return;
    }
  }

  const corsAllowed = applyCors(request, response);
  if (!corsAllowed) {
    sendJson(response, 403, { error: "Origin not allowed by CORS" });
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "POST" && request.url === "/auth/login") {
      const body = await readJsonBody(request);
      const email = typeof body.email === "string" ? body.email : "";
      const password = typeof body.password === "string" ? body.password : "";

      if (!email || !password) {
        sendJson(response, 400, { error: "Email and password are required" });
        return;
      }

      const session = await authenticateUser(email, password);
      if (!session) {
        sendJson(response, 401, { error: "Invalid credentials" });
        return;
      }

      sendJson(response, 200, session);
      return;
    }

    if (request.method === "GET" && request.url === "/auth/me") {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      const user = await getCurrentUser(claims.sub);
      if (!user) {
        sendJson(response, 401, { error: "Unauthorized" });
        return;
      }

      sendJson(response, 200, { user });
      return;
    }

    if (request.method === "POST" && request.url === "/auth/change-password") {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      const body = await readJsonBody(request);
      await changeAuthenticatedUserPassword(
        claims.sub,
        typeof body.currentPassword === "string" ? body.currentPassword : "",
        typeof body.newPassword === "string" ? body.newPassword : "",
        typeof body.confirmPassword === "string" ? body.confirmPassword : "",
      );

      sendJson(response, 200, { success: true });
      return;
    }

    if (request.url?.startsWith("/admin/clients")) {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      if (request.method === "GET" && request.url === "/admin/clients") {
        const payload = await listClients();
        sendJson(response, 200, payload);
        return;
      }

      const clientDetailMatch = requestUrl.pathname.match(/^\/admin\/clients\/([^/]+)$/);
      if (request.method === "GET" && clientDetailMatch) {
        const payload = await getClientDetails(clientDetailMatch[1]);
        sendJson(response, 200, payload);
        return;
      }

      if (request.method === "POST" && request.url === "/admin/clients") {
        const body = await readJsonBody(request);
        const client = await createClient({
          fullName: typeof body.fullName === "string" ? body.fullName : "",
          gender: typeof body.gender === "string" ? body.gender : null,
          birthDate: typeof body.birthDate === "string" ? body.birthDate : null,
          cpf: typeof body.cpf === "string" ? body.cpf : null,
          documentTypeText: typeof body.documentTypeText === "string" ? body.documentTypeText : null,
          documentNumber: typeof body.documentNumber === "string" ? body.documentNumber : null,
          responsibleName: typeof body.responsibleName === "string" ? body.responsibleName : null,
          statusText: typeof body.statusText === "string" ? body.statusText : "Ativo",
        });
        sendJson(response, 201, client);
        return;
      }
    }

    if (request.url?.startsWith("/admin/suppliers")) {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      if (request.method === "GET" && request.url === "/admin/suppliers") {
        const payload = await listSuppliers();
        sendJson(response, 200, payload);
        return;
      }

      if (request.method === "POST" && request.url === "/admin/suppliers") {
        const body = await readJsonBody(request);
        const supplier = await createSupplierRecord({
          tradeName: typeof body.tradeName === "string" ? body.tradeName : "",
          companyName: typeof body.companyName === "string" ? body.companyName : null,
          cpfCnpj: typeof body.cpfCnpj === "string" ? body.cpfCnpj : null,
          stateRegistration: typeof body.stateRegistration === "string" ? body.stateRegistration : null,
          website: typeof body.website === "string" ? body.website : null,
          segmentText: typeof body.segmentText === "string" ? body.segmentText : null,
          paymentDetails: typeof body.paymentDetails === "string" ? body.paymentDetails : null,
          notes: typeof body.notes === "string" ? body.notes : null,
          isActive: typeof body.isActive === "boolean" ? body.isActive : true,
          phones: Array.isArray(body.phones) ? body.phones : [],
          emails: Array.isArray(body.emails) ? body.emails : [],
        });
        sendJson(response, 201, { supplier });
        return;
      }

      const requestUrl = new URL(request.url, `http://${request.headers.host ?? `${env.host}:${env.port}`}`);
      const supplierDetailMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)$/);
      if (request.method === "PUT" && supplierDetailMatch) {
        const body = await readJsonBody(request);
        const supplier = await updateSupplierRecord(supplierDetailMatch[1], {
          tradeName: typeof body.tradeName === "string" ? body.tradeName : "",
          companyName: typeof body.companyName === "string" ? body.companyName : null,
          cpfCnpj: typeof body.cpfCnpj === "string" ? body.cpfCnpj : null,
          stateRegistration: typeof body.stateRegistration === "string" ? body.stateRegistration : null,
          website: typeof body.website === "string" ? body.website : null,
          segmentText: typeof body.segmentText === "string" ? body.segmentText : null,
          paymentDetails: typeof body.paymentDetails === "string" ? body.paymentDetails : null,
          notes: typeof body.notes === "string" ? body.notes : null,
          isActive: typeof body.isActive === "boolean" ? body.isActive : true,
          phones: Array.isArray(body.phones) ? body.phones : [],
          emails: Array.isArray(body.emails) ? body.emails : [],
        });
        sendJson(response, 200, { supplier });
        return;
      }
      if (request.method === "GET" && supplierDetailMatch) {
        const supplier = await getSupplierDetails(supplierDetailMatch[1]);
        sendJson(response, 200, { supplier });
        return;
      }

      const supplierDeleteCheckMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)\/delete-check$/);
      if (request.method === "GET" && supplierDeleteCheckMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }

        const payload = await checkDeleteSupplierRecord(supplierDeleteCheckMatch[1]);
        sendJson(response, 200, payload);
        return;
      }

      const supplierReplaceAndDeleteMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)\/replace-and-delete$/);
      if (request.method === "POST" && supplierReplaceAndDeleteMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }

        const body = await readJsonBody(request);
        const replacementId = typeof body.replacementId === "string" ? body.replacementId : "";
        if (!replacementId) {
          sendJson(response, 400, { error: "replacementId obrigatorio." });
          return;
        }

        await replaceAndDeleteSupplierRecord(supplierReplaceAndDeleteMatch[1], replacementId);
        sendJson(response, 200, { success: true });
        return;
      }

      const supplierImageUploadMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)\/upload-image$/);
      if (request.method === "POST" && supplierImageUploadMatch) {
        const payload = await saveSupplierImageUpload(supplierImageUploadMatch[1], request);
        sendJson(response, 200, payload);
        return;
      }

      const supplierDeleteMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)$/);
      if (request.method === "DELETE" && supplierDeleteMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }

        const deleted = await deleteSupplierRecord(supplierDeleteMatch[1]);
        sendJson(response, 200, { success: deleted });
        return;
      }

      const addressMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)\/addresses$/);
      if (request.method === "POST" && addressMatch) {
        const body = await readJsonBody(request);
        const address = await addSupplierAddress(addressMatch[1], {
          type: typeof body.type === "string" ? body.type : null,
          streetType: typeof body.streetType === "string" ? body.streetType : null,
          number: typeof body.number === "string" ? body.number : null,
          complement: typeof body.complement === "string" ? body.complement : null,
          neighborhood: typeof body.neighborhood === "string" ? body.neighborhood : null,
          city: typeof body.city === "string" ? body.city : null,
          state: typeof body.state === "string" ? body.state : null,
          zipCode: typeof body.zipCode === "string" ? body.zipCode : null,
          isMain: typeof body.isMain === "boolean" ? body.isMain : false,
        });
        sendJson(response, 201, { address });
        return;
      }

      const phoneMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)\/phones$/);
      if (request.method === "POST" && phoneMatch) {
        const body = await readJsonBody(request);
        const phone = await addSupplierPhone(phoneMatch[1], {
          type: typeof body.type === "string" ? body.type : null,
          ddd: typeof body.ddd === "string" ? body.ddd : null,
          phone: typeof body.phone === "string" ? body.phone : "",
          note: typeof body.note === "string" ? body.note : null,
          isMain: typeof body.isMain === "boolean" ? body.isMain : false,
        });
        sendJson(response, 201, { phone });
        return;
      }

      const emailMatch = requestUrl.pathname.match(/^\/admin\/suppliers\/([^/]+)\/emails$/);
      if (request.method === "POST" && emailMatch) {
        const body = await readJsonBody(request);
        const email = await addSupplierEmail(emailMatch[1], {
          type: typeof body.type === "string" ? body.type : null,
          email: typeof body.email === "string" ? body.email : "",
          isMain: typeof body.isMain === "boolean" ? body.isMain : false,
        });
        sendJson(response, 201, { email });
        return;
      }
    }

    if (request.url?.startsWith("/admin/users")) {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      ensureAdminRole(claims);

      const requestUrl = new URL(request.url, `http://${request.headers.host ?? `${env.host}:${env.port}`}`);

      if (request.method === "GET" && requestUrl.pathname === "/admin/users") {
        const status = requestUrl.searchParams.get("status") ?? "active";
        const payload = await listInternalUsers(status);
        sendJson(response, 200, payload);
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/admin/users") {
        const body = await readJsonBody(request);
        const user = await createInternalUser({
          name: typeof body.name === "string" ? body.name : "",
          email: typeof body.email === "string" ? body.email : "",
          password: typeof body.password === "string" ? body.password : "",
          confirmPassword: typeof body.confirmPassword === "string" ? body.confirmPassword : "",
          role: typeof body.role === "string" ? body.role : "operator",
          isActive: typeof body.isActive === "boolean" ? body.isActive : true,
        });

        sendJson(response, 201, { user });
        return;
      }

      const accessMatch = requestUrl.pathname.match(/^\/admin\/users\/([^/]+)\/access$/);
      if (request.method === "PATCH" && accessMatch) {
        const body = await readJsonBody(request);
        if (typeof body.isActive !== "boolean") {
          sendJson(response, 400, { error: "Campo isActive obrigatorio." });
          return;
        }

        const user = await setInternalUserAccess(accessMatch[1], body.isActive);
        sendJson(response, 200, { user });
        return;
      }
    }

    if (request.url?.startsWith("/admin/auxiliary-tables/payment-methods")) {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      const requestUrl = new URL(request.url, `http://${request.headers.host ?? `${env.host}:${env.port}`}`);

      if (request.method === "GET" && requestUrl.pathname === "/admin/auxiliary-tables/payment-methods") {
        const payload = await listPaymentMethods();
        sendJson(response, 200, payload);
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/admin/auxiliary-tables/payment-methods") {
        const body = await readJsonBody(request);
        const paymentMethod = await createPaymentMethodEntry({
          codigo: typeof body.codigo === "string" ? body.codigo : "",
          nome: typeof body.nome === "string" ? body.nome : "",
          descricao: typeof body.descricao === "string" ? body.descricao : "",
        });

        sendJson(response, 201, { paymentMethod });
        return;
      }

      const updateMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/payment-methods\/([^/]+)$/);
      if (request.method === "PUT" && updateMatch) {
        const body = await readJsonBody(request);
        const paymentMethod = await updatePaymentMethodEntry(updateMatch[1], {
          codigo: typeof body.codigo === "string" ? body.codigo : "",
          nome: typeof body.nome === "string" ? body.nome : "",
          descricao: typeof body.descricao === "string" ? body.descricao : "",
        });

        sendJson(response, 200, { paymentMethod });
        return;
      }

      const statusMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/payment-methods\/([^/]+)\/status$/);
      if (request.method === "PATCH" && statusMatch) {
        const body = await readJsonBody(request);
        const isActive = typeof body.isActive === "boolean"
          ? body.isActive
          : typeof body.ativo === "boolean"
            ? body.ativo
            : null;

        if (typeof isActive !== "boolean") {
          sendJson(response, 400, { error: "Campo isActive obrigatorio." });
          return;
        }

        const paymentMethod = await setPaymentMethodStatus(statusMatch[1], isActive);
        sendJson(response, 200, { paymentMethod });
        return;
      }

      const deleteCheckMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/payment-methods\/([^/]+)\/delete-check$/);
      if (request.method === "GET" && deleteCheckMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }
        const payload = await buildAuxiliaryDeleteCheck("payment-methods", deleteCheckMatch[1]);
        sendJson(response, 200, payload);
        return;
      }

      if (request.method === "DELETE" && updateMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }
        await deletePaymentMethodEntry(updateMatch[1]);
        sendJson(response, 200, { success: true });
        return;
      }
    }

    if (request.url?.startsWith("/admin/auxiliary-tables/")) {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      const requestUrl = new URL(request.url, `http://${request.headers.host ?? `${env.host}:${env.port}`}`);
      const collectionMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(appointment-reasons|appointment-statuses)$/);

      if (request.method === "GET" && collectionMatch) {
        const payload = await listAppointmentAuxiliaryTable(collectionMatch[1]);
        sendJson(response, 200, payload);
        return;
      }

      if (request.method === "POST" && collectionMatch) {
        const body = await readJsonBody(request);
        const payload = await createAppointmentAuxiliaryTableEntry(collectionMatch[1], body);
        sendJson(response, 201, payload);
        return;
      }

      const updateMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(appointment-reasons|appointment-statuses)\/([^/]+)$/);
      if (request.method === "PUT" && updateMatch) {
        const body = await readJsonBody(request);
        const payload = await updateAppointmentAuxiliaryTableEntry(updateMatch[1], updateMatch[2], body);
        sendJson(response, 200, payload);
        return;
      }

      const statusMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(appointment-reasons|appointment-statuses)\/([^/]+)\/status$/);
      if (request.method === "PATCH" && statusMatch) {
        const body = await readJsonBody(request);
        const isActive = typeof body.isActive === "boolean"
          ? body.isActive
          : typeof body.ativo === "boolean"
            ? body.ativo
            : null;

        if (typeof isActive !== "boolean") {
          sendJson(response, 400, { error: "Campo isActive obrigatorio." });
          return;
        }

        const payload = await setAppointmentAuxiliaryTableEntryStatus(statusMatch[1], statusMatch[2], isActive);
        sendJson(response, 200, payload);
        return;
      }

      const deleteCheckMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(appointment-reasons|appointment-statuses)\/([^/]+)\/delete-check$/);
      if (request.method === "GET" && deleteCheckMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }
        const payload = await buildAuxiliaryDeleteCheck(deleteCheckMatch[1], deleteCheckMatch[2]);
        sendJson(response, 200, payload);
        return;
      }

      const deleteMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(appointment-reasons|appointment-statuses)\/([^/]+)$/);
      if (request.method === "DELETE" && deleteMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }
        await deleteAppointmentAuxiliaryTableEntry(deleteMatch[1], deleteMatch[2]);
        sendJson(response, 200, { success: true });
        return;
      }

      const replaceAndDeleteMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(appointment-reasons|appointment-statuses)\/([^/]+)\/replace-and-delete$/);
      if (request.method === "POST" && replaceAndDeleteMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }

        const body = await readJsonBody(request);
        const replacementId = typeof body.replacementId === "string" ? body.replacementId : "";
        if (!replacementId) {
          sendJson(response, 400, { error: "replacementId obrigatorio." });
          return;
        }

        const payload = await replaceAndDeleteAppointmentAuxiliaryEntry(replaceAndDeleteMatch[1], replaceAndDeleteMatch[2], replacementId);
        sendJson(response, 200, { success: payload.deleted === true });
        return;
      }
    }

    if (request.url?.startsWith("/admin/auxiliary-tables/")) {
      const claims = await authenticate(request, response);
      if (!claims) {
        return;
      }

      const requestUrl = new URL(request.url, `http://${request.headers.host ?? `${env.host}:${env.port}`}`);
      const collectionMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(indication-types|supplier-segments|material-groups|occupations)$/);

      if (request.method === "GET" && collectionMatch) {
        const payload = await listSimpleAuxiliaryEntries(collectionMatch[1]);
        sendJson(response, 200, payload);
        return;
      }

      if (request.method === "POST" && collectionMatch) {
        const body = await readJsonBody(request);
        const payload = await createSimpleAuxiliaryEntry(collectionMatch[1], {
          codigo: typeof body.codigo === "string" ? body.codigo : "",
          nome: typeof body.nome === "string" ? body.nome : "",
          descricao: typeof body.descricao === "string" ? body.descricao : "",
        });

        sendJson(response, 201, payload);
        return;
      }

      const updateMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(indication-types|supplier-segments|material-groups|occupations)\/([^/]+)$/);
      if (request.method === "PUT" && updateMatch) {
        const body = await readJsonBody(request);
        const payload = await updateSimpleAuxiliaryEntry(updateMatch[1], updateMatch[2], {
          codigo: typeof body.codigo === "string" ? body.codigo : "",
          nome: typeof body.nome === "string" ? body.nome : "",
          descricao: typeof body.descricao === "string" ? body.descricao : "",
        });

        sendJson(response, 200, payload);
        return;
      }

      const statusMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(indication-types|supplier-segments|material-groups|occupations)\/([^/]+)\/status$/);
      if (request.method === "PATCH" && statusMatch) {
        const body = await readJsonBody(request);
        const isActive = typeof body.isActive === "boolean"
          ? body.isActive
          : typeof body.ativo === "boolean"
            ? body.ativo
            : null;

        if (typeof isActive !== "boolean") {
          sendJson(response, 400, { error: "Campo isActive obrigatorio." });
          return;
        }

        const payload = await setSimpleAuxiliaryEntryStatus(statusMatch[1], statusMatch[2], isActive);
        sendJson(response, 200, payload);
        return;
      }

      const deleteCheckMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(indication-types|supplier-segments|material-groups|occupations)\/([^/]+)\/delete-check$/);
      if (request.method === "GET" && deleteCheckMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }
        const payload = await buildAuxiliaryDeleteCheck(deleteCheckMatch[1], deleteCheckMatch[2]);
        sendJson(response, 200, payload);
        return;
      }

      const deleteMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(indication-types|supplier-segments|material-groups|occupations)\/([^/]+)$/);
      if (request.method === "DELETE" && deleteMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }
        await deleteSimpleAuxiliaryEntry(deleteMatch[1], deleteMatch[2]);
        sendJson(response, 200, { success: true });
        return;
      }

      const replaceAndDeleteMatch = requestUrl.pathname.match(/^\/admin\/auxiliary-tables\/(indication-types|supplier-segments|material-groups|occupations)\/([^/]+)\/replace-and-delete$/);
      if (request.method === "POST" && replaceAndDeleteMatch) {
        if (!ensureAdmMasterAccess(claims, response)) {
          return;
        }

        const body = await readJsonBody(request);
        const replacementId = typeof body.replacementId === "string" ? body.replacementId : "";
        if (!replacementId) {
          sendJson(response, 400, { error: "replacementId obrigatorio." });
          return;
        }

        if (replaceAndDeleteMatch[1] !== "supplier-segments") {
          const deleted = await deleteSimpleAuxiliaryEntry(replaceAndDeleteMatch[1], replaceAndDeleteMatch[2]);
          sendJson(response, 200, { success: Boolean(deleted) });
          return;
        }

        const payload = await replaceAndDeleteAuxiliaryEntry(replaceAndDeleteMatch[1], replaceAndDeleteMatch[2], replacementId);
        sendJson(response, 200, { success: payload.deleted === true });
        return;
      }
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 500;
    const message = statusCode >= 500 ? "Internal server error" : error.message;
    sendJson(response, statusCode, { error: message });
  }
});

await runMigrations();

server.listen(env.port, env.host, () => {
  console.log(`Terra Relva backend listening on http://${env.host}:${env.port}`);
  console.log(`Allowed CORS origins: ${env.corsOrigins.join(", ")}`);
});
