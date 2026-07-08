import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { getMyProjects } from "../../service/projectApi";
import {
  createOpportunity,
  getOpportunityById,
  updateOpportunity,
} from "../../service/opportunityApi";
import { reusePendingRequest } from "../../service/pendingRequest";
import { useCurrentProfile } from "../useCurrentProfile";
import {
  OPPORTUNITY_MODALITY_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
} from "../../types/producer";
import type { Opportunity, Project } from "../../types/producer";
import {
  normalizeOpportunityFormData,
  requirementsToTextarea,
  toDateInputValue,
  toVisibleStatusAction,
} from "./utils";
import { useAutoTranslate, useFestivalFlowLanguage } from "../../hooks/useAutoTranslate";
import "../../styles/producer.css";

type OpportunityFormState = {
  project_id: string;
  title: string;
  role_needed: string;
  specialty: string;
  description: string;
  location: string;
  modality: string;
  requirements: string;
  status: string;
  deadline: string;
};

const initialFormState: OpportunityFormState = {
  project_id: "",
  title: "",
  role_needed: "",
  specialty: "",
  description: "",
  location: "",
  modality: "REMOTE",
  requirements: "",
  status: "ACTIVE",
  deadline: "",
};

const MODALITY_LABELS: Record<string, string> = {
  REMOTE: "Remota",
  ONSITE: "Presencial",
  HYBRID: "Híbrida",
  FLEXIBLE: "Flexible",
};

const opportunityFormModalBaseTexts = [
  "No se pudieron cargar tus proyectos.",
  "No se pudo cargar la convocatoria.",
  "No se encontro la convocatoria solicitada.",
  "No se pudo crear la convocatoria.",
  "No se pudo actualizar la convocatoria.",
  "Cargando...",
  "Nueva convocatoria",
  "Crear oportunidad",
  "Publica una convocatoria conectada a uno de tus proyectos reales.",
  "Editar convocatoria",
  "Actualiza la oportunidad",
  "Ajusta los datos del rol requerido y el estado de la convocatoria.",
  "Cerrar",
  "Necesitas al menos un proyecto para crear una convocatoria.",
  "Crear proyecto primero",
  "Proyecto",
  "Titulo",
  "Rol requerido",
  "Director de fotografia",
  "Especialidad",
  "Cine documental",
  "Ubicacion",
  "Modalidad",
  "Remota",
  "Presencial",
  "Híbrida",
  "Flexible",
  "Estado",
  "Iniciar",
  "Deadline",
  "Descripcion",
  "Requisitos",
  "Uno por linea o separados por comas",
  "Cancelar",
  "Creando...",
  "Crear convocatoria",
  "Guardando...",
  "Guardar cambios",
];

type OpportunityFormModalProps = {
  mode: "create" | "edit";
  opportunityId?: string;
  initialProjectId?: string;
  onClose: () => void;
  onSaved: (opportunity: Opportunity) => void;
};

function OpportunityFormModal({
  mode,
  opportunityId,
  initialProjectId,
  onClose,
  onSaved,
}: OpportunityFormModalProps) {
  const navigate = useNavigate();
  const { token } = useCurrentProfile();
  const language = useFestivalFlowLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<OpportunityFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const translationTexts = [
    ...opportunityFormModalBaseTexts,
    ...projects.map((project) => project.title),
  ];
  const { tAuto } = useAutoTranslate(translationTexts, language, token);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");

        const [nextProjects, opportunity] = await reusePendingRequest(
          `producer-opportunity-form:${mode}:${opportunityId}:${token}`,
          () =>
            Promise.all([
              getMyProjects(token ?? undefined),
              mode === "edit" && opportunityId
                ? getOpportunityById(opportunityId, token ?? undefined)
                : Promise.resolve(null),
            ])
        );

        if (!isMounted) {
          return;
        }

        setProjects(nextProjects);

        if (opportunity) {
          setFormData({
            project_id: opportunity.project_id ?? nextProjects[0]?.id ?? "",
            title: opportunity.title ?? "",
            role_needed: opportunity.role_needed ?? "",
            specialty: opportunity.specialty ?? "",
            description: opportunity.description ?? "",
            location: opportunity.location ?? "",
            modality: opportunity.modality ?? "REMOTE",
            requirements: requirementsToTextarea(opportunity.requirements),
            status: toVisibleStatusAction(opportunity.status),
            deadline: toDateInputValue(opportunity.deadline),
          });
        } else {
          setFormData((current) => ({
            ...current,
            project_id: initialProjectId || nextProjects[0]?.id || "",
          }));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : mode === "edit"
                ? tAuto("No se pudo cargar la convocatoria.")
                : tAuto("No se pudieron cargar tus proyectos.")
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, opportunityId, initialProjectId, token]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "edit" && !opportunityId) {
      setError(tAuto("No se encontro la convocatoria solicitada."));
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const savedOpportunity =
        mode === "edit" && opportunityId
          ? await updateOpportunity(
              opportunityId,
              normalizeOpportunityFormData(formData),
              token ?? undefined
            )
          : await createOpportunity(normalizeOpportunityFormData(formData), token ?? undefined);

      onSaved(savedOpportunity);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "edit"
            ? tAuto("No se pudo actualizar la convocatoria.")
            : tAuto("No se pudo crear la convocatoria.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="producer-modal" role="presentation">
        <article className="producer-modal__panel producer-project-detail-modal producer-empty">
          <p>{tAuto("Cargando...")}</p>
        </article>
      </div>
    );
  }

  const hasProjects = projects.length > 0;
  const eyebrow = mode === "edit" ? tAuto("Editar convocatoria") : tAuto("Nueva convocatoria");
  const title = mode === "edit" ? tAuto("Actualiza la oportunidad") : tAuto("Crear oportunidad");
  const subtitle =
    mode === "edit"
      ? tAuto("Ajusta los datos del rol requerido y el estado de la convocatoria.")
      : tAuto("Publica una convocatoria conectada a uno de tus proyectos reales.");
  const submitLabel =
    mode === "edit"
      ? isSubmitting
        ? tAuto("Guardando...")
        : tAuto("Guardar cambios")
      : isSubmitting
        ? tAuto("Creando...")
        : tAuto("Crear convocatoria");

  return (
    <div className="producer-modal" role="presentation">
      <article
        className="producer-modal__panel producer-project-detail-modal producer-project-form-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="producer-project-form-modal__header">
          <div>
            <p className="producer-page__eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="producer-page__subtitle">{subtitle}</p>
          </div>
          <button
            className="producer-modal__close"
            type="button"
            onClick={onClose}
            aria-label={tAuto("Cerrar")}
          >
            <FiX />
          </button>
        </div>

        {!hasProjects ? (
          <div className="producer-project-form-modal__scroll">
            <div className="producer-empty">
              <p className="producer-card__text">
                {tAuto("Necesitas al menos un proyecto para crear una convocatoria.")}
              </p>
              <button
                className="producer-button producer-button--primary"
                type="button"
                onClick={() => navigate("/producer/projects/new")}
              >
                {tAuto("Crear proyecto primero")}
              </button>
            </div>
          </div>
        ) : (
          <form className="producer-project-form-modal__body" onSubmit={handleSubmit}>
            <div className="producer-project-form-modal__scroll">
              <div className="producer-form">
                <label className="producer-field">
                  <span>{tAuto("Proyecto")}</span>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    required
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {tAuto(project.title)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="producer-field">
                  <span>{tAuto("Titulo")}</span>
                  <input name="title" value={formData.title} onChange={handleChange} required />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Rol requerido")}</span>
                  <input
                    name="role_needed"
                    value={formData.role_needed}
                    onChange={handleChange}
                    placeholder={tAuto("Director de fotografia")}
                    required
                  />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Especialidad")}</span>
                  <input
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder={tAuto("Cine documental")}
                    required
                  />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Ubicacion")}</span>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Modalidad")}</span>
                  <select name="modality" value={formData.modality} onChange={handleChange}>
                    {OPPORTUNITY_MODALITY_OPTIONS.map((modality) => (
                      <option key={modality} value={modality}>
                        {tAuto(MODALITY_LABELS[modality] ?? modality)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="producer-field">
                  <span>{tAuto("Estado")}</span>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    {OPPORTUNITY_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {tAuto(status.label)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="producer-field">
                  <span>{tAuto("Deadline")}</span>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </label>

                <label className="producer-field producer-field--full">
                  <span>{tAuto("Descripcion")}</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </label>

                <label className="producer-field producer-field--full">
                  <span>{tAuto("Requisitos")}</span>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={5}
                    placeholder={tAuto("Uno por linea o separados por comas")}
                  />
                </label>
              </div>

              {error ? <p className="producer-feedback producer-feedback--error">{error}</p> : null}
            </div>

            <div className="producer-project-form-modal__footer producer-actions">
              <button className="producer-button" type="button" onClick={onClose}>
                {tAuto("Cancelar")}
              </button>
              <button
                className="producer-button producer-button--primary"
                type="submit"
                disabled={isSubmitting}
              >
                {submitLabel}
              </button>
            </div>
          </form>
        )}
      </article>
    </div>
  );
}

export default OpportunityFormModal;
