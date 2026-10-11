import { createContext } from "react";
import type { SessionValue } from "@/domain/types";

export const SessionContext = createContext<SessionValue | null>(null);
