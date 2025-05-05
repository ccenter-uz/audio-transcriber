import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/shared/lib/auth.tsx";
import { useAuthMutation } from "@/features/auth/hooks/useAuthMutation";
import type { LoginRequest } from "@/shared/api/authApi";

const bgImagePath = new URL("@/assets/login-bg.png", import.meta.url).href;

const { Title, Paragraph } = Typography;

const LoginPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useAuthMutation();

  const fromPath = location.state?.from?.pathname || "/dashboard";

  // Check if already authenticated and redirect
  useEffect(() => {

    if (isAuthenticated && user) {
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, fromPath]);

  const handleSubmit = async (data: LoginRequest) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        // Navigate to the page user tried to access originally or default page
        navigate(fromPath, { replace: true });
      },
    });
  };

  // If already authenticated, show loading while redirecting
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex fixed top-0 left-0 w-full h-full overflow-hidden">
        <img
          className="object-cover object-bottom w-full h-full"
          src={bgImagePath}
          alt="fon"
        />
      </div>
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title level={2} className="my-3 text-center">
            Ovozni Transkripsiya qilish
          </Title>
          <Paragraph className="text-gray-500">
            Hisobingizga kiring
          </Paragraph>
        </div>

        {loginMutation.error && (
          <Alert
            className="mb-6"
            message={
              loginMutation.error instanceof Error
                ? loginMutation.error.message
                : "Kirishda xatolik yuz berdi"
            }
            type="error"
            showIcon
            closable
          />
        )}

        <Form
          name="login"
          size="large"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}>
          <Form.Item
            name="login"
            label="ID"
            rules={[
              { required: true, message: "Iltimos, foydalanuvchi ID'sini kiriting" },
              { type: "string", message: "Iltimos, to'g'ri ID kiriting" },
            ]}>
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Foydalanuvchi ID'si"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: "Iltimos, parolingizni kiriting" }]}>
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Parol"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-700 hover:bg-blue-800"
              loading={loginMutation.isPending}>
              Kirish
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
