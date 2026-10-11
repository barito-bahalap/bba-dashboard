// Style
import "./ClientsPage.css";
// Hooks
import { useTableQuery } from "@/hooks";
// Components
import { DataGrid, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { CLIENT_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function ClientsPage() {
  const { rows, loading, error } = useTableQuery<Record<string, unknown>>(
    "clients",
    { orderBy: "name", ascending: true },
  );

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.clients.eyebrow}
        title={copy.clients.title}
        intro={copy.clients.intro}
      />
      <DataGrid
        columns={CLIENT_COLUMNS}
        rows={rows}
        keyField="id"
        loading={loading}
        error={error}
        toneMap={STATUS_TONES}
      />
    </div>
  );
}
