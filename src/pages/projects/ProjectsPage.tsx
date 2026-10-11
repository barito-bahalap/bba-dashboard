import { useNavigate } from "react-router-dom";
// Style
import "./ProjectsPage.css";
// Hooks
import { useTableQuery } from "@/hooks";
// Components
import { DataGrid, SectionHeader } from "@/components";
// Data
import { copy } from "@/data/copy";
import { PROJECT_COLUMNS } from "@/data/columns";
import { STATUS_TONES } from "@/data/tones";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { rows, loading, error } = useTableQuery<Record<string, unknown>>(
    "v_project_list",
    {
      orderBy: "name",
    },
  );

  return (
    <div className="page">
      <SectionHeader
        eyebrow={copy.projects.eyebrow}
        title={copy.projects.title}
        intro={copy.projects.intro}
      />
      <DataGrid
        columns={PROJECT_COLUMNS}
        rows={rows}
        keyField="id"
        loading={loading}
        error={error}
        toneMap={STATUS_TONES}
        onRowSelect={(row) => navigate(`/projects/${String(row.id)}`)}
      />
    </div>
  );
}
