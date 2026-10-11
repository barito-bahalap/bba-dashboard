// Style
import "./ContractsPage.css";
// Hooks
import { useTableQuery } from "@/hooks";
// Components
import { DataGrid, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { CONTRACT_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function ContractsPage() {
  const { rows, loading, error } = useTableQuery<Record<string, unknown>>(
    "v_contract_finance",
    { orderBy: "reference", ascending: true },
  );

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.contracts.eyebrow}
        title={copy.contracts.title}
        intro={copy.contracts.intro}
      />
      <DataGrid
        columns={CONTRACT_COLUMNS}
        rows={rows}
        keyField="id"
        loading={loading}
        error={error}
        toneMap={STATUS_TONES}
      />
    </div>
  );
}
