import http from "node:http";

import { applyCors } from "./config/cors.js";
import { env } from "./config/env.js";
import { runMigrations } from "./db/runMigrations.js";
import { authenticate } from "./middleware/authenticate.js";
import { authenticateUser, getCurrentUser } from "./services/authService.js";
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

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Internal server error" });
  }
});

await runMigrations();

server.listen(env.port, env.host, () => {
  console.log(`Terra Relva backend listening on http://${env.host}:${env.port}`);
  console.log(`Allowed CORS origins: ${env.corsOrigins.join(", ")}`);
});
