import { useQuery } from '@tanstack/react-query';
import { transcriptApi, type AudioSegmentResponse } from '../api/transcriptApi';

export const useAudioSegments = (userId?: string | null) => {
  return useQuery<AudioSegmentResponse>({
    queryKey: ['audio-segments', userId],
    queryFn: () => transcriptApi.getAudioSegments(userId || undefined),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    select: (data) => {
      // Store audio_id in localStorage if needed
      if (!userId && data.audio_segments.length > 0) {
        localStorage.setItem('audio_id', data.audio_segments[0].audio_id.toString());
      }
      return data;
    }
  });
};