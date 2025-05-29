import { useState } from "react";
import {
  Table,
  Input,
  Switch,
  Card,
  Typography,
  Tooltip,
  Space,
  Tag,
} from "antd";
import { useDatasetViewer } from "@/features/transcripts/hooks/useDatasetViewer";
import {
  type DatasetViewerItem,
  type DatasetViewerResponse,
} from "@/features/transcripts/api/transcriptApi";
import { SearchOutlined, WarningOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

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
  const [showReported, setShowReported] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useDatasetViewer({
    user_id: userId || undefined,
    report: showReported,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize,
  }) as { data: DatasetViewerResponse | undefined; isLoading: boolean };

  const columns: TableProps<DatasetViewerItem>["columns"] = [
    {
      title: "Transcriber",
      key: "transcriber",
      width: 300,
      render: (record: DatasetViewerItem) => (
        <Link className="text-blue-500" to={`/dashboard/${record.transcriber_id}`}>{record.transcriber}</Link>
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
              <div className="font-medium">{record.text}</div>
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
      title: "Full Sentence",
      dataIndex: "sentence",
      key: "sentence",
      ellipsis: { showTitle: false },
      render: (sentence: string) => (
        <Tooltip placement="topLeft" title={sentence}>
          {sentence}
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Dataset Viewer</Title>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Filter by User ID"
            prefix={<SearchOutlined />}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Space>
            <span>Show Reported Only:</span>
            <Switch checked={showReported} onChange={setShowReported} />
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
            onChange: setCurrentPage,
            showSizeChanger: false,
          }}
        />
      </Card>
    </div>
  );
};

export default DatasetViewerPage;
