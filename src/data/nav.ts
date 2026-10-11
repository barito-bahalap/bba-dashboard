import type { Role } from "@/domain/types";

export interface NavItem {
  to: string;
  label: string;
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Overview" },
  { to: "/clients", label: "Clients" },
  { to: "/contracts", label: "Contracts" },
  { to: "/projects", label: "Projects" },
  { to: "/finance", label: "Finance" },
  {
    to: "/incentives",
    label: "Incentives",
    roles: ["founder_ceo", "partner_director"],
  },
  { to: "/people", label: "People" },
  { to: "/documents", label: "Documents" },
  { to: "/audit", label: "Audit", roles: ["founder_ceo"] },
];

export const ROLE_LABELS: Record<Role, string> = {
  founder_ceo: "Founder/CEO",
  partner_director: "Partner/Director",
  senior_staff: "Senior Staff",
};
