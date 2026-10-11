import { useContext } from "react";
import { SessionContext } from "@/contexts/session";
import type { SessionValue } from "@/domain/types";

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
