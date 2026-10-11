import { useMutation } from "@tanstack/react-query";
// Lib
import { supabase } from "@barito-bahalap/supabase";

interface ChainRow {
  valid: boolean;
  first_bad_id: number | null;
}

export function useAuditChain() {
  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("verify_audit_chain");
      if (error) throw new Error(error.message);
      const row = ((data ?? [])[0] ?? {
        valid: true,
        first_bad_id: null,
      }) as ChainRow;
      return { valid: row.valid, firstBadId: row.first_bad_id };
    },
  });

  return {
    verify: mutation.mutate,
    checking: mutation.isPending,
    result: mutation.data ?? null,
    error: mutation.error ? mutation.error.message : null,
  };
}
