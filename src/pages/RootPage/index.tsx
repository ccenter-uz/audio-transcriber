import { Button, Typography } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/lib/auth.tsx";

const { Title } = Typography;

const RootPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = async () => {
    navigate(`/transcribe`);
  };

  if (user?.role === "admin") {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="transcribe-hero"></div>
      <Title level={3} className="mb-8">
        Ready to start transcribing?
      </Title>

      <>
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleFilled size={44} />}
          onClick={handleStart}
          style={{ width: "74px", height: "74px" }}
          className="flex items-center justify-center rounded-full text-2xl bg-blue-400"
        />
        <p className="mt-4 text-gray-600">
          Click to begin your next audio transcription
        </p>
      </>
    </div>
  );
};

export default RootPage;
