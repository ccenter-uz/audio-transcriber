import { useState } from 'react';
import { Card, Typography, Button, Form, Input, Avatar, Divider, Row, Col, Modal } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@/shared/lib/auth.tsx';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

interface AccountFormData {
  name: string;
  email: string;
  jobTitle: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Mock user profile data
  const [profile] = useState({
    name: user?.role === 'admin' ? 'Admin User' : 'Transcriber User',
    jobTitle: user?.role === 'admin' ? 'Admin Manager' : 'Audio Transcriber',
  });

  const handleProfileUpdate = (data: AccountFormData) => {
    setIsProfileLoading(true);
    // This would be replaced with an API call
    setTimeout(() => {
      console.log('Profile updated:', data);
      setIsProfileLoading(false);
    }, 800);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePasswordUpdate = (data: PasswordFormData) => {
    setIsPasswordLoading(true);
    // This would be replaced with an API call
    setTimeout(() => {
      console.log('Password updated');
      setIsPasswordLoading(false);
      
      // Reset the form
      const form = document.getElementById('password-form') as HTMLFormElement;
      if (form) form.reset();
    }, 800);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Account Settings</Title>
        <Paragraph className="text-gray-500">
          Manage your profile and account settings
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col span={8}>
          <Card className="mb-6 text-center">
            <div className="mb-4">
              <Avatar size={80} icon={<UserOutlined />} />
            </div>
            <Title level={4}>{profile.name}</Title>
            <Paragraph>{profile.jobTitle}</Paragraph>
            <Divider />
            <Button 
              danger 
               
              icon={<LogoutOutlined />} 
              onClick={() => setShowLogoutModal(true)}
            >
              Sign Out
            </Button>
          </Card>
        </Col>

        <Col span={16}>
          <Card className="mb-6">
            <Title level={4}>Profile Information</Title>
            <Paragraph className="text-gray-500 mb-4">
              Update your account profile details
            </Paragraph>
            
            <Form
              name="profile"
              layout="vertical"
              requiredMark={false}
              initialValues={profile}
              onFinish={handleProfileUpdate}
            >
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full Name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input disabled placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="jobTitle"
                label="Job Title"
                rules={[{ required: true, message: 'Please enter your job title' }]}
              >
                <Input placeholder="Job Title" />
              </Form.Item>

              <Form.Item>
                <Button 
                   
                  htmlType="submit" 
                  loading={isProfileLoading}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card>
            <Title level={4}>Change Password</Title>
            <Paragraph className="text-gray-500 mb-4">
              Ensure your account is using a secure password
            </Paragraph>
            
            <Form
              id="password-form"
              name="password"
              layout="vertical"
              requiredMark={false}
              onFinish={handlePasswordUpdate}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please enter your current password' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Current Password" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
              </Form.Item>

              <Form.Item>
                <Button 
                   
                  htmlType="submit" 
                  loading={isPasswordLoading}
                >
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Sign Out"
        open={showLogoutModal}
        onOk={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        okText="Sign Out"
        cancelText="Cancel"
      >
        <p>Are you sure you want to sign out from your account?</p>
      </Modal>
    </div>
  );
};

export default AccountPage;