import { useState } from "react";
import { Card, DatePicker, Spin, Typography } from "antd";
import { useDashboardStats } from "@/features/transcripts/hooks/useDashboardStats";
import { useAuth } from "@/shared/lib/auth.tsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardLineGraphStats } from "@/features/transcripts/hooks/useDashboardStatsGraph";
import dayjs from "dayjs";

const { Title } = Typography;

const dateFormat = "YYYY-MM-DD";

const DashboardPage = () => {
  const [fromDate, setFromDate] = useState<string>(
    new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split("T")[0]
  ); // Default to 7 days ago
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0] // Default to today
  );

  const { user } = useAuth();
  const { data, isLoading, error, isError } = useDashboardStats();
  const {
    data: lineGraphData,
    isLoading: isLineGraphLoading,
    error: lineGraphError,
    isError: isLineGraphError,
  } = useDashboardLineGraphStats({
    fromDate, // Default to 7 days ago
    toDate, // Default to today
  });
  // const navigate = useNavigate();

  console.log("Dashboard Data:", { data, isLoading, error, user });
  console.log("Line Graph Data:", {
    lineGraphData,
    isLineGraphLoading,
    lineGraphError,
    isLineGraphError,
  });

  if (!user) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">Not authenticated</p>
      </div>
    );
  }

  if (user.role !== "admin") {
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
        <p className="text-red-500">
          Error loading dashboard data: {error?.message || "Unknown error"}
        </p>
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
              {data?.total_audio_files}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Total Segments</p>
            <p className="text-2xl font-semibold text-green-600">
              {data?.total_segments}
            </p>
            <p className="text-sm text-gray-500">Across all files</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Completed Segments</p>
            <div>
              <p className="text-2xl font-semibold text-purple-600">
                {data?.completed_segments}
              </p>
              <p className="text-sm text-gray-500">
                { Math.round((data?.completed_segments / data?.total_segments) * 100) }%{" "}
                <span className="text-gray-400">Complete</span>
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">In Progress</p>
            <p className="text-2xl font-semibold text-orange-500">
              {data?.processing_audio}
            </p>
            <p className="text-sm text-gray-500">Files being processed</p>
          </div>
        </Card>
      </div>

      <div className="w-full h-[500px]">
        {/* Line Graph header with title and date picker from and to */}
        <div className="flex items-center justify-between mb-4">
          <Title level={3}>Audio Processing Trends</Title>
          <div className="flex items-center">
            <DatePicker.RangePicker
              format={dateFormat}
              defaultValue={[
                dayjs(fromDate, dateFormat),
                dayjs(toDate, dateFormat),
              ]}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setFromDate(dates[0].toISOString().split("T")[0]);
                  setToDate(dates[1].toISOString().split("T")[0]);
                }
              }}
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={
              lineGraphData?.map((item) => ({
                ...item,
                expexected_result:
                  Math.round(item.active_operators * 560) - item.invalid_chunks,
              })) || []
            }
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="state_date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="expexected_result"
              stroke="blue"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="done_chunks"
              stroke="#82ca9d"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="invalid_chunks"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
