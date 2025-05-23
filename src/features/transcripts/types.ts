export type TranscriptionStatus = 'reviewed' | 'in_progress' | 'error';

export interface UserPerformance {
  id: string;
  name: string;
  reviewedCount: number;
  averageEditTime: number; // in minutes
  isActive: boolean;
  joinedAt: string;
}

export interface TranscriptProgress {
  id: string;
  name: string;
  duration: string;
  asrDate: string;
  status: 'editing' | 'waiting';
  elapsedTime: number;
}

export interface UserStats extends UserPerformance {
  inProgress: number;
  thisWeek: number;
  averageEditTime: number;
  fastestEdit: number;
  longestEdit: number;
  weeklyStreak: number;
  mostActiveDay: string;
  dailyContributions: {
    date: string;
    count: number;
  }[];
  transcriptProgress: TranscriptProgress[];
}

export interface UserDashboardStats {
  username: string;
  daily_chunks: string;
  total_audio_files: number;
  total_chunks: number;
  total_minutes: number;
  weekly_audio_files: number;
  weekly_chunks: number;
}

export interface AudioFileStats {
  audio_file_id: number;
  filename: string;
  total_segments: number;
  completed_segments: number;
  percent: number;
}