export interface User {
  id: number
  username: string
  created_at: string
}

export interface Note {
  id: number
  user_id: number
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user_id: number
  username: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
