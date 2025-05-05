import axiosInstance from '@/shared/api/axios';
import { UserDashboardStats } from '../types';

export const fetchUserStats = async (userId: string): Promise<UserDashboardStats> => {
  const response = await axiosInstance.get<UserDashboardStats>(`/api/v1/dashboard/user/${userId}`);
  return response.data;
};