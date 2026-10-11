import type { GridColumn } from "@barito-bahalap/components";

export const OVERVIEW_COLUMNS: GridColumn[] = [
  { key: "division", header: "Division", kind: "pill" },
  { key: "active_clients", header: "Clients" },
  { key: "active_projects", header: "Projects" },
  { key: "net_contracted", header: "Net contracted", kind: "idr" },
  { key: "received", header: "Received", kind: "idr" },
  { key: "outstanding", header: "Outstanding", kind: "idr" },
  { key: "expenses", header: "Expenses", kind: "idr" },
];
