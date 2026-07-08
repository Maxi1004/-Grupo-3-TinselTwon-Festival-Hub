import { useNavigate } from "react-router-dom";
import ProducerGuard from "./ProducerGuard";
import ProjectFormModal from "./ProjectFormModal";

function ProducerCreateProject() {
  const navigate = useNavigate();

  return (
    <ProducerGuard>
      <ProjectFormModal
        mode="create"
        onClose={() => navigate("/producer/projects")}
        onSaved={() => navigate("/producer/projects")}
      />
    </ProducerGuard>
  );
}

export default ProducerCreateProject;
