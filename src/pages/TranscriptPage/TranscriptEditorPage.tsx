import { useState, useRef, useMemo, useEffect } from "react";
import { Button, Tooltip, Input, Modal, message, Typography, Tag } from "antd";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import {
  ArrowRightOutlined,
  NotificationFilled,
  UpOutlined,
  DownOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAudioSegments } from "@/features/transcripts/hooks/useAudioSegments";
import { Link } from "react-router-dom";
import { type AudioSegment } from "@/features/transcripts/api/transcriptApi";
import { transcriptApi } from "@/features/transcripts/api/transcriptApi";
import "react-h5-audio-player/lib/styles.css";
import "tailwindcss/tailwind.css";
import { useAuth } from "@/shared/lib/auth.tsx";
const CURRENT_CHUNK_KEY = "current_chunk";
const { TextArea } = Input;
const { Title } = Typography;

const STATUS_LABELS = {
  done: "Tugallangan",
  in_progress: "Jarayonda",
  invalid: "Noto'g'ri",
  ready: "Tayyor",
};

export default function TranscriptionEditor() {
  const [currentChunk, setCurrentChunk] = useState(1);
  const [transcription, setTranscription] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const playerRef = useRef<AudioPlayer>(null);
  const chunkListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // Assuming you have a useAuth hook to get user info

  const { data, isLoading, error, refetch } = useAudioSegments(user?.id);

  const chunks = useMemo(
    () => data?.audio_segments || [],
    [data?.audio_segments]
  );
  const VISIBLE_CHUNKS = 5;

  // Show no audio modal if data is loaded but empty
  const showNoAudioModal = !isLoading && !error && chunks.length === 0;

  const handleTranscriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setTranscription(value);
  };

  const handleFinish = async () => {
    try {
      // Save the last transcript if it exists
      if (transcription.trim()) {
        await transcriptApi.updateTranscript(chunks[currentChunk - 1].id, {
          transcribe_text: transcription,
        });
      }

      // Clear both audio_id and current chunk from localStorage
      localStorage.removeItem("audio_id");
      localStorage.removeItem(CURRENT_CHUNK_KEY);

      // Reload the page to reflect changes
      refetch();
    } catch (err) {
      console.error("Failed to finish transcription process:", err);
      message.error("Transkriptsiya jarayonini yakunlashda xatolik yuz berdi");
    }
  };

  const handleNext = async () => {
    if (currentChunk < chunks.length) {
      if (transcription.trim()) {
        console.log("Current transcription:", transcription);
        try {
          setIsSubmitting(true);
          handleScrollDown();
          await transcriptApi.updateTranscript(chunks[currentChunk - 1].id, {
            transcribe_text: transcription,
            report_text: null, // Clear report text if transcription is provided
          });
          await refetch(); // Refetch audio segments to get updated status
          message.success("Transkript muvaffaqiyatli saqlandi");
          // Only navigate after successful save
          setTranscription("");
          if (playerRef.current?.audio?.current) {
            playerRef.current.audio.current.currentTime = 0;
          }
        } catch (err) {
          console.error("Failed to save transcript:", err);
          message.error("Transkriptni saqlashda xatolik yuz berdi");
          return; // Don't navigate if save failed
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // If no transcription, just navigate
        handleScrollDown();
        setTranscription("");
        if (playerRef.current?.audio?.current) {
          playerRef.current.audio.current.currentTime = 0;
        }
      }
    } else {
      setIsFinished(true);
      setShowFinishModal(true);
    }
  };

  const handleChunkClick = (index: number) => {
    const absoluteIndex = startIndex + index + 1;
    setCurrentChunk(absoluteIndex);
    // Reset states - they will be updated by the useEffect
    setTranscription("");
    setReportText("");
    if (playerRef.current?.audio?.current) {
      playerRef.current.audio.current.currentTime = 0;
    }
  };

  const handleScrollDown = () => {
    if (currentChunk < chunks.length) {
      const newCurrentChunk = currentChunk + 1;
      setCurrentChunk(newCurrentChunk);
      // Update startIndex to keep current chunk in view
      if (newCurrentChunk > startIndex + VISIBLE_CHUNKS) {
        setStartIndex(Math.min(chunks.length - VISIBLE_CHUNKS, startIndex + 1));
      }
      setTranscription("");
      if (playerRef.current?.audio?.current) {
        playerRef.current.audio.current.currentTime = 0;
      }
    }
  };

  const handleScrollUp = () => {
    if (currentChunk > 1) {
      const newCurrentChunk = currentChunk - 1;
      setCurrentChunk(newCurrentChunk);
      // Update startIndex to keep current chunk in view
      if (newCurrentChunk <= startIndex) {
        setStartIndex(Math.max(0, startIndex - 1));
      }
      setTranscription("");
      if (playerRef.current?.audio?.current) {
        playerRef.current.audio.current.currentTime = 0;
      }
    }
  };

  const handleReportSubmit = async () => {
    if (!chunks[currentChunk - 1] || !reportText) return;

    try {
      setIsSubmitting(true);
      await transcriptApi.updateTranscript(chunks[currentChunk - 1].id, {
        report_text: reportText,
        transcribe_text: null, // Clear transcription text if reporting an issue
      });
      await refetch(); // Refetch audio segments to get updated status
      message.success("Hisobot muvaffaqiyatli yuborildi");
      setIsModalOpen(false);
      setReportText("");
      handleNext();
    } catch (err) {
      console.error("Failed to submit report:", err);
      message.error("Hisobotni yuborishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render chunk buttons
  const renderChunkButton = (chunk: AudioSegment, index: number) => {
    const absoluteIndex = startIndex + index + 1;
    const isActive = currentChunk === absoluteIndex;

    return (
      <Tooltip
        placement="left"
        title={STATUS_LABELS[chunk.status as keyof typeof STATUS_LABELS]}
        key={chunk.id}>
        <Button
          type="primary"
          onClick={() => handleChunkClick(index)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-medium transition-all duration-200 hover:scale-110 ${
            isActive
              ? "bg-blue-600 text-white shadow-lg"
              : chunk.status === "done"
              ? "bg-green-500 text-white"
              : chunk.status === "invalid"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}>
          {absoluteIndex}
        </Button>
      </Tooltip>
    );
  };

  // Fetch transcript details when chunk changes
  useEffect(() => {
    const fetchTranscriptDetails = async () => {
      if (!chunks[currentChunk - 1]) return;

      try {
        const transcript = await transcriptApi.getTranscript(
          chunks[currentChunk - 1].id
        );
        // Set transcription text if it exists
        if (transcript.transcribe_text) {
          setTranscription(transcript.transcribe_text);
        } else if (transcript.ai_text) {
          // If no transcription but AI text exists, use that
          setTranscription(transcript.ai_text);
        } else {
          setTranscription("");
        }
        // Set report text if it exists
        if (transcript.report_text) {
          setReportText(transcript.report_text);
        } else {
          setReportText("");
        }

        // Save current chunk ID
        localStorage.setItem(
          CURRENT_CHUNK_KEY,
          chunks[currentChunk - 1].id.toString()
        );
      } catch (err) {
        console.error("Failed to fetch transcript details:", err);
        message.error("Transkript tafsilotlarini yuklashda xatolik yuz berdi");
      }
    };

    fetchTranscriptDetails();
  }, [currentChunk, chunks]);

  // Load saved chunk position when data is loaded
  useEffect(() => {
    if (chunks.length > 0) {
      const savedChunk = localStorage.getItem(CURRENT_CHUNK_KEY);
      if (savedChunk) {
        const chunkIndex = chunks.findIndex(
          (chunk: { id: { toString: () => string } }) =>
            chunk.id.toString() === savedChunk
        );
        if (chunkIndex !== -1) {
          setCurrentChunk(chunkIndex + 1); // +1 because currentChunk is 1-based
          setStartIndex(
            Math.floor(chunkIndex / VISIBLE_CHUNKS) * VISIBLE_CHUNKS
          );
        }
      }
    }
  }, [chunks]);

  // Open the ready status chunk as default when all chunks are done open the last chunk
  useEffect(() => {
    
    if (chunks.length > 0) {
      const readyChunk = chunks.findIndex(
        (chunk: { status: string }) => chunk.status === "ready"
      );

      const isAllDone = chunks.every(
        (chunk: { status: string }) => chunk.status === "done"
      );

      if (readyChunk !== -1) {
        setCurrentChunk(readyChunk + 1);
        setStartIndex(Math.floor(readyChunk / VISIBLE_CHUNKS) * VISIBLE_CHUNKS);
      } else if (isAllDone) {
        // If all chunks are done, set to the last chunk
        setCurrentChunk(chunks.length);
        setStartIndex(Math.floor((chunks.length - 1) / VISIBLE_CHUNKS) * VISIBLE_CHUNKS);
      } else {
        // If no ready chunk, set to the first chunk
        setCurrentChunk(1);
        setStartIndex(0);
      }
    }

  }, [chunks]);

  return (
    <div className="mt-[-120px] flex flex-col min-h-screen justify-between bg-gray-50">
      {/* Centered Input */}
      <div className="flex-grow flex flex-col items-center justify-center w-1/2 m-auto px-4">
        <Title
          level={2}
          className="flex items-center justify-between w-full text-bg-dark-800">
          {chunks[currentChunk - 1]?.id}-Audio{" "}
          <Tag
            color={
              chunks[currentChunk - 1]?.status === "done"
                ? "green"
                : chunks[currentChunk - 1]?.status === "invalid"
                ? "red"
                : "blue"
            }>
            {STATUS_LABELS[
              chunks[currentChunk - 1]?.status as keyof typeof STATUS_LABELS
            ]?.toUpperCase()}
          </Tag>
        </Title>

        <TextArea
          className="shadow-lg p-4 text-lg resize-none"
          placeholder="Tinglagan so'zni yozing..."
          value={transcription}
          onChange={handleTranscriptionChange}
          autoSize={{ minRows: 4, maxRows: 8 }}
          bordered={false}
          style={{
            backgroundColor: "white",
            fontSize: "32px",
            lineHeight: "1.5",
            borderRadius: "0.75rem",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />
      </div>

      {/* Right-hand Chunk Status */}
      <div
        ref={chunkListRef}
        className="chunk-list fixed bottom-1/3 right-6 flex flex-col gap-3">
        {chunks.length > VISIBLE_CHUNKS && (
          <Button
            shape="circle"
            icon={<UpOutlined />}
            onClick={handleScrollUp}
            disabled={currentChunk <= 1}
            style={{ width: "40px", height: "40px" }}
          />
        )}
        {chunks
          .slice(startIndex, startIndex + VISIBLE_CHUNKS)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((chunk: any, index: number) => renderChunkButton(chunk, index))}
        {chunks.length > VISIBLE_CHUNKS && (
          <div className="flex flex-col gap-2 mt-2">
            <Button
              icon={<DownOutlined />}
              shape="circle"
              onClick={handleScrollDown}
              disabled={currentChunk >= chunks.length}
              style={{ width: "40px", height: "40px" }}
            />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between gap-4 px-6 py-6 border-t w-full">
        <div className="flex justify-between items-center w-full">
          <Button
            danger
            shape="round"
            size="large"
            onClick={() => setIsModalOpen(true)}
            icon={<NotificationFilled />}
            className="hover:scale-105 transition-transform">
            Xabar berish
          </Button>

          <div className="flex w-[50%] justify-center">
            <AudioPlayer
              ref={playerRef}
              src={chunks[currentChunk - 1]?.file_path}
              customControlsSection={[
                RHAP_UI.MAIN_CONTROLS,
                RHAP_UI.ADDITIONAL_CONTROLS,
                RHAP_UI.VOLUME_CONTROLS,
              ]}
              autoPlayAfterSrcChange={true}
              showJumpControls={false}
              style={{
                backgroundColor: "transparent",
                boxShadow: "none",
                width: "100%",
                borderRadius: "1rem",
              }}
              progressJumpSteps={{ backward: 5000, forward: 5000 }}
            />
          </div>

          <Button
            type="primary"
            shape="round"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={handleNext}
            disabled={transcription.length === 0 && reportText.length === 0}
            loading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200">
            {isFinished ? "Tugatish" : "Keyingisi"}
          </Button>
        </div>
      </div>

      {/* No Audio Modal */}
      <Modal
        title="Audio mavjud emas"
        open={showNoAudioModal}
        footer={[
          <Button key="home" type="primary">
            <Link to="/">Bosh sahifaga o'tish</Link>
          </Button>,
        ]}
        closable={false}
        maskClosable={false}>
        <p>Transkriptsiya uchun audio qismlar mavjud emas.</p>
        <p>Yangi transkriptsiyani boshlash uchun bosh sahifaga qayting.</p>
      </Modal>

      {/* Finish Modal */}
      <Modal
        title="Transkriptsiyani yakunlash"
        open={showFinishModal}
        onCancel={() => setShowFinishModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowFinishModal(false)}>
            Tahrirlashni davom ettirish
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleFinish}
            loading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200">
            Yakunlash va yangisini boshlash
          </Button>,
        ]}>
        <p>Siz joriy audio qismlar oxiriga yetib keldingiz.</p>
        <p>Ushbu transkriptsiyani yakunlab, yangisini boshlamoqchimisiz?</p>
      </Modal>

      {/* Report Issue Modal */}
      <Modal
        title="Xabar berish"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            danger
            onClick={() => setIsModalOpen(false)}
            disabled={isSubmitting}>
            Bekor qilish
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
            onClick={handleReportSubmit}
            loading={isSubmitting}
            disabled={!reportText}>
            Yuborish
          </Button>,
        ]}>
        <p>Bu qism haqida muammo bormi?</p>
        <TextArea
          placeholder="Muammoni tavsiflang..."
          rows={4}
          className="mt-4"
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          disabled={transcription.length > 0}
        />
        {transcription.length > 0 && (
          <p className="text-red-500 mt-2">
            Transkript qilingan qism uchun muammo xabar qilib bo'lmaydi
          </p>
        )}
      </Modal>
    </div>
  );
}
