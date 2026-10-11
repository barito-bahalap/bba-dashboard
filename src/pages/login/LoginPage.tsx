import { Navigate } from "react-router-dom";
// Hooks
import { useLogin, useSession } from "@/hooks";
// Components
import { Button, Input, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";

export default function LoginPage() {
  const { status } = useSession();
  const login = useLogin();

  if (status === "ready") return <Navigate to="/" replace />;
  if (status === "needs_mfa_enroll" || status === "needs_mfa_verify") {
    return <Navigate to="/mfa" replace />;
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <SectionHeader
          eyebrow={copy.login.eyebrow}
          title={copy.login.title}
          intro={copy.login.intro}
        />

        <form className="auth__form" onSubmit={login.handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={login.email}
            onChange={(e) => login.setEmail(e.target.value)}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={login.password}
            onChange={(e) => login.setPassword(e.target.value)}
            obscurial
          />

          {login.error ? <p className="form-error">{login.error}</p> : null}

          <Button
            label={copy.login.submit}
            type="submit"
            variant="primary"
            disabled={login.submitting}
          />
        </form>
      </div>
    </div>
  );
}
