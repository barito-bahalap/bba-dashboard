// Style
import "./OverviewPage.css";
// Hooks
import { useOverview } from "@/hooks";
// Components
import { DataGrid, SectionHeader, StatCard } from "@/components";
// Data
import { copy } from "@/data/copy";
import { OVERVIEW_COLUMNS } from "@/data/overview";
import { STATUS_TONES } from "@/data/tones";
// Utils
import { formatIdr } from "@barito-bahalap/utils";

export default function OverviewPage() {
  const { rows, totals, loading, error } = useOverview();

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.overview.eyebrow}
        title={copy.overview.title}
        intro={copy.overview.intro}
      />
      <div className="stat-grid">
        <StatCard
          label="Net contracted"
          value={formatIdr(totals.netContracted)}
          hint={`${totals.activeContracts} active contracts`}
        />
        <StatCard
          label="Received"
          value={formatIdr(totals.received)}
          tone="positive"
        />
        <StatCard
          label="Outstanding"
          value={formatIdr(totals.outstanding)}
          tone="warning"
        />
        <StatCard label="Expenses" value={formatIdr(totals.expenses)} />
        <StatCard label="Active clients" value={String(totals.activeClients)} />
        <StatCard
          label="Active projects"
          value={String(totals.activeProjects)}
        />
      </div>
      <div className="page__block">
        <DataGrid
          columns={OVERVIEW_COLUMNS}
          rows={rows as unknown as Record<string, unknown>[]}
          keyField="division"
          loading={loading}
          error={error}
          emptyTitle="No data for your authorized divisions yet."
          toneMap={STATUS_TONES}
        />
      </div>
    </div>
  );
}
