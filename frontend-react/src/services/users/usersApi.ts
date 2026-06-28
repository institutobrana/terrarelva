import { getStoredToken } from "@/services/auth/authStorage";
import { getApiBaseUrl } from "@/services/auth/apiBase";

export type InternalUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UsersFilter = "active" | "inactive" | "all";

export type CreateInternalUserInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  isActive: boolean;
};

export class UsersApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UsersApiError";
    this.status = status;
  }
}

const API_BASE_URL = getApiBaseUrl();

function getAuthHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new UsersApiError("Sessao expirada.", 401);
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Falha ao processar requisicao." }));
    throw new UsersApiError(payload.error ?? "Falha ao processar requisicao.", response.status);
  }

  return response.json();
}

export async function fetchInternalUsers(filter: UsersFilter) {
  const response = await fetch(`${API_BASE_URL}/admin/users?status=${filter}`, {
    headers: getAuthHeaders(),
  });

  return parseResponse<{ users: InternalUser[]; total: number; appliedFilter: UsersFilter }>(response);
}

export async function createInternalUserRequest(input: CreateInternalUserInput) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  return parseResponse<{ user: InternalUser }>(response);
}

export async function updateInternalUserAccess(userId: string, isActive: boolean) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/access`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });

  return parseResponse<{ user: InternalUser }>(response);
}
