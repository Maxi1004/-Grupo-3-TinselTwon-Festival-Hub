export type ProjectStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type ProducerProfile = {
  id?: string;
  user_uid?: string;
  display_name: string;
  company_name: string;
  role_title: string;
  bio: string;
  location: string;
  country: string;
  phone: string;
  website: string;
  photo_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProducerProfileUpdatePayload = {
  display_name: string;
  company_name: string;
  role_title: string;
  bio: string;
  location: string;
  country: string;
  phone: string;
  website: string;
};

export type ProducerProfilePhotoResponse = {
  photo_url: string;
};

export type OpportunityStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "OPEN"
  | "CLOSED"
  | "PAUSED"
  | "DRAFT"
  | "COMPLETED";

export type OpportunityModality = "REMOTE" | "ONSITE" | "HYBRID" | "FLEXIBLE";

export type ProjectFilmFreewayFields = {
  project_title?: string | null;
  brief_synopsis?: string | null;
  genres?: string[];
  completion_year?: number | null;
  duration_hours?: number | null;
  duration_minutes?: number | null;
  duration_seconds?: number | null;
  country_of_origin?: string[];
  country_of_filming?: string[];
  languages?: string[];
  directors?: string[];
  writers?: string[];
  producers?: string[];
  key_cast?: string[];
  shooting_format?: string | null;
  aspect_ratio?: string | null;
  film_color?: string | null;
  production_budget?: number | null;
  production_budget_currency?: string | null;
  student_project?: boolean | null;
  first_time_filmmaker?: boolean | null;
  first_time_screenwriter?: boolean | null;
};

export type Project = {
  id: string;
  producer_id?: string;
  title: string;
  description: string;
  production_type: string;
  location: string;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus | string;
  opportunities_count?: number;
  created_at?: string;
  updated_at?: string;
} & ProjectFilmFreewayFields;

export type ProjectCreatePayload = {
  title: string;
  description: string;
  production_type: string;
  location: string;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus | string;
} & ProjectFilmFreewayFields;

export type ProjectUpdatePayload = ProjectCreatePayload;

export type Opportunity = {
  id: string;
  project_id: string;
  producer_id?: string;
  owner_uid?: string;
  title: string;
  role_needed: string;
  specialty: string;
  description: string;
  location: string;
  modality: OpportunityModality | string;
  requirements: string[];
  status: OpportunityStatus | string;
  deadline: string | null;
  applications_count?: number;
  applicants_count?: number;
  applicantsCount?: number;
  project_title?: string;
  created_at?: string;
  updated_at?: string;
  project?: Project | null;
};

export type OpportunityCreatePayload = {
  project_id: string;
  title: string;
  role_needed: string;
  specialty: string;
  description: string;
  location: string;
  modality: OpportunityModality | string;
  requirements: string[];
  status: OpportunityStatus | string;
  deadline: string | null;
};

export type OpportunityUpdatePayload = OpportunityCreatePayload;

export type OpportunityStatusPayload = {
  status: OpportunityStatus | string;
};

export const STATUS_ACTION_OPTIONS: Array<{
  value: ProjectStatus | OpportunityStatus;
  label: string;
}> = [
  { value: "ACTIVE", label: "Iniciar" },
  { value: "CANCELLED", label: "Cancelar" },
];

export const PROJECT_STATUS_OPTIONS = STATUS_ACTION_OPTIONS;

export const OPPORTUNITY_STATUS_OPTIONS = STATUS_ACTION_OPTIONS;

export const OPPORTUNITY_MODALITY_OPTIONS: OpportunityModality[] = [
  "REMOTE",
  "ONSITE",
  "HYBRID",
  "FLEXIBLE",
];
