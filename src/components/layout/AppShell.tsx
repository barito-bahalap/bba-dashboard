import { NavLink, Outlet } from "react-router-dom";
// Style
import "./AppShell.css";
// Hooks
import { useSession } from "@/hooks";
// Components
import { Button } from "@/components";
// Data
import { copy } from "@/data/copy";
import { ACTIVE_STAGE } from "@/data/config";
import { NAV_ITEMS, ROLE_LABELS } from "@/data/nav";

export function AppShell() {
  const { profile, signOut } = useSession();
  const items = NAV_ITEMS.filter(
    (item) =>
      item.stage <= ACTIVE_STAGE &&
      (!item.roles || (profile && item.roles.includes(profile.role))),
  );

  return (
    <div className="shell">
      <header className="shell__header">
        <p className="shell__brand">{copy.appName}</p>
        <div className="shell__user">
          <span className="shell__who">
            {profile?.full_name}
            <span className="shell__role">
              {profile ? ROLE_LABELS[profile.role] : ""}
            </span>
          </span>
          <Button type="button" variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </header>
      <nav className="shell__nav" aria-label="Modules">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="shell__link"
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="shell__main">
        <Outlet />
      </main>
      <footer className="shell__footer">{copy.confidential}</footer>
    </div>
  );
}
