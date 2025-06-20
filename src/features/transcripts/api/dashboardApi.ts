import axiosInstance from '@/shared/api/axios';
import { AudioFileStats } from '../types';
import { DashboardLineGraphParams } from '../hooks/useDashboardStatsGraph';

export interface DashboardData {
  audioStats: AudioFileStats[];
}


// LineGraphData interface is used for the line graph data and can be dynamic
export interface LineGraphData {
  done_audio_files: number;
  done_chunks: number;
  error_audio_files: number;
  invalid_chunks: number;
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
export const fetchDashboardLineGraphStats = async (params: DashboardLineGraphParams): Promise<LineGraphData[]> => {
  // Ensure params are defined and have default values
  params.fromDate = params.fromDate || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]; // Default to 7 days ago
  params.toDate = params.toDate || new Date().toISOString().split('T')[0]; // Default to today
  const lineGraphStatsResponse = await axiosInstance.get<LineGraphData[]>(`/api/v1/dashboard/stats?fromDate=${params.fromDate}&toDate=${params.toDate}`);

  return lineGraphStatsResponse.data;
};