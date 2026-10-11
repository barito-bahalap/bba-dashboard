import { useQuery } from "@tanstack/react-query";
// Lib
import { supabase } from "@barito-bahalap/supabase";
// Domain
import type { PayoutLine, PayoutStatus } from "@/domain/types";

interface NameRow {
  id: string;
  full_name: string;
}

export function useProjectPayout(
  projectId: string | undefined,
  enabled: boolean,
) {
  const query = useQuery({
    queryKey: ["payout", projectId],
    enabled: enabled && Boolean(projectId),
    queryFn: async () => {
      const [status, lines, names] = await Promise.all([
        supabase.rpc("payout_status", { p_project: projectId }),
        supabase.rpc("compute_payout", { p_project: projectId }),
        supabase.from("profiles").select("id, full_name"),
      ]);
      if (lines.error) throw new Error(lines.error.message);
      if (status.error) throw new Error(status.error.message);
      const nameById = new Map(
        ((names.data ?? []) as NameRow[]).map((p) => [p.id, p.full_name]),
      );
      const rows = ((lines.data ?? []) as PayoutLine[]).map((l) => ({
        ...l,
        assignee_name: l.assignee_id
          ? (nameById.get(l.assignee_id) ?? "Unknown")
          : "BBA",
      }));
      return {
        status: ((status.data ?? [])[0] ?? null) as PayoutStatus | null,
        rows,
      };
    },
  });

  return {
    status: query.data?.status ?? null,
    rows: query.data?.rows ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
  };
}
