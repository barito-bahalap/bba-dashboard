import type { GridColumn } from "@barito-bahalap/components";

export const CLIENT_COLUMNS: GridColumn[] = [
  { key: "name", header: "Client" },
  { key: "division", header: "Division", kind: "pill" },
  { key: "segment", header: "Segment" },
  { key: "status", header: "Status", kind: "pill" },
  { key: "withholds_tax", header: "Withholds tax", kind: "bool" },
];

export const CONTRACT_COLUMNS: GridColumn[] = [
  { key: "reference", header: "Reference" },
  { key: "title", header: "Title" },
  { key: "client_name", header: "Client" },
  { key: "division", header: "Division", kind: "pill" },
  { key: "status", header: "Status", kind: "pill" },
  { key: "net_value", header: "Net value", kind: "idr" },
  { key: "received", header: "Received", kind: "idr" },
  { key: "outstanding", header: "Outstanding", kind: "idr" },
];

export const PROJECT_COLUMNS: GridColumn[] = [
  { key: "name", header: "Project" },
  { key: "client_name", header: "Client" },
  { key: "contract_reference", header: "Contract" },
  { key: "division", header: "Division", kind: "pill" },
  { key: "status", header: "Status", kind: "pill" },
  { key: "handed_over_on", header: "Handed over", kind: "date" },
  { key: "warranty_ends_on", header: "Warranty ends", kind: "date" },
];

export const PAYOUT_COLUMNS: GridColumn[] = [
  { key: "label", header: "Component" },
  { key: "kind", header: "Layer", kind: "pill" },
  { key: "pct", header: "Share", kind: "pct" },
  { key: "component_amount", header: "Component amount", kind: "idr" },
  { key: "assignee_name", header: "Assigned to" },
  { key: "share_pct", header: "Split", kind: "pct" },
  { key: "warranty_deduction", header: "Warranty deduction", kind: "idr" },
  { key: "payable_amount", header: "Payable", kind: "idr" },
];

export const RECEIPT_COLUMNS: GridColumn[] = [
  { key: "received_on", header: "Received", kind: "date" },
  { key: "contract_reference", header: "Contract" },
  { key: "division", header: "Division", kind: "pill" },
  { key: "invoice_ref", header: "Invoice" },
  { key: "amount_net", header: "Amount (net)", kind: "idr" },
];

export const EXPENSE_COLUMNS: GridColumn[] = [
  { key: "incurred_on", header: "Date", kind: "date" },
  { key: "division", header: "Division", kind: "pill" },
  { key: "category", header: "Category" },
  { key: "description", header: "Description" },
  { key: "amount", header: "Amount", kind: "idr" },
];

export const PEOPLE_COLUMNS: GridColumn[] = [
  { key: "full_name", header: "Name" },
  { key: "title", header: "Title" },
  { key: "role", header: "Role" },
  { key: "is_founder", header: "Founder", kind: "bool" },
  { key: "divisions", header: "Divisions" },
  { key: "active", header: "Active", kind: "bool" },
];

export const DOCUMENT_COLUMNS: GridColumn[] = [
  { key: "title", header: "Title" },
  { key: "doc_type", header: "Type" },
  { key: "division", header: "Division", kind: "pill" },
  { key: "reference_code", header: "Code" },
  { key: "confidential", header: "Confidential", kind: "bool" },
  { key: "external_url", header: "Source", kind: "link" },
];

export const AUDIT_COLUMNS: GridColumn[] = [
  { key: "occurred_at", header: "When", kind: "datetime" },
  { key: "actor_name", header: "Actor" },
  { key: "action", header: "Action", kind: "pill" },
  { key: "table_name", header: "Table" },
  { key: "row_id", header: "Record" },
];

export const RULE_COLUMNS: GridColumn[] = [
  { key: "label", header: "Component" },
  { key: "kind", header: "Layer", kind: "pill" },
  { key: "pct", header: "Share", kind: "pct" },
  { key: "min_net", header: "From net value", kind: "idr" },
  { key: "max_net", header: "Below net value", kind: "idr" },
];
