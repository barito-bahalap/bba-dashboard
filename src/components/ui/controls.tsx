import { type ButtonHTMLAttributes } from "react";
import "./ui.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: "primary" | "outline" | "ghost";
}

export function Button({
  label,
  variant = "primary",
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {label ?? children}
    </button>
  );
}
