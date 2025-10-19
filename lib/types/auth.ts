// Authentication types for the recruitment platform

export type UserRole = "employer" | "applicant"

export interface SignUpData {
  email: string
  password: string
  role: UserRole
  fullName?: string
  companyName?: string
}

export interface UserMetadata {
  role: UserRole
  full_name?: string
  company_name?: string
}
