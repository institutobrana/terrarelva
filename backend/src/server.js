import http from "node:http";

import { env } from "./config/env.js";
import { runMigrations } from "./db/runMigrations.js";
import { authenticate } from "./middleware/authenticate.js";
import { authenticateUser } from "./services/authService.js";
import { readJsonBody, sendJson } from "./utils/http.js";

const server = http.createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", env.corsOrigin);
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

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

      sendJson(response, 200, {
        user: {
          id: claims.sub,
          email: claims.email,
          role: claims.role,
        },
      });
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Internal server error" });
  }
});

await runMigrations();

server.listen(env.port, () => {
  console.log(`Terra Relva backend listening on port ${env.port}`);
});
