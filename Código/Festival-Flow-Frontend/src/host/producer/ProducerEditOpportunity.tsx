import { useNavigate, useParams } from "react-router-dom";
import ProducerGuard from "./ProducerGuard";
import OpportunityFormModal from "./OpportunityFormModal";

function ProducerEditOpportunity() {
  const navigate = useNavigate();
  const { opportunityId } = useParams<{ opportunityId: string }>();

  return (
    <ProducerGuard>
      <OpportunityFormModal
        mode="edit"
        opportunityId={opportunityId}
        onClose={() => navigate("/producer/opportunities")}
        onSaved={() => navigate("/producer/opportunities")}
      />
    </ProducerGuard>
  );
}

export default ProducerEditOpportunity;
