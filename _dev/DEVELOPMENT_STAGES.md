# BBA Dashboard: Development Stages

Staged plan for building the BBA internal dashboard. Each stage is useful on its own. A stage is finished only when its exit criteria are met. Do not start the next stage early.

Last updated: 19 Oct 2026

---

## 1. Principles

1. **Useful before complete.** Stage 1 must replace spreadsheets for money and commitments. Nothing more.
2. **One slice at a time.** Every slice is small enough to finish, deploy and use before the next begins.
3. **Manual input first.** Automate only after the manual process proves stable.
4. **Not a project-management tool, not a content tool.** The dashboard holds milestones, health and summaries. Task-level work stays in an existing tool. BBM content is written and maintained in the BBM system.
5. **No secrets stored.** Ownership, location and rotation dates only. Never passwords or keys.
6. **Every metric must lead to an action.** Remove tiles nobody would act on.
7. **Security is tested, not assumed.** Every RLS change ships with a test per role.

## 2. Stage overview

| Stage | Name                                     | Outcome                                                           | Status      |
| ----- | ---------------------------------------- | ----------------------------------------------------------------- | ----------- |
| 0     | Foundation alignment                     | Scaffold matches the four-role model and runs on clean data       | Not started |
| 1     | Money and commitments (MVP)              | One source of truth for clients, contracts, projects and payments | Not started |
| 2     | Forward visibility and recurring revenue | Pipeline, BBT retainers, alerts, profitability                    | Not started |
| 3     | Division operations                      | BBM read-only overview, capacity, documents, incentives           | Not started |
| 4     | Maturity                                 | Assets register, audit hardening, notifications, exports          | Not started |

## 3. Role model (applies to every stage)

| Role          | Scope                                                           |
| ------------- | --------------------------------------------------------------- |
| MASTER_ADMIN  | Everything                                                      |
| UNIT_ADMIN    | Everything that belongs to own division (BBT or BBM only)       |
| FINANCE_ADMIN | Finance, invoices, payments and related records only            |
| UNIT_MEMBER   | Assigned tasks, own allocation, own incentive (BBT or BBM only) |

---

## 4. Stage 0: Foundation alignment

**Goal:** Make sure the existing scaffold is a safe base before adding features.

**Tasks**

- [ ] App runs locally and deploys to Vercel from a clean checkout
- [ ] `.env` is git-ignored and `.env.example` lists every required variable
- [ ] Role model in the database (enum), RLS policies and `domain/types.ts` match the four roles above
- [ ] Division scoping (BBT, BBM) exists on every table where data belongs to a unit
- [ ] Decision made on shared records, for example a client served by both divisions
- [ ] Review migrations 0001 to 0006: keep, rewrite or drop. Treat the gov002 seed as sample data, kept apart from real data
- [ ] RLS tests: for each sensitive table and each role, one test for "can read" and one for "cannot read"
- [ ] Hide pages outside Stage 1 scope from navigation (hide, do not delete)

**Exit criteria**

- All four roles can log in with MFA and see only what the role model allows
- RLS tests pass
- A clean checkout deploys without manual fixes

---

## 5. Stage 1: Money and commitments (MVP)

**Goal:** The founder can answer three questions in five minutes: who owes us money, which contracts are expiring, which projects are late.

**Crucial scope, built in this order**

| Slice | Scope                     | Minimum fields or behavior                                                                                                                                              |
| ----- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1   | Auth and roles end to end | Login, MFA, session, role-based navigation, route guards                                                                                                                |
| 1.2   | Clients                   | Name, type (BUMN, BUMD, government, corporate, individual), contact person, division link, status                                                                       |
| 1.3   | Contracts                 | Client, division, type (project or retainer), value, start and end date, payment terms, status, renewal date, document link                                             |
| 1.4   | Projects                  | Contract link, division, assigned members, milestones with due dates, health status (on track, at risk, late), project detail page                                      |
| 1.5   | Finance (minimal)         | Invoice record (number, project or contract, amount, tax amounts as manual fields, issue date, due date, status), payment records, receivables aging. Manual entry only |
| 1.6   | Overview v1               | Booked, invoiced, collected, receivables outstanding and overdue, projects by health, contracts expiring within 60 days. Scoped by role                                 |
| 1.7   | Real data and trial use   | Load real data from current spreadsheets. Use the dashboard for the weekly money review                                                                                 |

**Explicitly not in Stage 1**

- Pipeline, retainer-specific view, capacity, documents module (link fields only), BBM overview
- Notifications, exports, tax computation, invoice PDF generation
- Changes to incentives. Existing incentive and payout pages stay as they are and are limited to MASTER_ADMIN until the formula is settled

**Exit criteria**

- RLS tests pass for all four roles, including division isolation between BBT and BBM
- Real clients, contracts, projects and invoices are loaded
- The founder uses the dashboard instead of spreadsheets for the weekly money review for two consecutive weeks
- Production deployment is live and MFA is enforced for admin roles

---

## 6. Stage 2: Forward visibility and recurring revenue

**Goal:** See what revenue is coming and what is at risk.

| Slice | Scope                      | Notes                                                                                                                                                                           |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1   | Pipeline                   | Stages: lead, proposal, negotiation, won, lost. Value, probability, decision-maker, next action, deadline, last activity. A won deal converts into client, contract and project |
| 2.2   | BBT retainers              | Monthly fee, scope covered, hours included vs used, out-of-scope requests with billing status, renewal date                                                                     |
| 2.3   | Overview v2                | Weighted pipeline, stalled deals, monthly recurring revenue, renewals due in 60 days, 30-day cash forecast                                                                      |
| 2.4   | Alerts v1                  | In-dashboard panel: expiring contracts, overdue invoices, stalled deals, overdue milestones. No email yet                                                                       |
| 2.5   | Expenses and profitability | Expenses, P&L per project and per division, shared overhead allocation                                                                                                          |

**Exit criteria**

- Pipeline is updated weekly by the people who own deals
- Retainer revenue and out-of-scope billing are tracked here, not in notes or chat
- The founder can state expected cash for the next 30 days from the dashboard

---

## 7. Stage 3: Division operations

**Goal:** Support day-to-day divisional management without duplicating other systems.

| Slice | Scope                  | Notes                                                                                                                                                                                                                            |
| ----- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1   | BBM read-only overview | Report view only. No writing or editing of content in the dashboard. Requires a defined data feed from the BBM system (see decision log). Suggested tiles: output volume, items awaiting approval, publication status, by client |
| 3.2   | People and capacity    | Allocation per project, utilization, freelancer and vendor register, cost rate                                                                                                                                                   |
| 3.3   | Documents              | Registry with version, owner and storage link for proposals, contracts, BAST and invoices                                                                                                                                        |
| 3.4   | Incentives             | Only after the rule set and approval authority are written down. Calculation, approval, payout history. UNIT_MEMBER sees own only                                                                                                |

**Exit criteria**

- BBM supervision works from the dashboard without opening the BBM system
- Utilization figures are trusted by division leads
- Incentive calculation matches the written rule set on a test month

---

## 8. Stage 4: Maturity

| Slice | Scope                                                                                                                |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| 4.1   | BBT assets register: domains, hosting, SSL expiry, repositories, credential ownership and rotation date (no secrets) |
| 4.2   | Audit hardening: chain verification, audit report export, retention policy                                           |
| 4.3   | Notifications by email or WhatsApp for alerts                                                                        |
| 4.4   | Reports and exports: PDF and CSV for finance and tender documentation                                                |
| 4.5   | Tax reporting support, only if invoice generation moves in-house                                                     |
| 4.6   | Re-evaluate parked items                                                                                             |

## 9. Parked (not planned)

| Item                                | Reason                                                       |
| ----------------------------------- | ------------------------------------------------------------ |
| Risk and compliance register        | Not needed in the early phase. Revisit at Stage 4            |
| Client-facing portal                | Adds an external attack surface. Revisit only if clients ask |
| Task-level project management       | Use an existing tool                                         |
| Content writing and editing for BBM | Lives in the BBM system                                      |
| Invoice PDF generation              | Depends on the invoicing decision below                      |
| Mobile app                          | Responsive web is enough                                     |

---

## 10. Decision log

| #   | Decision                                                                               | Needed before | Status | Default if undecided                                                                                                          |
| --- | -------------------------------------------------------------------------------------- | ------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| D1  | Who are the users in the first 3 months, and how many                                  | Stage 0       | Open   | Founder plus one admin per division plus finance                                                                              |
| D2  | How shared records (clients) are scoped across divisions                               | Stage 0       | Open   | Client is company-level. Projects and contracts carry the division. UNIT_ADMIN sees clients linked to own division's projects |
| D3  | What UNIT_ADMIN can see of own-division finance and incentives                         | Stage 0       | Open   | Finance: read-only for own division. Incentives: MASTER_ADMIN only until Stage 3                                              |
| D4  | Invoices generated in the dashboard or elsewhere                                       | Slice 1.5     | Open   | Elsewhere. Dashboard records them only                                                                                        |
| D5  | Separate P&L for BBT and BBM, and overhead allocation method                           | Slice 2.5     | Open   | Separate P&L, overhead allocated by revenue share                                                                             |
| D6  | How BBM data reaches the dashboard (shared database, read-only API, scheduled summary) | Slice 3.1     | Open   | Scheduled summary into a dedicated read-only table                                                                            |
| D7  | Incentive formula and approval authority                                               | Slice 3.4     | Open   | Module stays locked                                                                                                           |

## 11. Definition of done for every slice

- [ ] 3 to 5 acceptance criteria written before coding
- [ ] Migration with RLS policies
- [ ] RLS test for each role
- [ ] Types updated in `domain/types.ts`
- [ ] Data hook created, no direct database calls from page components
- [ ] Page has loading, empty and error states
- [ ] Route guard matches the role model
- [ ] Deployed and used with real or realistic data
- [ ] One line added to the progress log

## 12. Progress log

| Date | Slice | Note |
| ---- | ----- | ---- |
| ...  | ...   | ...  |
