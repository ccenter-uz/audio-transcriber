import { useMutation } from '@tanstack/react-query';
import { authApi, type LoginRequest, type LoginResponse } from '@/shared/api/authApi';
import { useAuth } from '@/shared/lib/auth.tsx';
import { notification } from 'antd';

export const useAuthMutation = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data: LoginResponse) => {
      // Store the token and user info in context
      login(data.access_token);
      localStorage.setItem('user-name', JSON.stringify(data.user.name).replace('"', '').replace('"', '')); // Store user info in localStorage if needed
      localStorage.setItem('user-image', JSON.stringify(data.user.image).replace('"', '').replace('"', '')); // Store user info in localStorage if needed


      notification.success({
        message: 'Success',
        description: 'Successfully logged in',
      });
    },
  });
};