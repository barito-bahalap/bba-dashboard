// Style
import "./FinancePage.css";
// Hooks
import { useTableQuery } from "@/hooks";
// Components
import { DataGrid, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { EXPENSE_COLUMNS, RECEIPT_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function FinancePage() {
  const receipts = useTableQuery<Record<string, unknown>>("v_receipt_list", {
    orderBy: "received_on",
    ascending: false,
  });
  const expenses = useTableQuery<Record<string, unknown>>("expenses", {
    orderBy: "incurred_on",
    ascending: false,
  });

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.finance.eyebrow}
        title={copy.finance.title}
        intro={copy.finance.intro}
      />
      <div className="page__block">
        <SectionHeader as="h2" title="Receipts" />
        <DataGrid
          columns={RECEIPT_COLUMNS}
          rows={receipts.rows}
          keyField="id"
          loading={receipts.loading}
          error={receipts.error}
          toneMap={STATUS_TONES}
        />
      </div>
      <div className="page__block">
        <SectionHeader as="h2" title="Expenses" />
        <DataGrid
          columns={EXPENSE_COLUMNS}
          rows={expenses.rows}
          keyField="id"
          loading={expenses.loading}
          error={expenses.error}
          toneMap={STATUS_TONES}
        />
      </div>
    </div>
  );
}
