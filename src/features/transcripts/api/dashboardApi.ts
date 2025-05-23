import axiosInstance from '@/shared/api/axios';
import { AudioFileStats } from '../types';

export interface DashboardData {
  audioStats: AudioFileStats[];
}

// Real API call (commented out for now)
// export const fetchDashboardStats = async (): Promise<DashboardStats> => {
//   const response = await axios.get<DashboardStats>(`${config.apiUrl}/api/v1/dashboard/stats`);
//   return response.data;
// };

// Using mock data for now
export const fetchDashboardStats = async (): Promise<DashboardData> => {
  const audioStatsResponse = await axiosInstance.get<AudioFileStats[]>('/api/v1/dashboard');

  return {
    audioStats: audioStatsResponse.data
  };
};