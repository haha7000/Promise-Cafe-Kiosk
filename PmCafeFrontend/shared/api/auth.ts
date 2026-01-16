/**
 * Authentication API
 */
import apiClient from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
    last_login: string | null;
  };
}

export interface UserInfo {
  id: number;
  username: string;
  name: string;
  role: string;
  last_login: string | null;
}

export const authApi = {
  /**
   * 관리자 로그인
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response;
  },

  /**
   * 토큰 검증
   */
  verify: async (): Promise<UserInfo> => {
    const response = await apiClient.get('/api/v1/auth/verify');
    return response;
  },
};
