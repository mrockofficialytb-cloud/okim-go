export type AppRole = "USER" | "STAFF" | "ADMIN";

export function isAdmin(role?: string | null): role is "ADMIN" {
  return role === "ADMIN";
}

export function isStaffOrAdmin(role?: string | null): role is "STAFF" | "ADMIN" {
  return role === "STAFF" || role === "ADMIN";
}