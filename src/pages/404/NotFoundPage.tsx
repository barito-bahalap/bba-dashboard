import { Link } from "react-router-dom";
// Style
import "./NotFoundPage.css";
// Components
import { EmptyState } from "@/components";
// Data
import { copy } from "@/data/copy";

export default function NotFoundPage() {
  return (
    <div className="page page--center">
      <EmptyState title={copy.notFound.title} sub={copy.notFound.sub} />
      <p>
        <Link to="/">Back to overview</Link>
      </p>
    </div>
  );
}
