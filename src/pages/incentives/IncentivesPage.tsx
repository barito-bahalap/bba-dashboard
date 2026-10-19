// Style
import "./IncentivesPage.css";
// Hooks
import { useIncentives } from "@/hooks";
// Components
import { Button, DataGrid, StatusPill } from "@/components";
import { EmptyState, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { RULE_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function IncentivesPage() {
  const inc = useIncentives();

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.incentives.eyebrow}
        title={copy.incentives.title}
        intro={copy.incentives.intro}
      />
      {inc.error ? <p className="form-error">{inc.error}</p> : null}
      {inc.actionError ? <p className="form-error">{inc.actionError}</p> : null}
      {!inc.loading && inc.view.length === 0 ? (
        <EmptyState
          title="No rule sets"
          sub="Run the GOV-002 seed migration."
        />
      ) : null}
      {inc.view.map(({ set, components, approvals }) => {
        const approvedByMe = approvals.some((a) => a.profile_id === inc.myId);
        const ready = approvals.length >= set.required_approvals;
        return (
          <section key={set.id} className="rule-card">
            <div className="rule-card__head">
              <h2 className="rule-card__title">
                {set.division.toUpperCase()} {set.version}
              </h2>
              <StatusPill label={set.status} tone={STATUS_TONES[set.status]} />
            </div>
            <div className="rule-card__meta">
              <span>{set.source_document}</span>
              <span>
                Approvals {approvals.length} of {set.required_approvals}
              </span>
            </div>
            <DataGrid
              columns={RULE_COLUMNS}
              rows={components as unknown as Record<string, unknown>[]}
              keyField="id"
              toneMap={STATUS_TONES}
            />
            {set.status === "draft" ? (
              <div className="rule-card__actions">
                {inc.isFounder && !approvedByMe ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={inc.pending}
                    onClick={() => inc.approve(set.id)}
                  >
                    Approve as founder
                  </Button>
                ) : null}
                {inc.isMaster && ready ? (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={inc.pending}
                    onClick={() => inc.activate(set.id)}
                  >
                    Make effective
                  </Button>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
