import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../api/dashboardApi';
import { AudioFileStats } from '../types';


interface DashboardStats {
  audioStats: AudioFileStats;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetchDashboardStats();
      // Adapt response to match DashboardStats interface
      return {
        audioStats: response.data.audioStats,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};