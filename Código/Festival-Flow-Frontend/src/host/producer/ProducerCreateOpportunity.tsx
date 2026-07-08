import { useNavigate, useLocation } from "react-router-dom";
import ProducerGuard from "./ProducerGuard";
import OpportunityFormModal from "./OpportunityFormModal";

function ProducerCreateOpportunity() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialProjectId = (location.state as { projectId?: string } | null)?.projectId;

  return (
    <ProducerGuard>
      <OpportunityFormModal
        mode="create"
        initialProjectId={initialProjectId}
        onClose={() => navigate("/producer/opportunities")}
        onSaved={(createdOpportunity) =>
          navigate("/producer/opportunities", { state: { createdOpportunity } })
        }
      />
    </ProducerGuard>
  );
}

export default ProducerCreateOpportunity;
