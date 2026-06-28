import crypto from "node:crypto";

import { env } from "../config/env.js";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function signToken(payload) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresInHours = Number.parseInt(env.jwtExpiresIn, 10);
  const exp = Number.isFinite(expiresInHours) ? nowInSeconds + expiresInHours * 3600 : nowInSeconds + 8 * 3600;
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, exp, iat: nowInSeconds };
  const unsignedToken = `${encode(header)}.${encode(body)}`;
  const signature = crypto.createHmac("sha256", env.jwtSecret).update(unsignedToken).digest("base64url");
  return `${unsignedToken}.${signature}`;
}

export function verifyToken(token) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    throw new Error("Invalid token format");
  }

  const unsignedToken = `${header}.${payload}`;
  const expectedSignature = crypto.createHmac("sha256", env.jwtSecret).update(unsignedToken).digest("base64url");
  const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!isValid) {
    throw new Error("Invalid token signature");
  }

  const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (decodedPayload.exp && decodedPayload.exp < nowInSeconds) {
    throw new Error("Token expired");
  }

  return decodedPayload;
}
