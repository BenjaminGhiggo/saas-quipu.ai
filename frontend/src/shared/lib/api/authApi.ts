import { ApiResponse, LoginFormData, SunatLoginFormData, RegisterFormData, User } from '@/shared/types';
import { httpClient } from './httpClient';

export const authApi = {
  login: async (data: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await httpClient.post('/auth/login', data);
    return response.data;
  },

  loginWithSunat: async (data: SunatLoginFormData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await httpClient.post('/auth/login/sunat', data);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await httpClient.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await httpClient.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await httpClient.post('/auth/logout');
    return response.data;
  },
};