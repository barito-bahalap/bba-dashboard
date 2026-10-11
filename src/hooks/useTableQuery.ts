import { useQuery } from "@tanstack/react-query";
// Lib
import { supabase } from "@barito-bahalap/supabase";

interface TableQueryOptions {
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}

export function useTableQuery<T>(
  table: string,
  options: TableQueryOptions = {},
) {
  const { select = "*", orderBy, ascending = true, limit } = options;

  const query = useQuery({
    queryKey: ["table", table, select, orderBy, ascending, limit],
    queryFn: async () => {
      let q = supabase.from(table).select(select);
      if (orderBy) q = q.order(orderBy, { ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as T[];
    },
  });

  return {
    rows: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
  };
}
