import { Card, Spin, Typography } from 'antd';
import { useDashboardStats } from '@/features/transcripts/hooks/useDashboardStats';
import { useAuth } from '@/shared/lib/auth.tsx';

const { Title } = Typography;

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading, error, isError } = useDashboardStats();
  // const navigate = useNavigate();

  console.log('Dashboard Data:', { data, isLoading, error, user });

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">Not authenticated</p>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">Admin access required</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">Error loading dashboard data: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Title level={2}>Admin Dashboard</Title>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Total Audio Files</p>
            <p className="text-2xl font-semibold text-blue-600">
              {data?.audioStats?.length || 0}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Total Segments</p>
            <p className="text-2xl font-semibold text-green-600">
              {data?.audioStats?.reduce((sum, file) => sum + file.total_segments, 0) || 0}
            </p>
            <p className="text-sm text-gray-500">
              Across all files
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Completed Segments</p>
            <div>
              <p className="text-2xl font-semibold text-purple-600">
                {data?.audioStats?.reduce((sum, file) => sum + file.completed_segments, 0) || 0}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(
                  (data?.audioStats?.reduce((sum, file) => sum + file.completed_segments, 0) || 0) /
                  (data?.audioStats?.reduce((sum, file) => sum + file.total_segments, 0) || 1) * 100
                )}% Complete
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">In Progress</p>
            <p className="text-2xl font-semibold text-orange-500">
              {data?.audioStats?.filter(file => file.percent > 0 && file.percent < 100).length || 0}
            </p>
            <p className="text-sm text-gray-500">
              Files being processed
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      </div>
    </div>
  );
};

export default DashboardPage;