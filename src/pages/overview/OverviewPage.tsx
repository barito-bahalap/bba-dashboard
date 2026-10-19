import type { CSSProperties } from "react";
// Hooks
import { useOverview, useSession, useTableQuery } from "@/hooks";
// Components
import { DataGrid, Panel, SectionHeader, StatCard } from "@/components";
import { formatDate, formatIdrShort } from "@/components/ui/format";
// Data
import { copy } from "@/data/copy";
import { OVERVIEW_COLUMNS } from "@/data/overview";
import { STATUS_TONES } from "@/data/tones";
// Utils
import { formatIdr } from "@barito-bahalap/utils";

interface ContractFin {
  id: string;
  reference: string;
  client_name: string;
  status: string;
  outstanding: number | string;
}

interface Receipt {
  id: string;
  received_on: string;
  amount_net: number | string;
  invoice_ref: string | null;
  contract_reference: string;
}

const pctVar = (n: number) => ({ "--pct": n }) as CSSProperties;
const clampPct = (received: number, net: number) =>
  net > 0 ? Math.min(100, Math.round((received / net) * 100)) : 0;

export default function OverviewPage() {
  const { profile } = useSession();
  const { rows, totals, loading, error } = useOverview();
  const contracts = useTableQuery<ContractFin>("v_contract_finance", {
    orderBy: "outstanding",
    ascending: false,
    limit: 20,
  });
  const receipts = useTableQuery<Receipt>("v_receipt_list", {
    orderBy: "received_on",
    ascending: false,
    limit: 5,
  });

  const canOpen = profile?.role !== "UNIT_MEMBER";
  const collection = clampPct(totals.received, totals.netContracted);
  const topOutstanding = contracts.rows
    .filter(
      (c) =>
        ["active", "completed"].includes(c.status) && Number(c.outstanding) > 0,
    )
    .slice(0, 5);
  const v = (n: number) => (loading ? "..." : formatIdrShort(n));

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.overview.eyebrow}
        title={copy.overview.title}
        intro={copy.overview.intro}
      />
      {error ? <p className="form-error">{error}</p> : null}

      <div className="stat-grid">
        <StatCard
          featured
          label="Net contracted"
          value={v(totals.netContracted)}
          title={formatIdr(totals.netContracted)}
          hint={`${totals.activeContracts} active contracts`}
          to={canOpen ? "/contracts" : undefined}
        />
        <StatCard
          label="Received"
          value={v(totals.received)}
          title={formatIdr(totals.received)}
          hint={`${collection}% of net contracted`}
          tone="positive"
          to={canOpen ? "/finance" : undefined}
        />
        <StatCard
          label="Outstanding"
          value={v(totals.outstanding)}
          title={formatIdr(totals.outstanding)}
          hint="Awaiting collection"
          tone="warning"
          to={canOpen ? "/contracts" : undefined}
        />
        <StatCard
          label="Expenses"
          value={v(totals.expenses)}
          title={formatIdr(totals.expenses)}
          hint="Across your divisions"
          to={canOpen ? "/finance" : undefined}
        />
      </div>

      <div className="ov-grid">
        <Panel title="Collection by division" className="span-5">
          {rows.length === 0 ? (
            <span className="muted">
              No data for your authorized divisions yet.
            </span>
          ) : (
            <div className="bars">
              {rows.map((r) => {
                const p = clampPct(
                  Number(r.received),
                  Number(r.net_contracted),
                );
                return (
                  <div className="bar" key={r.division}>
                    <span className="bar__pct">{p}%</span>
                    <div
                      className="bar__track"
                      role="img"
                      aria-label={`${r.division} collected ${p}%`}
                    >
                      <div className="bar__fill" style={pctVar(p)} />
                    </div>
                    <span className="bar__name">
                      {r.division.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Collection progress" className="span-3">
          <div className="donut">
            <div className="donut__ring" style={pctVar(collection)} />
            <div className="donut__label">
              <span className="donut__value">{collection}%</span>
              <span className="donut__cap">Collected</span>
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="legend__dot" />
              Received
            </span>
            <span>
              <i className="legend__dot legend__dot--soft" />
              Outstanding
            </span>
          </div>
        </Panel>

        <Panel title="Top outstanding" className="span-4">
          {topOutstanding.length === 0 ? (
            <span className="muted">Nothing outstanding.</span>
          ) : (
            <ul className="rows">
              {topOutstanding.map((c) => (
                <li className="row" key={c.id}>
                  <span className="row__main">
                    <span className="row__title">{c.client_name}</span>
                    <span className="row__sub">{c.reference}</span>
                  </span>
                  <span className="row__amount row__amount--warn">
                    {formatIdrShort(Number(c.outstanding))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Divisions" className="span-7">
          <DataGrid
            columns={OVERVIEW_COLUMNS}
            rows={rows as unknown as Record<string, unknown>[]}
            keyField="division"
            loading={loading}
            emptyTitle="No data for your authorized divisions yet."
            toneMap={STATUS_TONES}
          />
        </Panel>

        <Panel title="Recent receipts" className="span-5">
          {receipts.rows.length === 0 ? (
            <span className="muted">No receipts recorded yet.</span>
          ) : (
            <ul className="rows">
              {receipts.rows.map((r) => (
                <li className="row" key={r.id}>
                  <span className="row__main">
                    <span className="row__title">{r.contract_reference}</span>
                    <span className="row__sub">
                      {formatDate(r.received_on)}
                      {r.invoice_ref ? `, ${r.invoice_ref}` : ""}
                    </span>
                  </span>
                  <span className="row__amount">
                    {formatIdrShort(Number(r.amount_net))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
