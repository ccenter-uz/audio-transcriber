import { Card, Spin, Table, Typography } from 'antd';
import { useDashboardStats } from '@/features/transcripts/hooks/useDashboardStats';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';
import type { UserPerformance } from '@/features/transcripts/types';
import { useAuth } from '@/shared/lib/auth.tsx';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const STATUS_COLORS = {
  reviewed: '#52c41a',
  in_progress: '#1890ff',
  error: '#ff4d4f',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading, error, isError } = useDashboardStats();
  const navigate = useNavigate();

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

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: UserPerformance) => (
        <span 
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/dashboard/${record.id}`)}
        >
          {name}
        </span>
      ),
    },
    {
      title: 'Reviewed Count',
      dataIndex: 'reviewedCount',
      key: 'reviewedCount',
      sorter: (a: UserPerformance, b: UserPerformance) =>
        a.reviewedCount - b.reviewedCount,
    },
    {
      title: 'Average Edit Time',
      dataIndex: 'averageEditTime',
      key: 'averageEditTime',
      render: (time: number) => `${time} mins`,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Admin Dashboard</Title>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Total Reviewed</p>
            <p className="text-2xl font-semibold text-blue-600">
              {data?.totalReviewed}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">In Progress</p>
            <p className="text-2xl font-semibold text-green-600">
              {data?.inProgress}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Errored Files</p>
            <p className="text-2xl font-semibold text-red-600">
              {data?.erroredFiles}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Active Transcribers</p>
            <p className="text-2xl font-semibold text-purple-600">
              {data?.activeTranscribers}
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <Title level={4}>7-Day Trend</Title>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => dayjs(date).format('MMM D')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => dayjs(date).format('MMM D, YYYY')}
                />
                <Area
                  type="monotone"
                  dataKey="reviewed"
                  stackId="1"
                  stroke={STATUS_COLORS.reviewed}
                  fill={STATUS_COLORS.reviewed}
                  fillOpacity={0.3}
                  name="Reviewed"
                />
                <Area
                  type="monotone"
                  dataKey="inProgress"
                  stackId="1"
                  stroke={STATUS_COLORS.in_progress}
                  fill={STATUS_COLORS.in_progress}
                  fillOpacity={0.3}
                  name="In Progress"
                />
                <Area
                  type="monotone"
                  dataKey="error"
                  stackId="1"
                  stroke={STATUS_COLORS.error}
                  fill={STATUS_COLORS.error}
                  fillOpacity={0.3}
                  name="Error"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card>
          <Title level={4}>Status Distribution</Title>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  label={(entry) => entry.status}
                >
                  {data?.statusDistribution.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status]}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* User Performance Table */}
      <Card>
        <Title level={4}>User Performance</Title>
        <Table
          dataSource={data?.userPerformance}
          columns={userColumns}
          rowKey="id"
          className="mt-4"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;