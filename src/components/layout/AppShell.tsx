import { NavLink, Outlet } from "react-router-dom";
// Style
import "./AppShell.css";
// Hooks
import { useSession } from "@/hooks";
// Components
import { BrandMark, Button, Icon, type IconName } from "@/components/ui";
// Data
import { copy } from "@/data/copy";
import { ACTIVE_STAGE } from "@/data/config";
import { NAV_ITEMS, ROLE_LABELS } from "@/data/nav";

const ICONS: Record<string, IconName> = {
  "/": "grid",
  "/clients": "users",
  "/contracts": "file",
  "/projects": "folder",
  "/finance": "wallet",
  "/incentives": "award",
  "/people": "user",
  "/documents": "archive",
  "/audit": "shield",
};
const MAIN_PATHS = new Set([
  "/",
  "/clients",
  "/contracts",
  "/projects",
  "/finance",
]);

function initials(name?: string): string {
  const letters = (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  return letters || "?";
}

export function AppShell() {
  const { profile, signOut } = useSession();
  const items = NAV_ITEMS.filter(
    (item) =>
      item.stage <= ACTIVE_STAGE &&
      (!item.roles || (profile && item.roles.includes(profile.role))),
  );
  const main = items.filter((i) => MAIN_PATHS.has(i.to));
  const admin = items.filter((i) => !MAIN_PATHS.has(i.to));

  const group = (label: string, list: typeof items) =>
    list.length === 0 ? null : (
      <div className="shell__group">
        <span className="shell__group-label">{label}</span>
        <nav className="shell__nav" aria-label={label}>
          {list.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="shell__link"
            >
              <Icon name={ICONS[item.to] ?? "grid"} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    );

  return (
    <div className="shell">
      <aside className="shell__side">
        <div className="shell__brand">
          <BrandMark />
          <p className="shell__brand-name">{copy.appName}</p>
        </div>
        <div className="shell__groups">
          {group("Menu", main)}
          {group("Admin", admin)}
        </div>
        <div className="shell__note">
          <span className="shell__note-title">Internal system</span>
          <span className="shell__note-text">{copy.confidential}</span>
        </div>
      </aside>

      <div className="shell__body">
        <header className="shell__top">
          <span className="shell__crumb">{copy.appName}</span>
          <div className="shell__user">
            <span className="shell__avatar" aria-hidden="true">
              {initials(profile?.full_name)}
            </span>
            <span className="shell__who">
              <span className="shell__name">{profile?.full_name}</span>
              <span className="shell__role">
                {profile ? ROLE_LABELS[profile.role] : ""}
              </span>
            </span>
            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </header>
        <main className="shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
