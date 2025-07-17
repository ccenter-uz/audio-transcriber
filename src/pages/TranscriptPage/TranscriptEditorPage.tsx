import { useState, useRef, useMemo, useEffect } from "react";
import { Button, Tooltip, Input, Modal, message, Typography, Tag } from "antd";
import {
  ArrowRightOutlined,
  NotificationFilled,
  UpOutlined,
  DownOutlined,
  CheckCircleOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { useAudioSegments } from "@/features/transcripts/hooks/useAudioSegments";
import { Link } from "react-router-dom";
import { type AudioSegment } from "@/features/transcripts/api/transcriptApi";
import { transcriptApi } from "@/features/transcripts/api/transcriptApi";
import "react-h5-audio-player/lib/styles.css";
import "tailwindcss/tailwind.css";
import { useAuth } from "@/shared/lib/auth.tsx";
import Transliterator from "lotin-kirill";

const CURRENT_CHUNK_KEY = "current_chunk";
const { TextArea } = Input;
const { Title } = Typography;
const transliterator = new Transliterator();

const STATUS_LABELS = {
  done: "Tugallangan",
  in_progress: "Jarayonda",
  invalid: "Noto'g'ri",
  ready: "Tayyor",
};

const REPORT_TAGS = {
  BAD_AUDIO: "Eshitib bo‘lmaydigan",
  FULL_RUSSIAN: "Bo'lak ≥ 80 % ruscha",
  SILENCE: "2 soniyadan uzun sukunat",
  MISSING_AUDIO: "Bo‘sh yoki buzilgan fayl",
};

const TRANSCRIPT_TAGS = {
  INAUDIBLE: "Eshitib bo‘lmaydigan",
  LONG_UNINTELLIGIBLE: "Uzoq tushunarsiz",
  OVERLAP: "Ikki kishi birga gapirishi natijasida so‘zlar ustma‑ust",
  LAUGH: "Kulish",
  MUSIC: "IVR signali yoki musiqa",
  BEEP: "Boshqa aniq shovqin",
  CURSE: "So'kinish",
};

const EMOTION_TAGS = [
  {
    label: "Tabiiy",
    color: "	#9E9E9E",
  },
  {
    label: "Xursand",
    color: "#FFD54F",
  },
  {
    label: "Jahldor",
    color: "#F44336",
  },
  {
    label: "Xafa",
    color: "#2196F3",
  },
  {
    label: "Qo‘rquv",
    color: "#9C27B0",
  },
  {
    label: "Hayrat",
    color: "#FF9800",
  },
  {
    label: "Nafrat",
    color: "#795548",
  },
];

export default function TranscriptionEditor() {
  const [currentChunk, setCurrentChunk] = useState(1);
  const [transcription, setTranscription] = useState("");
  const [emotion, setEmotion] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [reportText, setReportText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [firstKeyPress, setFirstKeyPress] = useState(false);
  const playerRef = useRef<HTMLAudioElement>(null);
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

  const handleTransliterate = (text: string) => {
    return transliterator.toLatin(text);
  };

  const handleTranscriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setTranscription(value);
  };

  const handleKeyDown = () => {
    if (firstKeyPress) return; // Ignore subsequent key presses
    setFirstKeyPress(true);
  };

  const handleFinish = async () => {
    try {
      // Save the last transcript if it exists
      if (transcription.trim()) {
        await transcriptApi.updateTranscript(chunks[currentChunk - 1].id, {
          transcribe_text: transcription,
          emotion: emotion || null, // Save emotion if selected
        });
        message.success("Transkript muvaffaqiyatli saqlandi dsfsdfsd");
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
        try {
          setIsSubmitting(true);
          handleScrollDown();
          await transcriptApi.updateTranscript(chunks[currentChunk - 1].id, {
            transcribe_text: transcription,
            emotion: emotion || null, // Save emotion if selected
            report_text: null, // Clear report text if transcription is provided
          });
          await refetch(); // Refetch audio segments to get updated status
          message.success("Transkript muvaffaqiyatli saqlandi ");
          // Only navigate after successful save
          setTranscription("");
          setEmotion("");
          setFirstKeyPress(false);
          if (playerRef.current) {
            playerRef.current.currentTime = 0;
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
        setEmotion("");
        if (playerRef.current) {
          playerRef.current.currentTime = 0;
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
    setEmotion("");
    setReportText("");
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
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
      setEmotion("");
      if (playerRef.current) {
        playerRef.current.currentTime = 0;
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
      setEmotion("");
      if (playerRef.current) {
        playerRef.current.currentTime = 0;
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
          setEmotion(transcript.emotion || ""); // Set emotion if it exists
        } else if (transcript.ai_text) {
          // If no transcription but AI text exists, use that
          setTranscription(transcript.ai_text);
        } else {
          setTranscription("");
          setEmotion(""); // Reset emotion if no transcription or AI text
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

      const isAllProcessed = chunks.every(
        (chunk: { status: string }) =>
          chunk.status === "done" || chunk.status === "invalid"
      );

      if (readyChunk !== -1) {
        setCurrentChunk(readyChunk + 1);
        setStartIndex(Math.floor(readyChunk / VISIBLE_CHUNKS) * VISIBLE_CHUNKS);
      } else if (isAllProcessed) {
        // If all chunks are done, set to the last chunk
        setCurrentChunk(chunks.length);
        setStartIndex(Math.floor(chunks.length - VISIBLE_CHUNKS));
      } else {
        // If no ready chunk, set to the first chunk
        setCurrentChunk(1);
        setStartIndex(0);
      }
    }
  }, [chunks]);

  useEffect(() => {
    if (firstKeyPress) {
      transcriptApi.startTranscript(chunks[currentChunk - 1]?.id);
      message.info("Transkriptsiya jarayoni boshlandi.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstKeyPress]);

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

        {chunks[currentChunk - 1]?.transcribe_option && (
          <div className="flex w-full rounded-md bg-gray-100 px-[12px] py-[20px] mb-[18px]">
            <BulbOutlined className="text-yellow-500" />
            <span className="ml-2 text-gray-700">
              {chunks[currentChunk - 1]?.transcribe_option}
            </span>
          </div>
        )}

        <TextArea
          className="shadow-lg p-4 text-lg resize-none"
          placeholder="Tinglagan so'zni yozing..."
          value={transcription}
          onChange={handleTranscriptionChange}
          onKeyDown={handleKeyDown}
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

        {/* Generate some useful tags here. Tags:  [INAUDIBLE], [LONG_UNINTELLIGIBLE], [OVERLAP], [LAUGH], [BEEP], [MUSIC]. When user hower the tag, description will be shown */}
        <div className="w-full mt-4 flex flex-row-reverse items-start">
          <Button
            disabled={transcription.length === 0}
            className="mr-4 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              const result = handleTransliterate(transcription);
              setTranscription(result);
            }}>
            Krilldan Lotinga
          </Button>
          <div className="flex flex-wrap gap-2 w-[80%]">
            <Tag
              key={"ru"}
              color="geekblue"
              className="cursor-pointer"
              onClick={() => setTranscription((prev) => `${prev} (ru: ) `)}>
              (ru: ):
              <span className="ml-1 text-sm text-gray-500">Ruscha so‘z</span>
            </Tag>
            {Object.keys(TRANSCRIPT_TAGS).map((tag) => (
              <Tag
                key={tag}
                color="geekblue"
                className="cursor-pointer"
                onClick={() => setTranscription((prev) => `${prev} [${tag}] `)}>
                [{tag}]
                <span className="ml-1 text-sm text-gray-500">
                  {TRANSCRIPT_TAGS[tag as keyof typeof TRANSCRIPT_TAGS]}
                </span>
              </Tag>
            ))}
          </div>
        </div>
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
      {/* Emotions tags will be here; each emotion has label and color */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {EMOTION_TAGS.map((item) => (
          <Tag
            key={item.label}
            color={emotion === item.label ? item.color : "white"}
            style={
              emotion !== item.label
                ? {
                    backgroundColor: item.color + "20",
                    color: item.color,
                    borderColor: item.color,
                  }
                : {
                    backgroundColor: item.color,
                    color: "white",
                    borderColor: item.color,
                  }
            }
            onClick={() => {
              setEmotion(item.label);
            }}
            className={`flex justify-center items-center cursor-pointer text-lg min-w-[100px] h-[40px] text-center`}>
            {item.label}
          </Tag>
        ))}
      </div>
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
            <audio
              ref={playerRef}
              src={chunks[currentChunk - 1]?.file_path}
              controls
              autoPlay
              className="w-full"
              controlsList="nodownload"
              style={{
                borderRadius: "1rem",
                backgroundColor: "transparent",
              }}>
              Your browser does not support the audio element.
            </audio>
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
        <p>Bu qismda muammo bormi?</p>
        <TextArea
          placeholder="Muammoni tavsiflang..."
          rows={4}
          className="mt-4"
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          disabled={transcription.length > 0}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(REPORT_TAGS).map((tag) => (
            <Tag
              key={tag}
              color="geekblue"
              className="cursor-pointer"
              onClick={() => setReportText((prev) => `${prev} [${tag}] `)}>
              [{tag}]
              <span className="ml-1 text-xs text-gray-500">
                {REPORT_TAGS[tag as keyof typeof REPORT_TAGS]}
              </span>
            </Tag>
          ))}
        </div>

        {transcription.length > 0 && (
          <p className="text-red-500 mt-2">
            Transkript qilingan qism uchun muammo xabar qilib bo'lmaydi
          </p>
        )}
      </Modal>
    </div>
  );
}
