import axiosInstance from '@/shared/api/axios';

interface Transcript {
  id: string;
  title: string;
  status: 'in_progress' | 'not_started' | 'completed';
  duration: string;
}

export interface AudioSegment {
  audio_id: number;
  audio_name: string;
  created_at: string;
  file_path: string;
  id: number;
  status: string;
}

export interface TranscriptDetail {
  ai_text: string;
  audio_id: number;
  audio_name: string;
  created_at: string;
  id: number;
  report_text: string;
  segment_id: number;
  status: string;
  transcribe_text: string;
  user_id: string;
  username: string;
}

export interface AudioSegmentResponse {
  audio_segments: AudioSegment[];
  count: number;
}

export interface TranscriptUpdate {
  report_text?: string | null;
  transcribe_text?: string | null;
}

export const transcriptApi = {
  async getActiveTranscript(): Promise<Transcript | null> {
    const response = await axiosInstance.get<Transcript>('/api/v1/transcript/active');
    return response.data;
  },

  async assignNextTranscript(): Promise<Transcript | null> {
    const response = await axiosInstance.get<Transcript>('/api/v1/transcript/next');
    return response.data;
  },

  async getAudioSegments(userId?: string): Promise<AudioSegmentResponse> {
    let url = '/api/v1/audio_segment';
    if (userId) {
      url += `?user_id=${userId}`;
    }
    const response = await axiosInstance.get<AudioSegmentResponse>(url);
    return response.data;
  },

  async updateTranscript(chunkId: number, data: TranscriptUpdate): Promise<void> {
    await axiosInstance.put(`/api/v1/transcript/update?id=${chunkId}`, data);
  },

  async getTranscript(id: number): Promise<TranscriptDetail> {
    const response = await axiosInstance.get<TranscriptDetail>(`/api/v1/transcript/${id}`);
    return response.data;
  }
}