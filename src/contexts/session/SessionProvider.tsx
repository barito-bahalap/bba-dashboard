import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
// Lib
import { supabase } from "@barito-bahalap/supabase";
// Data
import { IDLE_TIMEOUT_MS } from "@/data/config";
// Domain
import type { Profile, SessionState, SessionValue } from "@/domain/types";
import { SessionContext } from "./SessionContext";

const INITIAL: SessionState = { status: "loading", profile: null, email: null };
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll"] as const;

async function resolveState(session: Session | null): Promise<SessionState> {
  if (!session) return { status: "signed_out", profile: null, email: null };
  const email = session.user.email ?? null;

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    const status = aal?.nextLevel === "aal2" ? "needs_mfa_verify" : "needs_mfa_enroll";
    return { status, profile: null, email };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_founder, title, active")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile || !profile.active) return { status: "no_profile", profile: null, email };
  return { status: "ready", profile: profile as Profile, email };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(INITIAL);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setState(await resolveState(data.session));
  }, []);

  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setState({ status: "signed_out", profile: null, email: null });
        return;
      }
      setTimeout(() => {
        void resolveState(session).then(setState);
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ status: "signed_out", profile: null, email: null });
  }, []);

  useEffect(() => {
    if (state.status !== "ready") return;
    let timer = window.setTimeout(() => void signOut(), IDLE_TIMEOUT_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void signOut(), IDLE_TIMEOUT_MS);
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [state.status, signOut]);

  const value = useMemo<SessionValue>(
    () => ({ ...state, signIn, signOut, refresh }),
    [state, signIn, signOut, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
