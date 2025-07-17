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
  transcribe_option: string | null; // Added transcribe_option field
}

export interface TranscriptDetail {
  emotion: string | null; // Emotion field added
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
  emotion?: string | null; // Emotion field added
}

export interface DatasetViewerItem {
  audio_id: number;
  audio_url: string;
  chunk_id: number;
  chunk_url: string;
  duration: number;
  previous_text: string;
  text: string;
  next_text: string;
  sentence: string;
  report_text: string;
  transcriber: string;
  transcriber_id: string;
  minutes_spent: number;
}

export interface DatasetViewerResponse {
  data: DatasetViewerItem[];
  total: number;
}

export interface DatasetViewerParams {
  user_id?: string;
  report?: boolean;
  offset?: number;
  limit?: number;
}

export interface User {
  agent_id: string;
  create_date: string;
  first_number: string;
  name: string;
  service_name: string;
}

export interface UserListResponse {
  count: number;
  users: User[];
}

export interface UserListParams {
  name?: string;
  limit?: number;
  offset?: number;
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
  async startTranscript(chunkId: number): Promise<void> {
    await axiosInstance.put(`/api/v1/transcript/start?id=${chunkId}`);
  },

  async getTranscript(id: number): Promise<TranscriptDetail> {
    const response = await axiosInstance.get<TranscriptDetail>(`/api/v1/transcript/${id}`);
    return response.data;
  },

  async getDatasetViewer(params: DatasetViewerParams): Promise<DatasetViewerResponse> {
    const queryParams = new URLSearchParams();
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.report !== undefined) queryParams.append('report', params.report.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<DatasetViewerResponse>(
      `/api/v1/dataset_viewer?${queryParams.toString()}`
    );
    return response.data;
  },

  async getUserList(params: UserListParams): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());

    const response = await axiosInstance.get<UserListResponse>(
      `/api/v1/user/list?${queryParams.toString()}`
    );
    return response.data;
  }
}