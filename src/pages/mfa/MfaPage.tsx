import { Navigate } from "react-router-dom";
// Style
import "./MfaPage.css";
// Hooks
import { useMfa, useSession } from "@/hooks";
// Components
import { Button, Input, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { MFA_CODE_LENGTH } from "@/data/config";

export default function MfaPage() {
  const { signOut } = useSession();
  const mfa = useMfa();

  if (mfa.status === "ready" || mfa.status === "no_profile")
    return <Navigate to="/" replace />;
  if (mfa.status === "signed_out") return <Navigate to="/login" replace />;

  const enrolling = mfa.status === "needs_mfa_enroll";

  return (
    <div className="auth">
      <div className="auth__card">
        <SectionHeader
          eyebrow={enrolling ? copy.mfa.enrollEyebrow : copy.mfa.verifyEyebrow}
          title={enrolling ? copy.mfa.enrollTitle : copy.mfa.verifyTitle}
          intro={enrolling ? copy.mfa.enrollIntro : copy.mfa.verifyIntro}
        />
        {enrolling && mfa.enrollment ? (
          <>
            <img
              className="auth__qr"
              src={mfa.enrollment.qrCode}
              alt="Authenticator enrollment code"
            />
            <p className="auth__secret">{mfa.enrollment.secret}</p>
          </>
        ) : null}
        <form className="auth__form" onSubmit={mfa.handleSubmit}>
          <Input
            id="code"
            label="Authentication code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={MFA_CODE_LENGTH}
            required
            value={mfa.code}
            onChange={(e) => mfa.setCode(e.target.value.replace(/\D/g, ""))}
          />
          {mfa.error ? <p className="form-error">{mfa.error}</p> : null}
          <Button
            type="submit"
            variant="primary"
            disabled={mfa.submitting || mfa.code.length !== MFA_CODE_LENGTH}
          >
            {copy.mfa.submit}
          </Button>
          <Button type="button" variant="ghost" onClick={() => void signOut()}>
            Cancel and sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
