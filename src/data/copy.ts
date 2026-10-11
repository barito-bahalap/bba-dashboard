export const copy = {
  appName: "BBA Control Plane",
  confidential: "Internal use only. Confidential. Access is logged.",
  loading: "Loading...",
  login: {
    eyebrow: "Internal system",
    title: "Sign in",
    intro:
      "Authorized personnel only. Multi-factor authentication is required for every session.",
    submit: "Continue",
    configMissing:
      "Supabase environment variables are not set. Copy .env.example to .env and fill both values.",
  },
  mfa: {
    enrollEyebrow: "Security setup",
    enrollTitle: "Enroll an authenticator app",
    enrollIntro:
      "Scan the code with an authenticator app, then enter the six digit code to finish. This is required before any data is shown.",
    verifyEyebrow: "Security check",
    verifyTitle: "Enter your code",
    verifyIntro:
      "Open your authenticator app and enter the current six digit code.",
    submit: "Verify",
  },
  notProvisioned: {
    title: "Account not provisioned",
    sub: "Your sign-in is valid but no active profile exists. Ask the Founder/CEO to provision your profile.",
  },
  restricted: {
    title: "Restricted",
    sub: "Your role does not have access to this module.",
  },
  overview: {
    eyebrow: "Executive",
    title: "Overview",
    intro:
      "Figures cover active and completed contracts, scoped to the divisions you are authorized for. All values are net of client tax withholding.",
  },
  clients: {
    eyebrow: "Relationships",
    title: "Clients",
    intro: "Client records are scoped by division.",
  },
  contracts: {
    eyebrow: "Commercial",
    title: "Contracts",
    intro: "Net value, receipts and outstanding balance per contract.",
  },
  projects: {
    eyebrow: "Delivery",
    title: "Projects",
    intro:
      "Select a project to review its settlement status and payout calculation.",
  },
  finance: {
    eyebrow: "Finance",
    title: "Receipts and expenses",
    intro: "Receipts are recorded net of tax withheld by the client.",
  },
  people: {
    eyebrow: "Organization",
    title: "People",
    intro: "Profiles, roles and division access.",
  },
  documents: {
    eyebrow: "Records",
    title: "Document register",
    intro:
      "Reference register only. Files are held in their source system; this register stores the title, code and link.",
  },
  incentives: {
    eyebrow: "BBA-GOV-002",
    title: "Incentive rules",
    intro:
      "Versioned rule sets. A rule set becomes effective only after approval by all required founders and is then immutable.",
  },
  audit: {
    eyebrow: "Control",
    title: "Audit log",
    intro:
      "Append-only record of every change, chained by hash. Visible to the Founder/CEO only.",
  },
  notFound: { title: "Page not found", sub: "This address does not exist." },
};
