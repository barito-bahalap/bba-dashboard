// Style
import "./PeoplePage.css";
// Hooks
import { useTableQuery } from "@/hooks";
// Components
import { DataGrid, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { PEOPLE_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function PeoplePage() {
  const { rows, loading, error } = useTableQuery<Record<string, unknown>>(
    "v_people",
    { orderBy: "full_name", ascending: true },
  );

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.people.eyebrow}
        title={copy.people.title}
        intro={copy.people.intro}
      />
      <DataGrid
        columns={PEOPLE_COLUMNS}
        rows={rows}
        keyField="id"
        loading={loading}
        error={error}
        toneMap={STATUS_TONES}
      />
    </div>
  );
}
