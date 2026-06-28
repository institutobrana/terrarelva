import http from "node:http";

import { applyCors } from "./config/cors.js";
import { env } from "./config/env.js";
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
import { readJsonBody, sendJson } from "./utils/http.js";

const server = http.createServer(async (request, response) => {
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
