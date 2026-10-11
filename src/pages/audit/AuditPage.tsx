// Style
import "./AuditPage.css";
// Hooks
import { useAuditChain, useTableQuery } from "@/hooks";
// Components
import { Button, DataGrid, SectionHeader, StatusPill } from "@/components";
// Data
import { copy } from "@/data/copy";
import { AUDIT_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function AuditPage() {
  const { rows, loading, error } =
    useTableQuery<Record<string, unknown>>("v_audit_recent");
  const chain = useAuditChain();

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.audit.eyebrow}
        title={copy.audit.title}
        intro={copy.audit.intro}
      />
      <div className="audit-check">
        <Button
          type="button"
          variant="outline"
          disabled={chain.checking}
          onClick={() => chain.verify()}
        >
          Verify hash chain
        </Button>
        {chain.result ? (
          <StatusPill
            label={
              chain.result.valid
                ? "Chain intact"
                : `Broken at record ${chain.result.firstBadId}`
            }
            tone={chain.result.valid ? "positive" : "negative"}
          />
        ) : null}
        {chain.error ? <span className="form-error">{chain.error}</span> : null}
      </div>
      <DataGrid
        columns={AUDIT_COLUMNS}
        rows={rows}
        keyField="id"
        loading={loading}
        error={error}
        toneMap={STATUS_TONES}
      />
    </div>
  );
}
