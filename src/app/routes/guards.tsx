import { Navigate, Outlet } from "react-router-dom";
// Hooks
import { useSession } from "@/hooks";
// Components
import { EmptyState } from "@/components";
// Data
import { copy } from "@/data/copy";
// Domain
import type { Role } from "@/domain/types";

export function ProtectedRoute() {
  const { status } = useSession();

  if (status === "loading") return <p className="splash">{copy.loading}</p>;
  if (status === "signed_out") return <Navigate to="/login" replace />;
  if (status === "needs_mfa_enroll" || status === "needs_mfa_verify")
    return <Navigate to="/mfa" replace />;
  if (status === "no_profile") {
    return (
      <div className="page page--center">
        <EmptyState
          title={copy.notProvisioned.title}
          sub={copy.notProvisioned.sub}
        />
      </div>
    );
  }
  return <Outlet />;
}

interface RoleGateProps {
  roles?: Role[];
  founderOnly?: boolean;
}

export function RoleGate({ roles, founderOnly }: RoleGateProps) {
  const { profile } = useSession();
  if (!profile) return <Navigate to="/login" replace />;
  const roleOk = !roles || roles.includes(profile.role);
  const founderOk = !founderOnly || profile.is_founder;
  if (!roleOk || !founderOk) {
    return (
      <div className="page">
        <EmptyState title={copy.restricted.title} sub={copy.restricted.sub} />
      </div>
    );
  }
  return <Outlet />;
}
