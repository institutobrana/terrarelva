import crypto from "node:crypto";

import {
  createUser,
  findUserByEmail,
  findUserById,
  updateLastLogin,
  updatePasswordHash,
} from "../repositories/usersRepository.js";
import { hashPassword, verifyPassword } from "./passwordService.js";
import { signToken } from "./tokenService.js";

function authValidationError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function authenticateUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !user.is_active) {
    return null;
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    return null;
  }

  await updateLastLogin(user.id);

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
    },
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user || !user.is_active) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
  };
}

export async function changeAuthenticatedUserPassword(userId, currentPassword, newPassword, confirmPassword) {
  const user = await findUserById(userId);

  if (!user || !user.is_active) {
    throw authValidationError("Usuario autenticado nao encontrado.", 404);
  }

  if (!currentPassword) {
    throw authValidationError("Informe a senha atual.");
  }

  if (!newPassword) {
    throw authValidationError("Informe a nova senha.");
  }

  if (!confirmPassword) {
    throw authValidationError("Confirme a nova senha.");
  }

  if (newPassword !== confirmPassword) {
    throw authValidationError("A confirmacao precisa ser igual a nova senha.");
  }

  const passwordMatches = await verifyPassword(currentPassword, user.password_hash);
  if (!passwordMatches) {
    throw authValidationError("Senha atual incorreta.", 401);
  }

  const nextPasswordHash = await hashPassword(newPassword);
  await updatePasswordHash(user.id, nextPasswordHash);

  return { success: true };
}

export async function bootstrapAdmin({ name, email, password, role = "admin" }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error("Admin user already exists for this email");
  }

  const passwordHash = await hashPassword(password);

  return createUser({
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    isActive: true,
  });
}
