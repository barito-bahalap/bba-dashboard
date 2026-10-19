// Style
import "./BrandMark.css";
// Components
import { SmartLink } from "@/components";

interface BrandProps {
  onDark?: boolean;
  logo?: boolean;
  logoFull?: boolean;
}

const LOGO_SRC = {
  light: {
    icon: "/favicon.svg",
    full: "/favicon-alt.svg",
  },
  dark: {
    icon: "/favicon-inverted.svg",
    full: "/favicon-alt-inverted.svg",
  },
} as const;

export function BrandMark({
  onDark = false,
  logo = false,
  logoFull = false,
}: BrandProps) {
  if (logo) {
    const variant = onDark ? "dark" : "light";
    const type = logoFull ? "full" : "icon";

    return (
      <a href="/">
        <img
          src={LOGO_SRC[variant][type]}
          alt="BBA Logo"
          className={`brand__bba-logo${logoFull ? " brand__bba-logo--full" : ""}`}
        />
      </a>
    );
  }

  return (
    <SmartLink href="/" className={`brand${onDark ? " brand--on-dark" : ""}`}>
      <span className="brand__mark" aria-hidden="true">
        <span className="brand__dot" data-brand="tech" />
        <span className="brand__dot" data-brand="media" />
      </span>
    </SmartLink>
  );
}
