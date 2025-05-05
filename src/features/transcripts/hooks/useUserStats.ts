import { useQuery } from '@tanstack/react-query';
import { fetchUserStats } from '../api/userStatsApi';
import { UserDashboardStats } from '../types';

export const useUserStats = (userId?: string) => {
  return useQuery<UserDashboardStats>({
    queryKey: ['user-stats', userId],
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
  });
};