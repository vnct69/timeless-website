export type UserRole = 'admin' | 'member'

export type Profile = {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export type AuthError = {
  message: string
  status?: number
}

export type AuthState = {
  user: Profile | null
  loading: boolean
  error: AuthError | null
}