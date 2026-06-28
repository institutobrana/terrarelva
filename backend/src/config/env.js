const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

function parseCorsOrigins(input) {
  return String(input ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const configuredCorsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);
const fallbackCorsOrigin = process.env.CORS_ORIGIN?.trim();

export const env = {
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  corsOrigins:
    configuredCorsOrigins.length > 0
      ? configuredCorsOrigins
      : fallbackCorsOrigin
        ? [fallbackCorsOrigin]
        : ["http://localhost:8080", "http://127.0.0.1:8080"],
};
