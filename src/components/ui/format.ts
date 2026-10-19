const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "UTC",
});
const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});
const compactFmt = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatDate(v: unknown): string {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? String(v) : dateFmt.format(d);
}

export function formatDateTime(v: unknown): string {
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? String(v) : dateTimeFmt.format(d);
}

export function formatIdrShort(n: number): string {
  return `Rp ${compactFmt.format(n)}`;
}
