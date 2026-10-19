import type { ReactNode } from "react";
import type { GridColumn, PillTone } from "@barito-bahalap/components";
import { formatIdr } from "@barito-bahalap/utils";
import "./ui.css";
import { EmptyState, StatusPill } from "./display";
import { formatDate, formatDateTime } from "./format";

interface DataGridProps {
  columns: GridColumn[];
  rows: Record<string, unknown>[];
  keyField: string;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  toneMap?: Record<string, PillTone>;
  onRowSelect?: (row: Record<string, unknown>) => void;
}

const NUMERIC = new Set(["idr", "pct"]);

function pillLabel(v: string): string {
  return ["bbt", "bbm", "bba"].includes(v)
    ? v.toUpperCase()
    : v.replace(/_/g, " ");
}

function renderCell(
  kind: string | undefined,
  v: unknown,
  toneMap?: Record<string, PillTone>,
): ReactNode {
  if (v === null || v === undefined || v === "")
    return <span className="grid__dash">-</span>;
  switch (kind) {
    case "idr":
      return formatIdr(Number(v));
    case "pct":
      return `${Number(v)}%`;
    case "date":
      return formatDate(v);
    case "datetime":
      return formatDateTime(v);
    case "bool":
      return (
        <span className={`flag${v ? " flag--on" : ""}`}>
          {v ? "Yes" : "No"}
        </span>
      );
    case "link": {
      const url = String(v);
      // Only http(s) links are clickable. Blocks javascript: and data: URLs.
      return /^https?:\/\//i.test(url) ? (
        <a href={url} target="_blank" rel="noreferrer noopener">
          Open
        </a>
      ) : (
        url
      );
    }
    case "pill": {
      const key = String(v);
      return (
        <StatusPill
          label={pillLabel(key)}
          tone={toneMap?.[key] ?? toneMap?.[key.toLowerCase()] ?? "neutral"}
        />
      );
    }
    default:
      return String(v);
  }
}

export function DataGrid({
  columns,
  rows,
  keyField,
  loading,
  error,
  emptyTitle = "No records yet.",
  toneMap,
  onRowSelect,
}: DataGridProps) {
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="grid-wrap">
      <table className="grid">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={
                  NUMERIC.has(String(c.kind)) ? "grid__num" : undefined
                }
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i}>
                  <td colSpan={columns.length}>
                    <div className="skeleton" style={{ height: "1.25rem" }} />
                  </td>
                </tr>
              ))
            : rows.map((row) => (
                <tr
                  key={String(row[keyField])}
                  className={onRowSelect ? "grid__row--click" : undefined}
                  tabIndex={onRowSelect ? 0 : undefined}
                  onClick={onRowSelect ? () => onRowSelect(row) : undefined}
                  onKeyDown={
                    onRowSelect
                      ? (e) => {
                          if (e.key === "Enter") onRowSelect(row);
                        }
                      : undefined
                  }
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={
                        NUMERIC.has(String(c.kind)) ? "grid__num" : undefined
                      }
                    >
                      {renderCell(
                        c.kind as string | undefined,
                        row[c.key],
                        toneMap,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 ? <EmptyState title={emptyTitle} /> : null}
    </div>
  );
}
