export type SiteStatus =
  | "Entwurf"
  | "Gesendet"
  | "Interessiert"
  | "Gewonnen"
  | "Abgelehnt";

export type SiteTemplate = "premium" | "local" | "minimal" | "arzt" | "arzt-modern" | "handwerk" | "handwerk-lokal";

export interface ServiceItem {
  title: string;
  description: string;
}

export interface BenefitItem {
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  text: string;
}

export interface TeamMemberItem {
  name: string;
  title: string;
  bio: string;
}

export interface AIContent {
  hero_badge?: string;
  cta_secondary?: string;
  services_detailed?: ServiceItem[];
  service_images?: string[];      // custom image URLs per service card (index-matched)
  benefits_detailed?: BenefitItem[];
  stats?: StatItem[];
  about_headline?: string;
  about_highlight?: string;
  trust_badge?: string;
  cta_section_headline?: string;
  cta_section_text?: string;
  testimonials?: TestimonialItem[]; // AI-generated, industry-specific
  team_members?: TeamMemberItem[];  // AI-extracted from existing website
}

export interface Site {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  slug: string;
  industry: string;
  old_website_url: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  primary_color: string;
  hero_headline: string;
  hero_subheadline: string;
  cta_text: string;
  services: string[];
  benefits: string[];
  about_text: string | null;
  status: SiteStatus;
  // v2 fields
  meta_title: string | null;
  meta_description: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  ai_content: AIContent | null;
  // v3 fields
  template: SiteTemplate;
  // v4 fields
  agb_text: string | null;
  // v5 fields
  hero_image_url: string | null;
  about_image_url: string | null;
  testimonials: TestimonialItem[] | null;
}

export type SiteFormData = Omit<Site, "id" | "created_at" | "updated_at">;
