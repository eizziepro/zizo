export type StaffRole = 'owner' | 'coordinator' | 'editor';

export interface StaffProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  active: boolean;
  avatar_path?: string | null;
  display_name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  job_title?: string | null;
  department?: string | null;
  bio?: string | null;
  location?: string | null;
  timezone: string;
  language: string;
  links?: Record<string, string>;
  emergency_contact?: {
    name?: string;
    phone?: string;
    relationship?: string;
    notes?: string;
  };
  notification_prefs?: {
    booking?: boolean;
    inquiry?: boolean;
    application?: boolean;
    review?: boolean;
  };
  totp_enabled?: boolean;
  last_active?: string;
  created_at: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'in_progress' | 'closed' | 'spam';

export interface Inquiry {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  country?: string | null;
  source?: string | null;
  message: string;
  status: InquiryStatus;
  assigned_to?: string | null;
  assigned_staff?: { full_name: string; avatar_path?: string } | null;
  notes?: string | null;
  tags?: string[];
  created_at: string;
}

export type ApplicationKind = 'surrogate' | 'egg_donor';
export type ApplicationStatus = 'new' | 'in_screening' | 'approved' | 'waitlist' | 'declined' | 'on_hold';

export interface Application {
  id: string;
  kind: ApplicationKind;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  age_range: string;
  country: string;
  city: string;
  answers: Record<string, any>;
  status: ApplicationStatus;
  assigned_to?: string | null;
  assigned_staff?: { full_name: string; avatar_path?: string } | null;
  notes?: string | null;
  tags?: string[];
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  consultation_type_id: string;
  consultation_type?: { name: string; duration_min: number; price_minor: number; currency: string };
  staff_id: string;
  assigned_staff?: { full_name: string };
  start_at: string;
  end_at: string;
  status: BookingStatus;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
  country: string;
  audience: string;
  channel: string;
  note?: string | null;
  internal_notes?: string | null;
  meeting_url?: string | null;
  payment_status: string;
  created_at: string;
}

export interface ConsultationType {
  id: string;
  name: string;
  slug: string;
  duration_min: number;
  buffer_min: number;
  channels: string[];
  price_minor: number;
  currency: string;
  intro: string;
  active: boolean;
  sort: number;
  bookings_count?: number;
  updated_at?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  body_md: string;
  price_amount: number;
  price_currency: string;
  price_label: string;
  price_note?: string | null;
  show_price: boolean;
  image_path?: string | null;
  image_alt?: string | null;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  sort_order: number;
  seo?: {
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
    noindex?: boolean;
  };
  linked_consultation_type_id?: string | null;
  faqs_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer_md: string;
  audience: 'Intended Parents' | 'Surrogates' | 'Donors' | 'Legal and Costs' | 'General';
  status: 'draft' | 'published' | 'archived';
  sort_order?: number;
  assignments?: {
    id: string;
    page_type: 'service' | 'page';
    page_ref: string;
    page_title?: string;
    sort_order: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id?: string | null;
  display_name: string;
  avatar_url?: string | null;
  role: 'Intended Parent' | 'Surrogate' | 'Egg Donor';
  rating: number;
  title: string;
  body: string;
  country?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  featured: boolean;
  verified: boolean;
  source: 'public' | 'token' | 'legacy';
  admin_reply?: string | null;
  created_at: string;
  approved_at?: string | null;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string | null;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  source?: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  table_name: string;
  record_id?: string | null;
  diff?: any;
  ip_address?: string | null;
  created_at: string;
}

export type CaseProgram =
  | 'gestational_surrogacy'
  | 'egg_donation_ivf'
  | 'surrogacy_and_egg_donation'
  | 'ivf_coordination';

export type CaseStage =
  | 'legal_intake'
  | 'matching_clearance'
  | 'ivf_embryo_creation'
  | 'embryo_transfer'
  | 'pregnancy_trimester_1'
  | 'pregnancy_trimester_2_3'
  | 'delivery_citizenship'
  | 'journey_completed';

export type CaseHealthStatus = 'on_track' | 'pending_clinical' | 'action_required' | 'completed' | 'paused';

export interface CaseMilestone {
  id: string;
  title: string;
  stage: CaseStage;
  completed: boolean;
  completed_at?: string | null;
  target_date?: string | null;
  notes?: string;
}

export interface CaseNote {
  id: string;
  author: string;
  role: string;
  created_at: string;
  text: string;
  category: 'clinical' | 'legal' | 'coordination' | 'financial';
}

export interface CaseRecord {
  id: string;
  case_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  avatar_url?: string | null;
  country: string;
  program: CaseProgram;
  stage: CaseStage;
  health_status: CaseHealthStatus;
  progress_pct: number;
  assigned_coordinator: {
    id: string;
    full_name: string;
    avatar_path?: string;
  };
  partner_clinic: string;
  matched_surrogate?: {
    id: string;
    code: string;
    name: string;
  } | null;
  matched_donor?: {
    id: string;
    code: string;
    name: string;
  } | null;
  start_date: string;
  target_delivery_date?: string | null;
  estimated_transfer_date?: string | null;
  milestones: CaseMilestone[];
  notes: CaseNote[];
  financial_status: {
    total_budget_usd: number;
    disbursed_usd: number;
    escrow_secured: boolean;
  };
  created_at: string;
  updated_at: string;
}
