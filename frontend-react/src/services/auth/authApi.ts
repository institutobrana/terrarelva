import { getApiBaseUrl } from "@/services/auth/apiBase";

export type AuthUser = {
  id: string;
  name?: string;
  email: string;
  role: string;
  isActive?: boolean;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const API_BASE_URL = getApiBaseUrl();

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Falha ao autenticar." }));
    throw new AuthApiError(payload.error ?? "Falha ao autenticar.", response.status);
  }

  return response.json();
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new AuthApiError("Sessao invalida.", response.status);
  }

  const payload = await response.json();
  return payload.user;
}
