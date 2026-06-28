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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

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
    throw new Error(payload.error ?? "Falha ao autenticar.");
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
    throw new Error("Sessao invalida.");
  }

  const payload = await response.json();
  return payload.user;
}
