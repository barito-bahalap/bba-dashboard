import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
// Hooks
import { useSession } from "./useSession";
// Lib
import { supabase } from "@barito-bahalap/supabase";

interface MfaSetup {
  factorId: string | null;
  qrCode: string | null;
  secret: string | null;
}

export function useMfa() {
  const { status, refresh } = useSession();
  const [code, setCode] = useState("");
  const active = status === "needs_mfa_enroll" || status === "needs_mfa_verify";

  const setup = useQuery({
    queryKey: ["mfa-setup", status],
    enabled: active,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<MfaSetup> => {
      const { data: factors } = await supabase.auth.mfa.listFactors();

      if (status === "needs_mfa_verify") {
        return {
          factorId: factors?.totp?.[0]?.id ?? null,
          qrCode: null,
          secret: null,
        };
      }

      const stale = (factors?.all ?? []).filter(
        (f) => f.factor_type === "totp" && f.status === "unverified",
      );
      for (const f of stale) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (error || !data)
        throw new Error(error?.message ?? "Could not start enrollment.");
      return {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      };
    },
  });

  const verify = useMutation({
    mutationFn: async () => {
      const factorId = setup.data?.factorId;
      if (!factorId) throw new Error("No authenticator factor is available.");
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId,
        });
      if (challengeError || !challenge)
        throw new Error(challengeError?.message ?? "Challenge failed.");
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.trim(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => refresh(),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    verify.mutate();
  };

  const qrCode = setup.data?.qrCode ?? null;
  const secret = setup.data?.secret ?? null;

  return {
    status,
    enrollment: qrCode && secret ? { qrCode, secret } : null,
    code,
    setCode,
    error: verify.error?.message ?? setup.error?.message ?? null,
    submitting: verify.isPending,
    handleSubmit,
  };
}
