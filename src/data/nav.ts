import type { Role } from "@/domain/types";

export interface NavItem {
  to: string;
  label: string;
  stage: number;
  roles?: Role[];
}

// Roles that may read clients, contracts, projects and finance (UNIT_MEMBER is excluded until slice 1.4)
export const ADMIN_ROLES: Role[] = [
  "MASTER_ADMIN",
  "UNIT_ADMIN",
  "FINANCE_ADMIN",
];

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Overview", stage: 1 },
  { to: "/clients", label: "Clients", stage: 1, roles: ADMIN_ROLES },
  { to: "/contracts", label: "Contracts", stage: 1, roles: ADMIN_ROLES },
  { to: "/projects", label: "Projects", stage: 1, roles: ADMIN_ROLES },
  { to: "/finance", label: "Finance", stage: 1, roles: ADMIN_ROLES },
  { to: "/incentives", label: "Incentives", stage: 3, roles: ["MASTER_ADMIN"] },
  {
    to: "/people",
    label: "People",
    stage: 3,
    roles: ["MASTER_ADMIN", "UNIT_ADMIN"],
  },
  { to: "/documents", label: "Documents", stage: 3, roles: ADMIN_ROLES },
  { to: "/audit", label: "Audit", stage: 1, roles: ["MASTER_ADMIN"] },
];

export const ROLE_LABELS: Record<Role, string> = {
  MASTER_ADMIN: "Master Admin",
  UNIT_ADMIN: "Unit Admin",
  FINANCE_ADMIN: "Finance Admin",
  UNIT_MEMBER: "Unit Member",
};
