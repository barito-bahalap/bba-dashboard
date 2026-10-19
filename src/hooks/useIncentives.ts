import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Hooks
import { useSession } from "./useSession";
// Lib
import { supabase } from "@barito-bahalap/supabase";
// Domain
import type { RuleComponent, RuleSet, RuleSetApproval } from "@/domain/types";

export function useIncentives() {
  const { profile } = useSession();
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ["incentives"],
    queryFn: async () => {
      const [sets, components, approvals] = await Promise.all([
        supabase
          .from("rule_sets")
          .select("*")
          .order("division")
          .order("version"),
        supabase
          .from("rule_components")
          .select("*")
          .order("kind")
          .order("code"),
        supabase.from("rule_set_approvals").select("*"),
      ]);
      const failure = sets.error ?? components.error ?? approvals.error;
      if (failure) throw new Error(failure.message);
      return {
        sets: (sets.data ?? []) as RuleSet[],
        components: (components.data ?? []) as RuleComponent[],
        approvals: (approvals.data ?? []) as RuleSetApproval[],
      };
    },
  });

  const approve = useMutation({
    mutationFn: async (ruleSetId: string) => {
      const { error } = await supabase
        .from("rule_set_approvals")
        .insert({ rule_set_id: ruleSetId, profile_id: profile?.id });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["incentives"] }),
  });

  const activate = useMutation({
    mutationFn: async (ruleSetId: string) => {
      const { error } = await supabase
        .from("rule_sets")
        .update({
          status: "approved",
          effective_from: new Date().toISOString().slice(0, 10),
        })
        .eq("id", ruleSetId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["incentives"] }),
  });

  const data = query.data;
  const view = (data?.sets ?? []).map((set) => ({
    set,
    components: (data?.components ?? []).filter(
      (c) => c.rule_set_id === set.id,
    ),
    approvals: (data?.approvals ?? []).filter((a) => a.rule_set_id === set.id),
  }));

  return {
    view,
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    approve: approve.mutate,
    activate: activate.mutate,
    actionError: approve.error?.message ?? activate.error?.message ?? null,
    pending: approve.isPending || activate.isPending,
    isFounder: Boolean(profile?.is_founder),
    isMaster: profile?.role === "MASTER_ADMIN",
    myId: profile?.id ?? null,
  };
}
