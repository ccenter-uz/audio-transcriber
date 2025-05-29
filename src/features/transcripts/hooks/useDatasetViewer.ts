import { useQuery } from '@tanstack/react-query';
import { transcriptApi, type DatasetViewerParams, type DatasetViewerResponse } from '../api/transcriptApi';

export const useDatasetViewer = (params: DatasetViewerParams) => {
  return useQuery<DatasetViewerResponse>({
    queryKey: ['dataset-viewer', params],
    queryFn: () => transcriptApi.getDatasetViewer(params),
    placeholderData: (previousData) => previousData, // Keep old data while fetching new data
  });
};