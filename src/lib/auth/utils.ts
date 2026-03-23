"use server";

import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

/**
 * Returns the current session user, or null if unauthenticated.
 * Safe to call from any Server Component or Server Action.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Throws a redirect to /auth/login if the user is not authenticated.
 * Use at the top of any Server Action that requires a logged-in user.
 *
 * @example
 * export async function createLead(data: LeadInput) {
 *   await requireAuth();
 *   // ... rest of action
 * }
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

/**
 * Requires the user to be authenticated AND have one of the allowed roles.
 * Redirects to /admin (403-equivalent) if the role is insufficient.
 *
 * @param allowedRoles - Array of roles that can proceed
 *
 * @example
 * export async function deleteProperty(id: string) {
 *   await withRole(["super_admin", "admin"]);
 *   // ... rest of action
 * }
 */
export async function withRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect("/admin?error=insufficient_permissions");
  }
  return user;
}

/**
 * Checks if the current user can perform admin-level mutations.
 * Returns false instead of redirecting — useful for conditional UI.
 */
export async function canManageProperties(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return ["super_admin", "admin"].includes(user.role);
}

/**
 * Checks if the current user is a super admin.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "super_admin";
}
