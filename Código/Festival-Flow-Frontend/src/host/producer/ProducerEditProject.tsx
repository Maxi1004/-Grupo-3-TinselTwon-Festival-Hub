import { useNavigate, useParams } from "react-router-dom";
import ProducerGuard from "./ProducerGuard";
import ProjectFormModal from "./ProjectFormModal";

function ProducerEditProject() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <ProducerGuard>
      <ProjectFormModal
        mode="edit"
        projectId={projectId}
        onClose={() => navigate("/producer/projects")}
        onSaved={() => navigate("/producer/projects")}
      />
    </ProducerGuard>
  );
}

export default ProducerEditProject;
