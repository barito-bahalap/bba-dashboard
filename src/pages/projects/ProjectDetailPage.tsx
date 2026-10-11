import { Link, useParams } from "react-router-dom";
// Style
import "./ProjectDetailPage.css";
// Hooks
import { useProjectPayout, useSession } from "@/hooks";
// Components
import { DataGrid, EmptyState, SectionHeader, StatCard } from "@/components";
// Data
import { PAYOUT_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";
import { payoutCopy } from "@/data/payout";
// Utils
import { formatIdr } from "@barito-bahalap/utils";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { profile } = useSession();
  const isFounder = Boolean(profile?.is_founder);
  const payout = useProjectPayout(projectId, isFounder);

  return (
    <div className="page">
      <SectionHeader
        eyebrow={payoutCopy.eyebrow}
        title={payoutCopy.title}
        intro={payoutCopy.intro}
      />
      <p>
        <Link to="/projects">Back to projects</Link>
      </p>
      {!isFounder ? (
        <EmptyState
          title={payoutCopy.restrictedTitle}
          sub={payoutCopy.restrictedSub}
        />
      ) : (
        <>
          {payout.status ? (
            <div className="stat-grid">
              <StatCard
                label="Net contract value"
                value={formatIdr(Number(payout.status.net_value))}
              />
              <StatCard
                label="Received"
                value={formatIdr(Number(payout.status.received))}
                tone="positive"
              />
              <StatCard
                label="Payout eligibility"
                value={payout.status.settled ? "Settled" : "Pending settlement"}
                hint={payoutCopy.eligibilityHint}
                tone={payout.status.settled ? "positive" : "warning"}
              />
            </div>
          ) : null}
          <DataGrid
            columns={PAYOUT_COLUMNS}
            rows={payout.rows as unknown as Record<string, unknown>[]}
            keyField="component_code"
            loading={payout.loading}
            error={payout.error}
            emptyTitle={payoutCopy.empty}
            toneMap={STATUS_TONES}
          />
        </>
      )}
    </div>
  );
}
