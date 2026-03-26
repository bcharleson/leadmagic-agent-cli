import type { z } from 'zod';

export interface CliArg {
  name: string;
  field: string;
  required?: boolean;
  description?: string;
}

export interface CliOption {
  field: string;
  flags: string;
  description: string;
}

export interface CliMappings {
  args?: CliArg[];
  options?: CliOption[];
}

export interface CommandDefinition<TInput extends z.ZodTypeAny = z.ZodTypeAny> {
  name: string;
  group: string;
  subcommand: string;
  description: string;
  examples?: string[];
  inputSchema: TInput;
  cliMappings: CliMappings;
  handler: (input: z.infer<TInput>, client: import('./client.js').LeadMagicClient) => Promise<unknown>;
}

export interface GlobalOptions {
  apiKey?: string;
  output?: 'json' | 'pretty';
  pretty?: boolean;
  quiet?: boolean;
  fields?: string;
}

// API response types

export interface CreditsResponse {
  credits: number;
}

// People
export interface EmailValidationResponse {
  email_status: 'valid' | 'invalid' | 'unknown';
  is_domain_catch_all: boolean;
  mx_record: string | null;
  mx_provider: string | null;
  mx_gateway: string | null;
  company_name: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_founded: string | null;
  company_type: string | null;
  company_linkedin_url: string | null;
  company_location: string | null;
}

export interface EmailFinderResponse {
  email: string | null;
  status: string;
  employment_verified: boolean;
  mx_record: string | null;
  mx_provider: string | null;
  company_name: string | null;
  company_industry: string | null;
  company_size: string | null;
  company_founded: string | null;
  company_location: string | null;
  company_profile_url: string | null;
}

export interface MobileFinderResponse {
  mobile_number: string | null;
  profile_url: string | null;
  email: string | null;
  message: string;
}

export interface WorkExperience {
  company_name: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  location: string | null;
}

export interface Education {
  school: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface ProfileSearchResponse {
  first_name: string | null;
  last_name: string | null;
  professional_title: string | null;
  bio: string | null;
  company_name: string | null;
  company_website: string | null;
  location: string | null;
  country: string | null;
  followers_range: string | null;
  total_tenure_years: number | null;
  profile_image_url?: string | null;
  work_experience: WorkExperience[];
  education: Education[];
  certifications: string[];
}

export interface B2BProfileResponse {
  profile_url: string | null;
}

export interface B2BProfileEmailResponse {
  email: string | null;
  profile_url: string | null;
}

export interface PersonalEmailFinderResponse {
  personal_email: string | null;
  personal_emails: string[];
  first_personal_email: string | null;
}

export interface RoleFinderResponse {
  first_name: string | null;
  last_name: string | null;
  profile_url: string | null;
  job_title: string | null;
  company_name: string | null;
  company_website: string | null;
}

export interface Employee {
  first_name: string;
  last_name: string;
  title: string;
  website: string;
  company_name: string;
}

export interface EmployeeFinderResponse {
  employees: Employee[];
  total_count: number;
  returned_count: number;
}

export interface JobChangeResponse {
  job_change_detected: boolean;
  status: 'NO_CHANGE' | 'JOB_CHANGE_DETECTED' | 'NEVER_WORKED_THERE';
  current_position: WorkExperience | null;
  tenure_stats: Record<string, unknown> | null;
  work_history: WorkExperience[];
}

// Companies
export interface CompanySearchResponse {
  companyName: string | null;
  industry: string | null;
  employeeCount: number | null;
  employeeCountRange: string | null;
  headquarters: string | null;
  revenue: number | null;
  revenue_formatted: string | null;
  total_funding: string | null;
  followers: number | null;
  logo_url: string | null;
  twitter_url: string | null;
  competitors: string[];
  specialities: string[];
  description: string | null;
}

export interface Competitor {
  name: string;
  shortDescription: string | null;
  founded_year: number | null;
  employeesCount: number | null;
  valuation: string | null;
  financial_metrics: Record<string, unknown> | null;
  funding_metrics: Record<string, unknown> | null;
  twitterEngagement: Record<string, unknown> | null;
}

export interface CompetitorsResponse {
  competitors: Competitor[];
}

export interface FundingRound {
  round_type: string;
  amount: string | null;
  date: string | null;
  investors: string[];
}

export interface CompanyFundingResponse {
  basicInfo: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
  fundingHistory: FundingRound[];
  companySize: Record<string, unknown>;
  leadership: Record<string, unknown>;
  topCompetitors: Competitor[];
  acquisitions: Record<string, unknown>[];
  news: Record<string, unknown>[];
  pressReleases: Record<string, unknown>[];
}

export interface Technology {
  name: string;
  description: string | null;
  categories: string[];
  sub_technologies: string[];
}

export type TechnographicsResponse = Technology[];

// Jobs
export interface Job {
  title: string;
  company: string;
  location: string;
  types: string[];
  has_remote: boolean;
  published: string;
  description: string | null;
  application_url: string | null;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
}

export interface JobsFinderResponse {
  results: Job[];
  total: number;
  page: number;
  per_page: number;
}

export interface JobCountry {
  id: number;
  name: string;
  code: string;
}

export interface JobType {
  id: number;
  name: string;
}

// Ads
export interface GoogleAd {
  headline: string;
  description: string | null;
  display_url: string | null;
  final_url: string | null;
  ad_type: string | null;
}

export interface GoogleAdsResponse {
  ads: GoogleAd[];
}

export interface MetaAd {
  ad_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  platform: string | null;
  started_running: string | null;
}

export interface MetaAdsResponse {
  ads: MetaAd[];
}

export interface B2BAd {
  content: string | null;
  link: string | null;
  image_url: string | null;
}

export interface B2BAdsResponse {
  ads: B2BAd[];
}
