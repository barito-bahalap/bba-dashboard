import type { PillTone } from "@barito-bahalap/components";

export const STATUS_TONES: Record<string, PillTone> = {
  active: "positive",
  agreed: "positive",
  approved: "positive",
  completed: "positive",
  closed: "neutral",
  draft: "neutral",
  planned: "neutral",
  prospect: "neutral",
  handed_over: "warning",
  warranty: "warning",
  inactive: "negative",
  terminated: "negative",
  retired: "negative",
  bbt: "neutral",
  bbm: "neutral",
  bba: "neutral",
  INSERT: "positive",
  UPDATE: "warning",
  DELETE: "negative",
};
