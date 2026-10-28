// Roles of the admin area. The role is stored in the user's app_metadata and set only by the server (see docs/admin-mfa-plan.md).
export const ROLLEN = ['admin', 'mitarbeiter'] as const;
export type Rolle = (typeof ROLLEN)[number];

export function istAdminRolle(wert: unknown): wert is Rolle {
  return typeof wert === 'string' && (ROLLEN as readonly string[]).includes(wert);
}
