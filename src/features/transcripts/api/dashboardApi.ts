import dayjs from 'dayjs';
import { DashboardStats, TranscriptionStatus } from '../types';

// Mock data generator for development
const generateMockDashboardData = (): DashboardStats => {
  const today = dayjs();
  
  // Generate daily stats for last 7 days
  const dailyStats = Array.from({ length: 7 }).map((_, index) => ({
    date: today.subtract(index, 'day').format('YYYY-MM-DD'),
    reviewed: Math.floor(Math.random() * 20) + 10,
    inProgress: Math.floor(Math.random() * 10) + 5,
    error: Math.floor(Math.random() * 5)
  })).reverse();

  // Calculate totals
  const totalReviewed = dailyStats.reduce((sum, day) => sum + day.reviewed, 0);
  const inProgress = dailyStats.reduce((sum, day) => sum + day.inProgress, 0);
  const erroredFiles = dailyStats.reduce((sum, day) => sum + day.error, 0);

  // Generate mock user performance data
  const userPerformance = Array.from({ length: 10 }).map((_, index) => ({
    id: `user-${index + 1}`,
    name: `Transcriber ${index + 1}`,
    reviewedCount: Math.floor(Math.random() * 100) + 20,
    averageEditTime: Math.floor(Math.random() * 20) + 5,
    isActive: Math.random() > 0.3,
    joinedAt: dayjs().subtract(Math.floor(Math.random() * 90), 'day').toISOString()
  }));

  return {
    totalReviewed,
    inProgress,
    erroredFiles,
    activeTranscribers: userPerformance.filter(u => u.isActive).length,
    statusDistribution: [
      { status: 'reviewed' as TranscriptionStatus, count: totalReviewed },
      { status: 'in_progress' as TranscriptionStatus, count: inProgress },
      { status: 'error' as TranscriptionStatus, count: erroredFiles }
    ],
    dailyStats,
    userPerformance
  };
};

// Real API call (commented out for now)
// export const fetchDashboardStats = async (): Promise<DashboardStats> => {
//   const response = await axios.get<DashboardStats>(`${config.apiUrl}/api/v1/dashboard/stats`);
//   return response.data;
// };

// Using mock data for now
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  return generateMockDashboardData();
};