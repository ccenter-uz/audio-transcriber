import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../api/dashboardApi';
import { AudioFileStats } from '../types';


interface DashboardStats {
  audioStats: AudioFileStats[];
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};