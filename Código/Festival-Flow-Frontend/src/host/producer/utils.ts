import type { Opportunity, Project } from "../../types/producer";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activa",
  CANCELLED: "Cancelada",
  CLOSED: "Cancelada",
  COMPLETED: "Completada",
  DRAFT: "Borrador",
  OPEN: "Activa",
  PAUSED: "Pausada",
};

function normalizeStatus(value?: string | null): string {
  return value?.trim().toUpperCase() ?? "";
}

export function formatStatusLabel(value?: string | null): string {
  const normalizedValue = normalizeStatus(value);

  return STATUS_LABELS[normalizedValue] ?? value?.trim() ?? "Sin estado";
}

export function isActiveStatus(value?: string | null): boolean {
  return ["ACTIVE", "OPEN"].includes(normalizeStatus(value));
}

export function isCancelledStatus(value?: string | null): boolean {
  return ["CANCELLED", "CLOSED"].includes(normalizeStatus(value));
}

export function toVisibleStatusAction(value?: string | null): "ACTIVE" | "CANCELLED" {
  return isCancelledStatus(value) ? "CANCELLED" : "ACTIVE";
}

export function formatDisplayDate(value?: string | null): string {
  if (!value) {
    return "Sin definir";
  }

  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function parseRequirementsInput(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function requirementsToTextarea(value?: string[]): string {
  return value?.join("\n") ?? "";
}

function toOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toOptionalFloat(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseFloat(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function toOptionalBoolean(value: string): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export type ProjectFilmFreewayFormState = {
  project_title: string;
  brief_synopsis: string;
  genres: string[];
  completion_year: string;
  duration_hours: string;
  duration_minutes: string;
  duration_seconds: string;
  country_of_origin: string[];
  country_of_filming: string[];
  languages: string[];
  directors: string[];
  writers: string[];
  producers: string[];
  key_cast: string[];
  shooting_format: string;
  aspect_ratio: string;
  film_color: string;
  production_budget: string;
  production_budget_currency: string;
  student_project: string;
  first_time_filmmaker: string;
  first_time_screenwriter: string;
};

export const initialProjectFilmFreewayFormState: ProjectFilmFreewayFormState = {
  project_title: "",
  brief_synopsis: "",
  genres: [],
  completion_year: "",
  duration_hours: "",
  duration_minutes: "",
  duration_seconds: "",
  country_of_origin: [],
  country_of_filming: [],
  languages: [],
  directors: [],
  writers: [],
  producers: [],
  key_cast: [],
  shooting_format: "",
  aspect_ratio: "",
  film_color: "",
  production_budget: "",
  production_budget_currency: "",
  student_project: "",
  first_time_filmmaker: "",
  first_time_screenwriter: "",
};

export function normalizeProjectFormData(
  formData: {
    title: string;
    description: string;
    production_type: string;
    location: string;
    start_date: string;
    end_date: string;
    status: string;
  } & ProjectFilmFreewayFormState
) {
  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    production_type: formData.production_type.trim(),
    location: formData.location.trim(),
    start_date: formData.start_date || null,
    end_date: formData.end_date || null,
    status: formData.status,
    project_title: toOptionalText(formData.project_title),
    brief_synopsis: toOptionalText(formData.brief_synopsis),
    genres: formData.genres,
    completion_year: toOptionalInt(formData.completion_year),
    duration_hours: toOptionalInt(formData.duration_hours),
    duration_minutes: toOptionalInt(formData.duration_minutes),
    duration_seconds: toOptionalInt(formData.duration_seconds),
    country_of_origin: formData.country_of_origin,
    country_of_filming: formData.country_of_filming,
    languages: formData.languages,
    directors: formData.directors,
    writers: formData.writers,
    producers: formData.producers,
    key_cast: formData.key_cast,
    shooting_format: toOptionalText(formData.shooting_format),
    aspect_ratio: toOptionalText(formData.aspect_ratio),
    film_color: toOptionalText(formData.film_color),
    production_budget: toOptionalFloat(formData.production_budget),
    production_budget_currency: toOptionalText(formData.production_budget_currency),
    student_project: toOptionalBoolean(formData.student_project),
    first_time_filmmaker: toOptionalBoolean(formData.first_time_filmmaker),
    first_time_screenwriter: toOptionalBoolean(formData.first_time_screenwriter),
  };
}

export function normalizeOpportunityFormData(formData: {
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
}) {
  return {
    project_id: formData.project_id,
    title: formData.title.trim(),
    role_needed: formData.role_needed.trim(),
    specialty: formData.specialty.trim(),
    description: formData.description.trim(),
    location: formData.location.trim(),
    modality: formData.modality,
    requirements: parseRequirementsInput(formData.requirements),
    status: formData.status,
    deadline: formData.deadline || null,
  };
}

export function getOpportunityProjectTitle(
  opportunity: Opportunity,
  projects: Project[]
): string {
  return (
    opportunity.project?.title ??
    projects.find((project) => project.id === opportunity.project_id)?.title ??
    "Proyecto sin nombre"
  );
}
