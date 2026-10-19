export type Role =
  | "MASTER_ADMIN"
  | "UNIT_ADMIN"
  | "FINANCE_ADMIN"
  | "UNIT_MEMBER";

export type Division = "bbt" | "bbm" | "bba";

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  is_founder: boolean;
  title: string | null;
  active: boolean;
}

export type SessionStatus =
  | "loading"
  | "signed_out"
  | "needs_mfa_enroll"
  | "needs_mfa_verify"
  | "no_profile"
  | "ready";

export interface SessionState {
  status: SessionStatus;
  profile: Profile | null;
  email: string | null;
}

export interface SessionValue extends SessionState {
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface OverviewRow {
  division: Division;
  active_contracts: number;
  net_contracted: number;
  received: number;
  outstanding: number;
  active_clients: number;
  active_projects: number;
  expenses: number;
}

export interface PayoutLine {
  component_code: string;
  label: string;
  kind: "bd" | "oversight" | "execution" | "margin";
  pct: number;
  component_amount: number;
  assignee_id: string | null;
  share_pct: number;
  gross_amount: number;
  warranty_deduction: number;
  payable_amount: number;
}

export interface PayoutStatus {
  net_value: number;
  received: number;
  settled: boolean;
}

export interface RuleSet {
  id: string;
  division: Division;
  version: string;
  status: "draft" | "approved" | "retired";
  required_approvals: number;
  source_document: string;
}

export interface RuleComponent {
  id: string;
  rule_set_id: string;
  code: string;
  label: string;
  kind: string;
  pct: number;
  min_net: number | null;
  max_net: number | null;
}

export interface RuleSetApproval {
  rule_set_id: string;
  profile_id: string;
}
