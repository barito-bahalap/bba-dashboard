import { useQuery } from "@tanstack/react-query";
// Lib
import { supabase } from "@barito-bahalap/supabase";
// Domain
import type { OverviewRow } from "@/domain/types";

export function useOverview() {
  const query = useQuery({
    queryKey: ["overview"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("dashboard_overview");
      if (error) throw new Error(error.message);
      return (data ?? []) as OverviewRow[];
    },
  });

  const rows = query.data ?? [];
  const sum = (key: keyof Omit<OverviewRow, "division">) =>
    rows.reduce((acc, r) => acc + Number(r[key] ?? 0), 0);

  return {
    rows,
    totals: {
      netContracted: sum("net_contracted"),
      received: sum("received"),
      outstanding: sum("outstanding"),
      expenses: sum("expenses"),
      activeContracts: sum("active_contracts"),
      activeClients: sum("active_clients"),
      activeProjects: sum("active_projects"),
    },
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
  };
}
