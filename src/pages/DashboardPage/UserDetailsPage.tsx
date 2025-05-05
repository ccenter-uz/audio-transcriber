import { Card, Spin, Typography, Select } from "antd";
import { useParams, Navigate } from "react-router-dom";
import { useUserStats } from "@/features/transcripts/hooks/useUserStats";
import { useAuth } from "@/shared/lib/auth.tsx";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useEffect, useState } from "react";

const { Title } = Typography;

const UserDetailsPage = () => {
  const { userId } = useParams();
  const { data, isLoading, error } = useUserStats(userId);
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [heatmapData, setHeatmapData] = useState<
    { date: string; count: number }[]
  >([]);

  useEffect(() => {
    if (data) {
      const parsedData = JSON.parse(data.daily_chunks);
      const formattedData = Object.entries(parsedData).map(([date, count]) => ({
        date,
        count: count as number,
      }));

      setHeatmapData(formattedData);
    }
  }, [data]);

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
        <p className="text-red-500">Foydalanuvchi ma'lumotlarini yuklashda xatolik</p>
      </div>
    );
  }

  const yearOptions = [
    { value: 2025, label: "2025" },
    { value: 2024, label: "2024" },
  ];

  return (
    <div className="space-y-6">
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
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
          />
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
              if (value.count <= 2) return "color-scale-1";
              if (value.count <= 4) return "color-scale-2";
              if (value.count <= 6) return "color-scale-3";
              return "color-scale-4";
            }}
            showWeekdayLabels={true}
            showMonthLabels={true}
            tooltipDataAttrs={() => {
              return { rx: "1", ry: "1" };
            }}
            weekdayLabels={[
              "", "Du", "", "Cho", "", "Ju", "",
            ]}
            titleForValue={(value) => {
              if (!value) return "Bo'laklar yo'q";
              return `${value.date} sanasida ${value.count} ta bo'lak`;
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default UserDetailsPage;
