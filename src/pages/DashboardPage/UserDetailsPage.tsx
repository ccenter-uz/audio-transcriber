import { Card, DatePicker, Spin, Typography } from "antd";
import { useParams, Navigate } from "react-router-dom";
import { useUserStats } from "@/features/transcripts/hooks/useUserStats";
import { useAuth } from "@/shared/lib/auth.tsx";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useEffect, useState } from "react";
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
import { useHourlyStats } from "@/features/transcripts/hooks/useDashboardStatsGraph";
import dayjs from "dayjs";
const { Title } = Typography;
const dateFormat = "YYYY-MM-DD";

interface HourlyStatsInterface {
  hour_range: string;
  count: number;
}

const UserDetailsPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  const [date, setDate] = useState<string>(
    dayjs(new Date()).format(dateFormat)
  );
  const [heatmapData, setHeatmapData] = useState<
    { date: string; count: number }[]
  >([]);
  const [hourlyStats, setHourlyStats] = useState<HourlyStatsInterface[]>([]);

  const { data, isLoading, error } = useUserStats(userId);
  const { data: hourlyStatsResponse } = useHourlyStats(
    userId ? { userId, date: date } : { userId: "", date: date }
  );

  useEffect(() => {
    if (data) {
      const parsedData = JSON.parse(data.daily_chunks);
      const formattedData = Object.entries(parsedData).map(([date, count]) => ({
        date,
        count: count as number,
      }));

      console.log("Heatmap Data:", formattedData);

      setHeatmapData(formattedData);
    }
  }, [data]);

  // Prepare hourly stats data for the graph which describes the user's activity in 24 hours
  useEffect(() => {
    const fullDay = Array.from({ length: 24 }, (_, i) => ({
      hour_range: `${i < 10 ? "0" : ""}${i}:00`,
      count: 0,
    }));

    if (userId && hourlyStatsResponse?.length === 1) {
      const userStats = hourlyStatsResponse[0];
      const dailyTranscripts = userStats.daily_transcripts || [];

      dailyTranscripts.forEach((item) => {
        const hourIndex = parseInt(item.hour_range.split(":")[0], 10);
        if (fullDay[hourIndex]) {
          fullDay[hourIndex].count += item.count;
        }
      });

      setHourlyStats(fullDay);
    }

    // if (userId && h)
  }, [hourlyStatsResponse, userId]);

  // If transcriber is viewing and not their own stats, redirect
  if ((user?.role as string) === "transcriber" && user?.id !== userId) {
    return user && <Navigate to={`/dashboard/${user.id}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">
          Foydalanuvchi ma'lumotlarini yuklashda xatolik
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-auto">
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="text-gray-600 mt-2">
            {data.username}
          </Title>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Jami Audio Fayllar</p>
            <p className="text-2xl font-semibold text-blue-600">
              {data.total_audio_files}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Jami Bo'laklar</p>
            <p className="text-2xl font-semibold text-orange-500">
              {data.total_chunks}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Jami Daqiqa/Soniya</p>
            <p className="text-2xl font-semibold text-green-600">
              {data.total_minutes < 1
                ? `${(data.total_minutes * 60).toFixed(2)} Son`
                : `${data.total_minutes.toFixed(2)} Daq`}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Haftalik Fayllar</p>
            <p className="text-2xl font-semibold text-purple-600">
              {data.weekly_audio_files}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-gray-600">Haftalik Bo'laklar</p>
            <p className="text-2xl font-semibold text-purple-600">
              {data.weekly_chunks}
            </p>
          </div>
        </Card>
      </div>

      {/* Contribution Graph */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Faollik Ko'rsatkichi</Title>
        </div>
        <div className="w-[90%] flex justify-start overflow-x-auto">
          <CalendarHeatmap
            startDate={
              heatmapData[0]?.date ? new Date(heatmapData[0].date) : new Date()
            }
            endDate={new Date()}
            showOutOfRangeDays={true}
            values={heatmapData}
            classForValue={(value) => {
              if (!value || !value.count) return "color-empty";
              if (value.count <= 50) return "color-scale-1";
              if (value.count <= 150) return "color-scale-2";
              if (value.count <= 250) return "color-scale-3";
              if (value.count <= 350) return "color-scale-4";
              return "color-scale-5";
            }}
            showWeekdayLabels={true}
            showMonthLabels={true}
            tooltipDataAttrs={() => {
              return { rx: "1", ry: "1" };
            }}
            weekdayLabels={["", "Du", "", "Cho", "", "Ju", ""]}
            titleForValue={(value) => {
              if (!value) return "Bo'laklar yo'q";
              return `${value.date} sanasida ${value.count} ta bo'lak`;
            }}
          />
        </div>
      </Card>

      <div className="w-full h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <Title level={3}>Audio Processing Trends</Title>
          <div className="flex items-center">
            <DatePicker
              format={dateFormat}
              value={dayjs(date, dateFormat)}
              onChange={(date) => {
                if (date) {
                  setDate(date.format(dateFormat));
                }
              }}
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={hourlyStats}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour_range" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="blue"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserDetailsPage;
