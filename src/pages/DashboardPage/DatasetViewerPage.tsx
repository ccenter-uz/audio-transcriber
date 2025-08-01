import { useEffect, useState } from "react";
import {
  Table,
  Select,
  Switch,
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Input,
  message,
} from "antd";
import { useDatasetViewer } from "@/features/transcripts/hooks/useDatasetViewer";
import { useUserList } from "@/features/transcripts/hooks/useUserList";
import {
  transcriptApi,
  type DatasetViewerItem,
  type DatasetViewerResponse,
} from "@/features/transcripts/api/transcriptApi";
import { WarningOutlined, EditFilled } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Link } from "react-router-dom";
import Modal from "antd/es/modal/Modal";
import debounce from "lodash/debounce";

const { Title } = Typography;

const REPORT_TAGS = {
  BAD_AUDIO: "Eshitib bo‘lmaydigan",
  FULL_RUSSIAN: "Bo'lak ≥ 80 % ruscha",
  SILENCE: "2 soniyadan uzun sukunat",
  MISSING_AUDIO: "Bo‘sh yoki buzilgan fayl",
  MISSING_TEXT: "Matn yo‘q",
  OTHER: "Boshqa",
};

const AudioPlayer = ({
  url,
  className,
}: {
  url: string;
  className?: string;
}) => (
  <audio
    controls
    src={url}
    className={`w-full max-w-[500px] min-w-[300px] ${className || ""}`}
    controlsList="nodownload"
    style={{
      borderRadius: "0.5rem",
      backgroundColor: "transparent",
    }}>
    Your browser does not support the audio element.
  </audio>
);

const DatasetViewerPage = () => {
  const [userId, setUserId] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [showReported, setShowReported] = useState(false);
  const [showRu, setShowRu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSentenceModalOpen, setIsSentenceModalOpen] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentChunk, setCurrentChunk] = useState<number>();
  const [editSentence, setEditSentence] = useState<string>("");
  const [reportReason, setReportReason] = useState<string | null>(null);
  const pageSize = 10;

  // Get user id and role from localStorage
  const storedUserId = localStorage.getItem("user-id");
  const storedUserRole = localStorage.getItem("user-name");

  // If user id is not set, use the stored user id
  useEffect(() => {
    if (storedUserRole !== "admin" && storedUserId) {
      setUserId(storedUserId);
    }
  }, [storedUserRole, storedUserId]);

  // If storedRole is admin, and then use useUserList hook working
  const { data: userData, isLoading: isLoadingUsers } = useUserList({
    name: searchText,
    limit: 50,
  });

  const { data, isLoading, refetch } = useDatasetViewer({
    user_id: userId || undefined,
    report: showReported,
    ru: showRu,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize, 
  }) as {
    data: DatasetViewerResponse | undefined;
    isLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refetch: () => Promise<any>;
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchText(value);
  }, 500);

  const openSentenceModal = (sentence: string) => {
    setSelectedSentence(sentence);
    setIsSentenceModalOpen(true);
  };
  const openEditModal = (sentence: string, currentChunk: number, reportText: string | undefined) => {
    setEditSentence(sentence);
    setReportReason(reportText || "");
    setCurrentChunk(currentChunk);
    setIsEditModalOpen(true);
  };

  const handleEditSentence = async () => {
    if (!currentChunk) {
      console.error("Current chunk is not set");
      return;
    }
    await transcriptApi.updateTranscript(currentChunk, {
      transcribe_text:  editSentence,
      report_text: editSentence ? null : reportReason,
    });
    await refetch(); // Refetch audio segments to get updated status
    message.success("Transkript muvaffaqiyatli yangilandi");
    setIsEditModalOpen(false);
    setEditSentence("");
    setCurrentChunk(undefined);
  };

  useEffect(() => {
    if (reportReason) {
      setEditSentence("");
    }
  }, [reportReason]);

  const columns: TableProps<DatasetViewerItem>["columns"] = [
    {
      title: "Transcriber",
      key: "transcriber",
      width: 300,
      render: (record: DatasetViewerItem) => (
        <Link
          className="text-blue-500"
          to={`/dashboard/${record.transcriber_id}`}>
          {record.transcriber}
        </Link>
      ),
    },
    {
      title: "Chunk Info",
      key: "chunk",
      width: 400,

      render: (record: DatasetViewerItem) => (
        <Space direction="vertical" size="small">
          <div>ID: {record.chunk_id}</div>
          <AudioPlayer url={record.chunk_url} className="max-w-[150px]" />
        </Space>
      ),
    },
    {
      title: "Context",
      key: "context",
      render: (record: DatasetViewerItem) => (
        <Space direction="vertical" size="small" className="w-full">
          {!record.report_text && (
            <>
              <div className="text-gray-500">
                Previous: {record.previous_text}
              </div>
              <div className="flex justify-center items-center">
                <p className="text-left w-full font-medium mb-0 p-0">
                  {record.text || "No context available"}
                </p>

                <Button
                  className=""
                  aria-label="Edit Sentence"
                  type="text"
                  icon={<EditFilled className="text-blue-500" />}
                  onClick={() =>
                    openEditModal(record.text || "", record.chunk_id, record.report_text)
                  }></Button>
              </div>
              <div className="text-gray-500">Next: {record.next_text}</div>
            </>
          )}
          {record.report_text && (
            <div className="mt-2">
              <Tag color="error" icon={<WarningOutlined />}>
                Reported Issue
              </Tag>
              <div className="text-red-500 text-sm mt-1">
                {record.report_text}
              </div>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Time Spent (Format: MM:SS)",
      dataIndex: "minutes_spent",
      key: "minutes_spent",
      width: 250,
      align: "center",
      // Convert 1.5 to "1 minute 30 seconds"
      render: (minutes: number) => {
        const minutesInt = Math.floor(minutes);
        const seconds = (minutes - minutesInt) * 60;
        return (
          <strong>
            {minutesInt > 0 ? `${minutesInt}` : "0"}
            {":"}
            {seconds > 0
              ? `${
                  Number(seconds.toFixed(0)) >= 10
                    ? seconds.toFixed(0)
                    : "0" + seconds.toFixed(0)
                }`
              : "0"}
          </strong>
        );
      },
    },
    {
      title: "Emotion",
      dataIndex: "emotion",
      key: "emotion",
      width: 200,
      render: (emotion: string) => (
        <Tag color="blue" style={{ textTransform: "capitalize" }}>
          {emotion ? emotion : "Unknown"}
        </Tag>
      ),
    },
    {
      title: "Full Sentence",
      dataIndex: "sentence",
      key: "sentence",
      width: 200,
      render: (sentence: string) => (
        <Button type="primary" onClick={() => openSentenceModal(sentence)}>
          Read Full Sentence
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Dataset Viewer</Title>

      <Card>
        <div className="flex w-full justify-between gap-4 mb-4">
          {storedUserRole === "admin" && (
            <Select
              showSearch
              placeholder="Select User"
              optionFilterProp="children"
              value={userId || undefined}
              onChange={setUserId}
              onSearch={debouncedSearch}
              loading={isLoadingUsers}
              allowClear
              style={{ width: 450 }}
              options={userData?.users?.map((user) => ({
                value: user.agent_id,
                label: `${user.name} (${user.service_name})`,
              }))}
              filterOption={false}
            />
          )}
          <Space>
            <span>Show Reported Only:</span>
            <Switch checked={showReported} onChange={setShowReported} />
          </Space>
          <Space>
            <span>Show RU Only:</span>
            <Switch checked={showRu} onChange={setShowRu} />
          </Space>
        </div>

        <Table<DatasetViewerItem>
          columns={columns}
          dataSource={data?.data ?? []}
          rowKey={(record) => `${record?.audio_id}-${record?.chunk_id}`}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.total ?? 0,
            showTotal: (total) => (
              <span>
                Total: <strong>{total}</strong>
              </span>
            ),
            onChange: setCurrentPage,
            showSizeChanger: false,
          }}
        />
      </Card>

      <Modal
        title={` Full Sentence`}
        visible={isSentenceModalOpen}
        onCancel={() => setIsSentenceModalOpen(false)}
        footer={null}
        width={1000}>
        <Typography.Paragraph className="text-xl">
          {selectedSentence}
        </Typography.Paragraph>
      </Modal>
      <Modal
        title={`Edit or Report`}
        visible={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={1000}>
        <Input.TextArea
          rows={2}
          value={editSentence}
          onChange={(e) => setEditSentence(e.target.value)}
        />
        <hr className="my-4"/>
        <Select
          value={reportReason}
          onChange={setReportReason}
          placeholder="Select a reason for reporting"
          options={Object.keys(REPORT_TAGS).map((tag) => ({
            value: tag,
            label: `[${tag}] ${REPORT_TAGS[tag as keyof typeof REPORT_TAGS]}`,
          }))}
          className="w-full"
        />
        <Button type="primary" className="mt-4" onClick={handleEditSentence}>
          Save Changes
        </Button>
      </Modal>
    </div>
  );
};

export default DatasetViewerPage;
