import { useQuery } from '@tanstack/react-query';
import { fetchDashboardLineGraphStats, LineGraphData } from '../api/dashboardApi';


// Params is fromDate and toDate
export interface DashboardLineGraphParams {
  fromDate?: string; // ISO date string
  toDate?: string; // ISO date string
}


export const useDashboardLineGraphStats = (params: DashboardLineGraphParams) => {
  return useQuery<LineGraphData[]>({
    queryKey: ['dashboard-line-graph-stats', params],
    queryFn: () => fetchDashboardLineGraphStats(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};