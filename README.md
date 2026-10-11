bba-dashboard -> internal hostname only (non-obvious, not indexed, not linked from any public site)

Purpose: BBA Company Control Plane for the Founder/CEO, Partners/Directors and Senior Staff. Finance, clients, projects, contracts, partner incentives (BBA-GOV-002), organization, document references and audit.

Phase 1 (this delivery): Supabase data layer in `supabase/migrations`.

Order of operations:

1. Create a NEW Supabase project, isolated from every client and public system. Never reuse the Telkom, corporate, tech or media projects.
2. Auth settings: disable public sign-ups, enable TOTP MFA, invite users only.
3. Run `0001` to `0005` in order in the SQL editor.
4. Create the four founder users, then insert their `profiles` rows (`is_founder = true`) and `profile_divisions`. Insert the first row via the SQL editor, since RLS blocks bootstrap.
5. Every table is restricted to sessions at `aal2`, so users must enrol MFA before any data is visible.
6. Rule sets seed as `draft`. They become `approved` only after four founder rows exist in `rule_set_approvals` (enforced by trigger). Verify the percentages against the signed GOV-002 first.

Design decisions:

- Data firewall: clients, contracts, projects, documents, expenses are scoped by `division` through `profile_divisions`. A person with no BBM membership cannot read BBM data, regardless of role.
- Founder/CEO role grants governance and finance control, not an editorial bypass. No table in this schema holds editorial content, by design.
- Net value is derived (`gross - tax withheld`). All percentages apply to net, as GOV-002 section XI requires.
- Incentive rules are versioned data, not code. Approved rule sets are immutable; changes need a new version and four founder approvals.
- Agency Margin is computed as the remainder, so rounding never leaks out of BBA.
- Payout is eligible only when cumulative receipts reach net value (`payout_status`). Warranty deductions reduce the responsible role's payable amount.
- Role allocations are visible to founders only, locked once agreed, and need all assignees to initial.
- `audit_log` is append-only with a hash chain. Only the Founder/CEO can read it.
- Documents are references (URL and code) only. No files are stored here.

Usage: `select * from compute_payout('<project uuid>');` and `select * from payout_status('<project uuid>');`
