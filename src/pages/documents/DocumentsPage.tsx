// Style
import "./DocumentsPage.css";
// Hooks
import { useTableQuery } from "@/hooks";
// Components
import { DataGrid, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { DOCUMENT_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function DocumentsPage() {
  const { rows, loading, error } = useTableQuery<Record<string, unknown>>(
    "documents",
    { orderBy: "created_at", ascending: false },
  );

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.documents.eyebrow}
        title={copy.documents.title}
        intro={copy.documents.intro}
      />
      <DataGrid
        columns={DOCUMENT_COLUMNS}
        rows={rows}
        keyField="id"
        loading={loading}
        error={error}
        toneMap={STATUS_TONES}
      />
    </div>
  );
}
