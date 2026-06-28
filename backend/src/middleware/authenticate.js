import { verifyToken } from "../services/tokenService.js";

export async function authenticate(request, response) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Unauthorized" }));
    return null;
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    return verifyToken(token);
  } catch {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Invalid or expired token" }));
    return null;
  }
}
