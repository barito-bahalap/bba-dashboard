import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { PillTone } from "@barito-bahalap/components";
import "./ui.css";
import { Icon } from "./icons";

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: PillTone;
}) {
  return <span className={`pill pill--${tone}`}>{label}</span>;
}

export function EmptyState({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="empty">
      <strong className="empty__title">{title}</strong>
      {sub ? <span className="empty__sub">{sub}</span> : null}
    </div>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  as?: "h1" | "h2";
  id?: string;
  children?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  as = "h1",
  id,
  children,
}: SectionHeaderProps) {
  const Tag = as;
  return (
    <header className={`page-head${as === "h2" ? " page-head--sub" : ""}`}>
      <div>
        {eyebrow ? <span className="page-head__eyebrow">{eyebrow}</span> : null}
        <Tag id={id} className="page-head__title">
          {title}
        </Tag>
        {intro ? <span className="page-head__intro">{intro}</span> : null}
      </div>
      {children ? <div className="page-head__actions">{children}</div> : null}
    </header>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "positive" | "warning" | "negative" | "neutral";
  featured?: boolean;
  to?: string;
  title?: string;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  featured,
  to,
  title,
}: StatCardProps) {
  return (
    <div className={`stat${featured ? " stat--featured" : ""} stat--${tone}`}>
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        {to ? (
          <Link className="stat__arrow" to={to} aria-label={`Open ${label}`}>
            <Icon name="arrow" size={16} />
          </Link>
        ) : null}
      </div>
      <span className="stat__value" title={title}>
        {value}
      </span>
      {hint ? <span className="stat__hint">{hint}</span> : null}
    </div>
  );
}

export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`panel${className ? ` ${className}` : ""}`}>
      {title || action ? (
        <div className="panel__head">
          {title ? <h3 className="panel__title">{title}</h3> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}
