// Layout
import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/layout";
import { ProtectedRoute, RoleGate } from "./guards";
// Pages
import LoginPage from "@/pages/login/LoginPage";
import MfaPage from "@/pages/mfa/MfaPage";
import OverviewPage from "@/pages/overview/OverviewPage";
import ClientsPage from "@/pages/clients/ClientsPage";
import ContractsPage from "@/pages/contracts/ContractsPage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import IncentivesPage from "@/pages/incentives/IncentivesPage";
import FinancePage from "@/pages/finance/FinancePage";
import PeoplePage from "@/pages/people/PeoplePage";
import DocumentsPage from "@/pages/documents/DocumentsPage";
import AuditPage from "@/pages/audit/AuditPage";
import NotFoundPage from "@/pages/404/NotFoundPage";

export const appRoutes = [
  {
    element: <Outlet />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "mfa", element: <MfaPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <OverviewPage /> },
          { path: "clients", element: <ClientsPage /> },
          { path: "contracts", element: <ContractsPage /> },
          { path: "projects", element: <ProjectsPage /> },
          { path: "projects/:projectId", element: <ProjectDetailPage /> },
          { path: "finance", element: <FinancePage /> },
          { path: "people", element: <PeoplePage /> },
          { path: "documents", element: <DocumentsPage /> },
          {
            element: <RoleGate roles={["founder_ceo", "partner_director"]} />,
            children: [{ path: "incentives", element: <IncentivesPage /> }],
          },
          {
            element: <RoleGate roles={["founder_ceo"]} />,
            children: [{ path: "audit", element: <AuditPage /> }],
          },
        ],
      },
    ],
  },
  {
    element: <Outlet />,
    children: [{ path: "*", element: <NotFoundPage /> }],
  },
];
