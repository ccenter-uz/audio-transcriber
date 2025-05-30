import { useQuery } from '@tanstack/react-query';
import { transcriptApi, type UserListParams, type UserListResponse } from '../api/transcriptApi';

export const useUserList = (params: UserListParams) => {
  return useQuery<UserListResponse>({
    queryKey: ['user-list', params],
    queryFn: () => transcriptApi.getUserList(params),
    placeholderData: (previousData) => previousData,
  });
};