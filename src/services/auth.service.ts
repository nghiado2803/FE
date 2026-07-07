import apiClient from './api'
import type { Role, UserInfo } from '@/stores/authStore'

export interface LoginDTO {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  role: Role
  user: UserInfo
}

export const AuthService = {
  login(data: LoginDTO): Promise<AuthResponse> {
    return apiClient.post('/auth/login', data) as Promise<AuthResponse>
  }
}
