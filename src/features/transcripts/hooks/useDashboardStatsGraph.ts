import { useQuery } from '@tanstack/react-query';
import { fetchDashboardLineGraphStats, fetchHourlyStats, HourlyLineGraphResponse, LineGraphData } from '../api/dashboardApi';


// Params is fromDate and toDate
export interface DashboardLineGraphParams {
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
}
export interface HourlyParams {
  date?: string; // ISO date string
  userId: string;
}


export const useDashboardLineGraphStats = (params: DashboardLineGraphParams) => {
  return useQuery<LineGraphData[]>({
    queryKey: ['dashboard-line-graph-stats', params],
    queryFn: () => fetchDashboardLineGraphStats(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
export const useHourlyStats = (params: HourlyParams) => {
  return useQuery<HourlyLineGraphResponse[]>({
    queryKey: ['dashboard-hourly-stats', params],
    queryFn: () => fetchHourlyStats(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};