from datetime import date

from pydantic import BaseModel, field_validator

ALLOWED_STATUSES = {
    # Inglés
    "draft", "active", "completed", "published",
    "in_development", "post_production", "cancelled",
    # Español
    "borrador", "activo", "finalizado", "completado", "publicado",
    "en_desarrollo", "post_produccion", "cancelado",
}


class ProjectFilmFreewayFields(BaseModel):
    """Optional fields that give the AI more context to autofill FilmFreeway forms."""

    # Información general
    project_title: str | None = None
    brief_synopsis: str | None = None
    genres: list[str] | None = None
    completion_year: int | None = None
    duration_hours: int | None = None
    duration_minutes: int | None = None
    duration_seconds: int | None = None
    country_of_origin: list[str] | None = None
    country_of_filming: list[str] | None = None
    languages: list[str] | None = None

    # Equipo principal
    directors: list[str] | None = None
    writers: list[str] | None = None
    producers: list[str] | None = None
    key_cast: list[str] | None = None

    # Información técnica
    shooting_format: str | None = None
    aspect_ratio: str | None = None
    film_color: str | None = None
    production_budget: float | None = None
    production_budget_currency: str | None = None

    # Información adicional
    student_project: bool | None = None
    first_time_filmmaker: bool | None = None
    first_time_screenwriter: bool | None = None


class ProjectCreateRequest(ProjectFilmFreewayFields):
    title: str
    description: str
    production_type: str
    location: str
    start_date: date | None = None
    end_date: date | None = None
    status: str


class ProjectUpdateRequest(ProjectFilmFreewayFields):
    title: str
    description: str
    production_type: str
    location: str
    start_date: date | None = None
    end_date: date | None = None
    status: str


class ProjectStatusUpdateRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized not in ALLOWED_STATUSES:
            raise ValueError(
                f"Estado '{v}' no válido. Opciones: {sorted(ALLOWED_STATUSES)}"
            )
        return normalized


class ProjectResponse(ProjectFilmFreewayFields):
    id: str
    owner_uid: str
    title: str
    description: str
    production_type: str
    location: str
    start_date: str | None = None
    end_date: str | None = None
    status: str
    created_at: str
    updated_at: str
