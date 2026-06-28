import { env } from "./env.js";

const allowedOrigins = new Set(env.corsOrigins);

export function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.has(origin);
}

export function applyCors(request, response) {
  const requestOrigin = request.headers.origin;

  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (!requestOrigin) {
    return true;
  }

  if (!isOriginAllowed(requestOrigin)) {
    return false;
  }

  response.setHeader("Access-Control-Allow-Origin", requestOrigin);
  return true;
}
