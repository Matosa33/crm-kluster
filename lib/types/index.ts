import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type ScrapeJob = Database['public']['Tables']['scrape_jobs']['Row']
export type StatusChange = Database['public']['Tables']['status_changes']['Row']

export type ContactStatus = Database['public']['Enums']['contact_status']
export type ActivityType = Database['public']['Enums']['activity_type']
export type ContactPriority = Database['public']['Enums']['contact_priority']
export type ScrapeStatusEnum = Database['public']['Enums']['scrape_status']
export type WebsiteStatus = Database['public']['Enums']['website_status']
export type WebsiteQuality = Database['public']['Enums']['website_quality']

export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteLine = Database['public']['Tables']['quote_lines']['Row']
export type QuoteStatus = Quote['status']

export type AiSettings = Database['public']['Tables']['ai_settings']['Row']
export type AiTone = AiSettings['tone']

export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export type ContactWithCompany = Contact & {
  company: Company | null
  assigned_user: Profile | null
}

export type ActivityWithUser = Activity & {
  user: Profile | null
}

export type CalendarActivity = {
  id: string
  contact_id: string
  type: ActivityType
  subject: string
  description: string | null
  scheduled_at: string
  completed_at: string | null
  duration_minutes: number | null
  location: string | null
  attendees: string[]
  meeting_notes: string | null
  created_at: string
  contact: {
    id: string
    first_name: string | null
    last_name: string | null
    company: { id: string; name: string } | null
    deal_amount: number | null
  } | null
  user: { id: string; full_name: string } | null
}

export type ContactForKanban = {
  id: string
  first_name: string | null
  last_name: string | null
  status: ContactStatus
  priority: 'basse' | 'moyenne' | 'haute'
  deal_amount: number | null
  next_followup_at: string | null
  updated_at: string
  company: { id: string; name: string } | null
  assigned_user: { id: string; full_name: string } | null
}
