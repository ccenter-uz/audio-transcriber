import axios from 'axios';
import { config } from '../config';

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token: string;
  user: {
    agent_id: string;
    id: string;
    name: string;
    role: 'admin' | 'operator';
    image: string | null;
  };
  message: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${config.apiUrl}/api/v1/auth/login`,
      data
    );
    return response.data;
  }
};