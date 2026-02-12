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
