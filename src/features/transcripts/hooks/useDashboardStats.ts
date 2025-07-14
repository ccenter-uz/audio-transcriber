import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../api/dashboardApi';
import { AudioFileStats } from '../types';


export const useDashboardStats = () => {
  return useQuery<AudioFileStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetchDashboardStats();
      // Adapt response to match AudioFileStats interface
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};