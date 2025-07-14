import axiosInstance from '@/shared/api/axios';
import { AudioFileStats } from '../types';
import { DashboardLineGraphParams, HourlyParams } from '../hooks/useDashboardStatsGraph';

export interface DashboardData {
  audioStats: AudioFileStats[];
}


// LineGraphData interface is used for the line graph data and can be dynamic
export interface LineGraphData {
  done_audio_files: number;
  done_chunks: number;
  error_audio_files: number;
  invalid_chunks: number;
  active_operators: number;
}
export interface HourlyLineGraphData {
  hour_range: string;
  count: number;
}
export interface HourlyLineGraphResponse {
  user_id: string;
  username: string;
  daily_transcripts: HourlyLineGraphData[];
}

// Real API call (commented out for now)
// export const fetchDashboardStats = async (): Promise<DashboardStats> => {
//   const response = await axios.get<DashboardStats>(`${config.apiUrl}/api/v1/dashboard/stats`);
//   return response.data;
// };

// Using mock data for now
export interface DashboardApiResponse {
  data: {
    audioStats: AudioFileStats;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  isLoading: boolean;
  user: {
    id: string;
    role: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchDashboardStats = async (): Promise<any> => {
  const audioStatsResponse = await axiosInstance.get('/api/v1/dashboard');
  // Assuming the API returns the full structure as described
  return audioStatsResponse.data as AudioFileStats;
};
export const fetchDashboardLineGraphStats = async (params: DashboardLineGraphParams): Promise<LineGraphData[]> => {
  // Ensure params are defined and have default values
  params.fromDate = params.fromDate || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]; // Default to 7 days ago
  params.toDate = params.toDate || new Date().toISOString().split('T')[0]; // Default to today
  const lineGraphStatsResponse = await axiosInstance.get<LineGraphData[]>(`/api/v1/dashboard/stats?fromDate=${params.fromDate}&toDate=${params.toDate}`);

  return lineGraphStatsResponse.data;
};

interface HourlyLineGraphResponseExtended {
  data: HourlyLineGraphResponse[];
}

export const fetchHourlyStats = async (params: HourlyParams): Promise<HourlyLineGraphResponse[]> => {
  // Ensure params are defined and have default values
  const hourlyStatsResponse = await axiosInstance.get<HourlyLineGraphResponseExtended>(`/api/v1/dashboard/hours?userId=${params.userId}&date=${params.date}`);
  return hourlyStatsResponse.data.data;
};