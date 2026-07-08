import { useEffect, useState } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import { createProject, getProjectById, updateProject } from "../../service/projectApi";
import { reusePendingRequest } from "../../service/pendingRequest";
import { useCurrentProfile } from "../useCurrentProfile";
import { PROJECT_STATUS_OPTIONS } from "../../types/producer";
import {
  initialProjectFilmFreewayFormState,
  normalizeProjectFormData,
  toDateInputValue,
  toVisibleStatusAction,
  type ProjectFilmFreewayFormState,
} from "./utils";
import { useAutoTranslate, useFestivalFlowLanguage } from "../../hooks/useAutoTranslate";
import TagsInput from "../../components/TagsInput";
import "../../styles/producer.css";

type ProjectFormState = {
  title: string;
  description: string;
  production_type: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
} & ProjectFilmFreewayFormState;

const initialFormState: ProjectFormState = {
  title: "",
  description: "",
  production_type: "",
  location: "",
  start_date: "",
  end_date: "",
  status: "ACTIVE",
  ...initialProjectFilmFreewayFormState,
};

const FILM_COLOR_OPTIONS = [
  { value: "Color", label: "Color" },
  { value: "Black & White and Color", label: "Blanco y negro y color" },
  { value: "Black & White", label: "Blanco y negro" },
];

const CURRENCY_OPTIONS = [
  "USD",
  "AED",
  "AUD",
  "BGN",
  "BRL",
  "CAD",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CZK",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "HRK",
  "HUF",
  "ILS",
  "INR",
  "JPY",
  "KRW",
  "KZT",
  "MAD",
  "MXN",
  "MYR",
  "NOK",
  "NZD",
  "PEN",
  "PHP",
  "PLN",
  "RON",
  "RUB",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "UYU",
  "ZAR",
];

const projectFormModalBaseTexts = [
  "No se pudo crear el proyecto.",
  "No se pudo actualizar el proyecto.",
  "No se encontro el proyecto solicitado.",
  "No se pudo cargar el proyecto.",
  "Cargando proyecto...",
  "Nuevo proyecto",
  "Crear proyecto",
  "Registra la base del proyecto para luego abrir convocatorias asociadas.",
  "Editar proyecto",
  "Actualiza la informacion del proyecto",
  "Ajusta detalles operativos y manten la base lista para nuevas convocatorias.",
  "Cerrar",
  "Datos del proyecto",
  "Titulo",
  "Descripcion",
  "Tipo de produccion",
  "Serie, videoclip, documental...",
  "Ubicacion",
  "Santiago, Chile",
  "Fecha de inicio",
  "Fecha de termino",
  "Estado",
  "Iniciar",
  "Cancelar",
  "Creando...",
  "Guardando...",
  "Guardar cambios",
  "Información adicional",
  "Datos opcionales que ayudan a completar postulaciones a festivales.",
  "Información general",
  "Géneros",
  "Ej: Drama, Terror, Comedia",
  "Año de finalización",
  "Duración",
  "Horas",
  "Minutos",
  "Segundos",
  "Información técnica",
  "Formato de grabación",
  "Relación de aspecto",
  "Color de película",
  "Seleccionar...",
  "Blanco y negro y color",
  "Blanco y negro",
  "Sí",
  "No",
  "Presupuesto",
  "Moneda del presupuesto",
  "Proyecto estudiantil",
  "Director debut",
];

type ProjectFormModalProps = {
  mode: "create" | "edit";
  projectId?: string;
  onClose: () => void;
  onSaved: () => void;
};

function ProjectFormModal({ mode, projectId, onClose, onSaved }: ProjectFormModalProps) {
  const { token } = useCurrentProfile();
  const language = useFestivalFlowLanguage();
  const { tAuto } = useAutoTranslate(projectFormModalBaseTexts, language, token);
  const [formData, setFormData] = useState<ProjectFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !projectId) {
      return;
    }

    let isMounted = true;

    async function loadProject() {
      try {
        setIsLoading(true);
        setError("");
        const project = await reusePendingRequest(
          `producer-edit-project:${projectId}:${token}`,
          () => getProjectById(projectId as string, token ?? undefined)
        );

        if (!isMounted) {
          return;
        }

        setFormData({
          title: project.title ?? "",
          description: project.description ?? "",
          production_type: project.production_type ?? "",
          location: project.location ?? "",
          start_date: toDateInputValue(project.start_date),
          end_date: toDateInputValue(project.end_date),
          status: toVisibleStatusAction(project.status),
          project_title: project.project_title ?? "",
          brief_synopsis: project.brief_synopsis ?? "",
          genres: project.genres ?? [],
          completion_year:
            project.completion_year != null ? String(project.completion_year) : "",
          duration_hours: project.duration_hours != null ? String(project.duration_hours) : "",
          duration_minutes:
            project.duration_minutes != null ? String(project.duration_minutes) : "",
          duration_seconds:
            project.duration_seconds != null ? String(project.duration_seconds) : "",
          country_of_origin: project.country_of_origin ?? [],
          country_of_filming: project.country_of_filming ?? [],
          languages: project.languages ?? [],
          directors: project.directors ?? [],
          writers: project.writers ?? [],
          producers: project.producers ?? [],
          key_cast: project.key_cast ?? [],
          shooting_format: project.shooting_format ?? "",
          aspect_ratio: project.aspect_ratio ?? "",
          film_color: project.film_color ?? "",
          production_budget:
            project.production_budget != null ? String(project.production_budget) : "",
          production_budget_currency: project.production_budget_currency ?? "",
          student_project:
            project.student_project == null ? "" : String(project.student_project),
          first_time_filmmaker:
            project.first_time_filmmaker == null ? "" : String(project.first_time_filmmaker),
          first_time_screenwriter:
            project.first_time_screenwriter == null
              ? ""
              : String(project.first_time_screenwriter),
        });
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : tAuto("No se pudo cargar el proyecto.")
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProject();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, projectId, token]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      const { checked } = event.target as HTMLInputElement;
      setFormData((current) => ({ ...current, [name]: checked }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleTagsChange = (name: keyof ProjectFilmFreewayFormState, next: string[]) => {
    setFormData((current) => ({ ...current, [name]: next }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "edit" && !projectId) {
      setError(tAuto("No se encontro el proyecto solicitado."));
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      if (mode === "edit" && projectId) {
        await updateProject(projectId, normalizeProjectFormData(formData), token ?? undefined);
      } else {
        await createProject(normalizeProjectFormData(formData), token ?? undefined);
      }

      onSaved();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "edit"
            ? tAuto("No se pudo actualizar el proyecto.")
            : tAuto("No se pudo crear el proyecto.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="producer-modal" role="presentation">
        <article className="producer-modal__panel producer-project-detail-modal producer-empty">
          <p>{tAuto("Cargando proyecto...")}</p>
        </article>
      </div>
    );
  }

  const eyebrow = mode === "edit" ? tAuto("Editar proyecto") : tAuto("Nuevo proyecto");
  const title =
    mode === "edit" ? tAuto("Actualiza la informacion del proyecto") : tAuto("Crear proyecto");
  const subtitle =
    mode === "edit"
      ? tAuto("Ajusta detalles operativos y manten la base lista para nuevas convocatorias.")
      : tAuto("Registra la base del proyecto para luego abrir convocatorias asociadas.");
  const submitLabel =
    mode === "edit"
      ? isSubmitting
        ? tAuto("Guardando...")
        : tAuto("Guardar cambios")
      : isSubmitting
        ? tAuto("Creando...")
        : tAuto("Crear proyecto");

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

        <form className="producer-project-form-modal__body" onSubmit={handleSubmit}>
          <div className="producer-project-form-modal__scroll">
            <section className="producer-card producer-form-card">
              <h3 className="producer-card__title">{tAuto("Datos del proyecto")}</h3>
              <div className="producer-form">
                <label className="producer-field">
                  <span>{tAuto("Titulo")}</span>
                  <input name="title" value={formData.title} onChange={handleChange} required />
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

                <label className="producer-field">
                  <span>{tAuto("Tipo de produccion")}</span>
                  <input
                    name="production_type"
                    value={formData.production_type}
                    onChange={handleChange}
                    placeholder={tAuto("Serie, videoclip, documental...")}
                    required
                  />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Ubicacion")}</span>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={tAuto("Santiago, Chile")}
                    required
                  />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Fecha de inicio")}</span>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Fecha de termino")}</span>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </label>

                <label className="producer-field">
                  <span>{tAuto("Estado")}</span>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    {PROJECT_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {tAuto(status.label)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <details className="producer-card producer-accordion-card" open>
              <summary className="producer-accordion-card__summary">
                <div>
                  <h2 className="producer-accordion-card__title">
                    {tAuto("Información adicional")}
                  </h2>
                  <p className="producer-accordion-card__subtitle">
                    {tAuto("Datos opcionales que ayudan a completar postulaciones a festivales.")}
                  </p>
                </div>
                <FiChevronDown className="producer-accordion-card__chevron" />
              </summary>

              <div className="producer-accordion-card__body">
                <div className="producer-form-mini-section">
                  <h3 className="producer-form-mini-section__title">
                    {tAuto("Información general")}
                  </h3>
                  <div className="producer-form">
                    <label className="producer-field producer-field--full">
                      <span>{tAuto("Géneros")}</span>
                      <TagsInput
                        value={formData.genres}
                        onChange={(next) => handleTagsChange("genres", next)}
                        placeholder={tAuto("Ej: Drama, Terror, Comedia")}
                      />
                    </label>

                    <label className="producer-field">
                      <span>{tAuto("Año de finalización")}</span>
                      <input
                        type="number"
                        name="completion_year"
                        value={formData.completion_year}
                        onChange={handleChange}
                      />
                    </label>

                    <label className="producer-field">
                      <span>{tAuto("Duración")}</span>
                      <div className="producer-field-row">
                        <input
                          type="number"
                          min={0}
                          name="duration_hours"
                          value={formData.duration_hours}
                          onChange={handleChange}
                          placeholder={tAuto("Horas")}
                        />
                        <input
                          type="number"
                          min={0}
                          name="duration_minutes"
                          value={formData.duration_minutes}
                          onChange={handleChange}
                          placeholder={tAuto("Minutos")}
                        />
                        <input
                          type="number"
                          min={0}
                          name="duration_seconds"
                          value={formData.duration_seconds}
                          onChange={handleChange}
                          placeholder={tAuto("Segundos")}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div className="producer-form-mini-section">
                  <h3 className="producer-form-mini-section__title">
                    {tAuto("Información técnica")}
                  </h3>
                  <div className="producer-form">
                    <label className="producer-field">
                      <span>{tAuto("Formato de grabación")}</span>
                      <input
                        name="shooting_format"
                        value={formData.shooting_format}
                        onChange={handleChange}
                      />
                    </label>

                    <label className="producer-field">
                      <span>{tAuto("Relación de aspecto")}</span>
                      <input
                        name="aspect_ratio"
                        value={formData.aspect_ratio}
                        onChange={handleChange}
                      />
                    </label>

                    <label className="producer-field">
                      <span>{tAuto("Color de película")}</span>
                      <select name="film_color" value={formData.film_color} onChange={handleChange}>
                        <option value="">{tAuto("Seleccionar...")}</option>
                        {FILM_COLOR_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {tAuto(option.label)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="producer-field">
                      <span>{tAuto("Presupuesto")}</span>
                      <input
                        type="number"
                        name="production_budget"
                        value={formData.production_budget}
                        onChange={handleChange}
                      />
                    </label>

                    <label className="producer-field">
                      <span>{tAuto("Moneda del presupuesto")}</span>
                      <select
                        name="production_budget_currency"
                        value={formData.production_budget_currency}
                        onChange={handleChange}
                      >
                        <option value="">{tAuto("Seleccionar...")}</option>
                        {CURRENCY_OPTIONS.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <div className="producer-form-mini-section">
                  <h3 className="producer-form-mini-section__title">
                    {tAuto("Información adicional")}
                  </h3>
                  <div className="producer-form">
                    <label className="producer-field">
                      <span>{tAuto("Proyecto estudiantil")}</span>
                      <select
                        name="student_project"
                        value={formData.student_project}
                        onChange={handleChange}
                      >
                        <option value="">{tAuto("Seleccionar...")}</option>
                        <option value="true">{tAuto("Sí")}</option>
                        <option value="false">{tAuto("No")}</option>
                      </select>
                    </label>

                    <label className="producer-field">
                      <span>{tAuto("Director debut")}</span>
                      <select
                        name="first_time_filmmaker"
                        value={formData.first_time_filmmaker}
                        onChange={handleChange}
                      >
                        <option value="">{tAuto("Seleccionar...")}</option>
                        <option value="true">{tAuto("Sí")}</option>
                        <option value="false">{tAuto("No")}</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </details>

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
      </article>
    </div>
  );
}

export default ProjectFormModal;
