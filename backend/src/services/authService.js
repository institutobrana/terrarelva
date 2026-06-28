import crypto from "node:crypto";

import { createUser, findUserByEmail, findUserById, updateLastLogin } from "../repositories/usersRepository.js";
import { hashPassword, verifyPassword } from "./passwordService.js";
import { signToken } from "./tokenService.js";

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
