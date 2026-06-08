"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, User, Building, Loader2, Sparkles, Target, Mic, MicOff, Video, 
  ShieldCheck, CheckCircle2, Volume2, VolumeX, LogOut, RefreshCw, Play, Clock, 
  HelpCircle, BookOpen, AlertCircle
} from "lucide-react";
import { CompanyData } from "@/data/mockJobs";
import InterviewSidebar from "./components/InterviewSidebar";
import InterviewResult from "./components/InterviewResult";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

type Message = {
  role: "interviewer" | "candidate";
  content: string;
};

type QAReportItem = {
  question: string;
  answer: string;
  evaluation: string;
  betterAnswer?: string;
};

type CompetencyScores = {
  technical: number;
  communication: number;
  problem_solving: number;
  culture_fit: number;
  initiative: number;
};

type CultureFitBreakdown = {
  value_name: string;
  score: number;
  reason: string;
};

export default function InterviewPage() {
  const router = useRouter();
  
  // Core States
  const [step, setStep] = useState<"setup" | "interview" | "result">("setup");
  const [mode, setMode] = useState<"practice" | "real">("practice");
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [resumeText, setResumeText] = useState("");
  
  // Active Interview States
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"jd" | "ideal" | "resume">("jd");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(150); // 2 mins 30 secs
  const [timerActive, setTimerActive] = useState(false);
  
  // Simulation States
  const [isRecording, setIsRecording] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  
  // AI Guide Data (From API)
  const [currentTips, setCurrentTips] = useState("");
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  
  // Result States
  const [qaReport, setQaReport] = useState<QAReportItem[]>([]);
  const [finalScores, setFinalScores] = useState<CompetencyScores>({
    technical: 80,
    communication: 80,
    problem_solving: 80,
    culture_fit: 80,
    initiative: 80
  });
  const [finalCultureFitBreakdown, setFinalCultureFitBreakdown] = useState<CultureFitBreakdown[]>([]);
  const [finalEvaluation, setFinalEvaluation] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Voice synthesis states and refs
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // TTS helper function
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    if (isMutedRef.current) {
      setInterviewerSpeaking(false);
      return;
    }
    
    // Clean up Markdown and special symbols for natural reading
    const cleanText = text
      .replace(/[\*#_`]/g, "")
      .replace(/\(오프라인 모드 연결됨\)/g, "")
      .replace(/\(네트워크 타임아웃으로 로컬 질문으로 대체합니다\.\)/g, "")
      .trim();
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ko-KR";
    utterance.rate = 1.5;
    
    // Try to get Korean voice
    let voices = window.speechSynthesis.getVoices();
    let koVoice = voices.find(v => v.lang.includes("ko") || v.lang.startsWith("ko-"));
    if (koVoice) {
      utterance.voice = koVoice;
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        koVoice = voices.find(v => v.lang.includes("ko") || v.lang.startsWith("ko-"));
        if (koVoice && utterance) {
          utterance.voice = koVoice;
        }
      };
    }
    
    utterance.onstart = () => {
      setInterviewerSpeaking(true);
    };
    
    utterance.onend = () => {
      setInterviewerSpeaking(false);
    };
    
    utterance.onerror = () => {
      setInterviewerSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle audio sound output
  const toggleMute = () => {
    setIsMuted(prev => {
      const nextMuted = !prev;
      if (nextMuted) {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setInterviewerSpeaking(false);
      } else {
        // Re-speak last interviewer question
        const lastMsg = [...messages].reverse().find(m => m.role === "interviewer");
        if (lastMsg) {
          setTimeout(() => {
            speakText(lastMsg.content);
          }, 50);
        }
      }
      return nextMuted;
    });
  };

  // Trigger TTS on new messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "interviewer") {
      speakText(lastMessage.content);
    }
    
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [messages]);

  // Webcam States & Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  // Check webcam permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          setHasCameraPermission(true);
          s.getTracks().forEach(track => track.stop());
        })
        .catch((err) => {
          console.warn("Initial webcam access check failed:", err);
          setHasCameraPermission(false);
        });
    }
  }, []);

  // Handle webcam stream start/stop based on step
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        setWebcamError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Webcam access error:", err);
        setWebcamError("웹캠 연결 실패 (권한 없음)");
        setHasCameraPermission(false);
      }
    };

    if (step === "interview") {
      startWebcam();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };
  }, [step]);

  // Bind video element srcObject when stream or videoRef changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef.current]);

  // Initialize Data
  useEffect(() => {
    const savedCompany = localStorage.getItem("jobora_company");
    const savedResume = localStorage.getItem("jobora_resume");
    
    if (!savedCompany || !savedResume) {
      router.push("/");
      return;
    }
    
    setCompany(JSON.parse(savedCompany));
    setResumeText(savedResume);
  }, [router]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timerActive && timeLeft > 0 && step === "interview") {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      // Auto-submit when time runs out
      handleSend();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, step]);

  // Voice Simulation Wave Effect
  useEffect(() => {
    if (isRecording) {
      volumeIntervalRef.current = setInterval(() => {
        setVoiceVolume(Math.floor(Math.random() * 80) + 10);
      }, 100);
    } else {
      setVoiceVolume(0);
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    }
    return () => {
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    };
  }, [isRecording]);

  // Real-time keyword checking as the user types
  useEffect(() => {
    if (currentKeywords.length > 0 && input.trim()) {
      const matched = currentKeywords.filter(keyword => 
        input.toLowerCase().includes(keyword.toLowerCase())
      );
      setMatchedKeywords(matched);
    } else {
      setMatchedKeywords([]);
    }
  }, [input, currentKeywords]);

  if (!company) return null;

  // Retrieve corporate interviewer persona details
  const getInterviewerPersona = (companyId: string) => {
    switch (companyId) {
      case "us-meta":
        return {
          roleName: "Hermes (Tech Lead)",
          style: "혁신 & 속도 중심 검증",
          description: "Meta의 핵심 철학인 'Move Fast'와 'Focus on Impact'를 기반으로, 기민한 해결력과 실질적 결과 임팩트를 집요하게 검증하는 직설적 스타일의 면접관입니다.",
          accentColor: "#0066CC"
        };
      case "jp-toyota":
        return {
          roleName: "Hermes (품질제어 총괄부장)",
          style: "장인정신 & 지속적 개선(Kaizen) 검증",
          description: "일본 도요타의 장인정신(Monozukuri)과 협업 품질을 중시하며, 발생한 문제를 해결하기 위한 철저한 분석과 재발 방지 노력을 정중하고 집요하게 압박하는 스타일입니다.",
          accentColor: "#E82127"
        };
      case "us-swedish-med":
        return {
          roleName: "Hermes (수석 간호 관리부장)",
          style: "따뜻한 공감 & 소통능력 검증",
          description: "환자 우선주의(Patient-First) 가치를 평가하기 위해, 실제 응급/중환자 환경에서의 갈등 대처와 다문화 팀워크에서의 따뜻한 의사소통 능력을 중점 질문합니다.",
          accentColor: "#008080"
        };
      default:
        return {
          roleName: "Hermes (수석 HR 면접관)",
          style: "핵심 직무 적합성 & 컬처핏 검증",
          description: "회사의 채용 인재상과 요구 경력을 대조 분석하여, 기업의 가치관과 문화에 유연하게 적응하고 성과를 도출할 수 있는지 종합 검증합니다.",
          accentColor: "#004C99"
        };
    }
  };

  const persona = getInterviewerPersona(company.id);

  // Initialize and Start Interview
  const startInterview = async () => {
    setStep("interview");
    setIsTyping(true);
    setInterviewerSpeaking(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd_text: company.description,
          resume_text: resumeText,
          company_name: company.name,
          ideal_candidate_profile: company.idealCandidate
        })
      });
      
      if (!response.ok) throw new Error("Failed to start interview");
      
      const data = await response.json();
      
      if (data.questions && data.questions.length > 0) {
        const firstQ = data.questions[0];
        // Handle both old list response and new object response formats
        const questionText = typeof firstQ === "string" ? firstQ : firstQ.question;
        const questionTips = typeof firstQ === "string" ? "" : firstQ.tips;
        const questionKeywords = typeof firstQ === "string" ? [] : firstQ.keywords;
        
        setMessages([
          { 
            role: "interviewer", 
            content: `안녕하세요. ${company.name}의 채용면접을 시작하겠습니다. 지원해 주셔서 감사합니다. 첫 번째 질문을 드릴 테니 준비되시면 답변해 주시기 바랍니다.\n\n질문: ${questionText}` 
          }
        ]);
        
        setCurrentTips(questionTips);
        setCurrentKeywords(questionKeywords);
      } else {
        setMessages([
          { role: "interviewer", content: `안녕하세요. ${company.name} 채용면접을 진행하게 된 면접관 ${persona.roleName}입니다. 본인의 이력서와 직무 경력을 바탕으로 간단히 자기소개를 부탁드립니다.` }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        { role: "interviewer", content: `(오프라인 모드 연결됨) 안녕하세요. ${company.name} 채용면접을 진행하게 된 면접관 ${persona.roleName}입니다. 준비되셨다면 자기소개를 부탁드립니다.` }
      ]);
    } finally {
      setIsTyping(false);
      setInterviewerSpeaking(false);
      setTimeLeft(mode === "practice" ? 180 : 120); // 3 mins practice, 2 mins real
      setTimerActive(true);
    }
  };

  // Submit Answer & Fetch Next Question
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    setTimerActive(false);
    const userMessage: Message = { role: "candidate", content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    
    const candidateAnswer = input;
    setInput("");
    setIsTyping(true);
    setInterviewerSpeaking(true);
    setIsRecording(false);

    try {
      const response = await fetch(`${API_BASE_URL}/interview/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jd_text: company.description,
          resume_text: resumeText,
          company_name: company.name,
          ideal_candidate_profile: company.idealCandidate,
          history: newHistory
        })
      });
      
      if (!response.ok) throw new Error("Failed to communicate");
      
      const data = await response.json();
      
      // Store evaluation for this answer
      const currentQText = messages[messages.length - 1]?.content.split("질문: ").pop() || "자기소개 요청";
      const newReportItem: QAReportItem = {
        question: currentQText,
        answer: candidateAnswer,
        evaluation: data.evaluation || "무난한 답변입니다.",
        betterAnswer: data.better_answer || ""
      };
      setQaReport(prev => [...prev, newReportItem]);
      
      if (data.is_finished) {
        setFinalScores(data.scores || {
          technical: 85,
          communication: 80,
          problem_solving: 82,
          culture_fit: 90,
          initiative: 88
        });
        setFinalCultureFitBreakdown(data.culture_fit_breakdown || []);
        setFinalEvaluation(data.evaluation || "종합 피드백이 완료되었습니다.");
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setInterviewerSpeaking(false);
        setStep("result");
        return;
      }
      
      if (data.next_question) {
        setMessages([...newHistory, { role: "interviewer", content: `답변 감사드립니다. 이어서 질문 드리겠습니다.\n\n질문: ${data.next_question}` }]);
        setCurrentTips(data.tips || "");
        setCurrentKeywords(data.keywords || []);
      } else {
        setMessages([...newHistory, { role: "interviewer", content: "답변 잘 들었습니다. 본인의 경력과 관련해 이 회사에서 어떤 가치창출을 보일 수 있는지 추가로 설명해 주십시오." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...newHistory, { role: "interviewer", content: "(네트워크 타임아웃으로 로컬 질문으로 대체합니다.) 입사 후 조직 내 갈등이 발생한다면 어떻게 해결하시겠습니까?" }]);
    } finally {
      setIsTyping(false);
      setInterviewerSpeaking(false);
      setTimeLeft(mode === "practice" ? 180 : 120);
      setTimerActive(true);
    }
  };

  // Simulate audio input speaking to text
  const startVoiceSimulation = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    
    setIsRecording(true);
    setInput("잠시 생각 중입니다...");
    
    setTimeout(() => {
      setInput("네, 질문에 대해 답변드리겠습니다. 저는 작성한 이력서 내용처럼 이전 직장과 프로젝트에서 항상 협업을 주도하고 효율적인 솔루션을 제시하기 위해 노력해 왔습니다. 특히 직무 경험 상 발생했던 돌발 변수에 대해서도 적극적인 피드백 교환을 통해 해결 방안을 고안해 낸 경험이 있습니다.");
    }, 2500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      
      {/* 1. Setup / Mode Selection Phase */}
      {step === "setup" && (
        <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 max-w-[1200px] mx-auto w-full">
          
          <div className="w-full text-center mb-8">
            <span className="bg-[#EBF5FF] text-[#004C99] text-[12px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              AI Mock Interview Studio
            </span>
            <h1 className="text-[32px] font-black text-slate-800 mt-3 tracking-tight">
              {company.name} 기업 맞춤형 모의면접실
            </h1>
            <p className="text-slate-500 font-bold mt-1 text-[15px]">
              획일적인 평가가 아닌, 지원 회사 고유의 가치관과 인재상을 학습한 AI 인사담당자 면접관을 만나보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            
            {/* Left: Persona Card & Hardware Diagnostics */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Interviewer Persona Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 md:p-8">
                <h3 className="text-[18px] font-black text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Building size={20} className="text-[#004C99]" />
                  배정된 면접관 프로필
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-24 h-24 rounded-2xl border border-slate-100 overflow-hidden flex-shrink-0 bg-slate-50 relative">
                    <img 
                      src="/images/ai_interviewer_avatar.png" 
                      alt="Interviewer Avatar"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="text-[20px] font-black text-slate-800">{persona.roleName}</span>
                      <span 
                        className="text-[12px] font-bold px-2.5 py-0.5 rounded-full text-white self-center"
                        style={{ backgroundColor: persona.accentColor }}
                      >
                        {persona.style}
                      </span>
                    </div>
                    <p className="text-[14px] text-slate-600 font-medium leading-relaxed mb-4">
                      {persona.description}
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50 text-[13px] text-slate-500 leading-[1.6]">
                      <strong className="text-slate-700 block mb-1">🎯 인재상 매칭 진단 기준:</strong>
                      {company.idealCandidate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hardware Diagnostics Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6">
                <h3 className="text-[16px] font-black text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#10B981]" />
                  면접 환경 자가 진단
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 
                      size={18} 
                      className={
                        hasCameraPermission === true 
                          ? "text-[#10B981] flex-shrink-0" 
                          : hasCameraPermission === false 
                            ? "text-red-500 flex-shrink-0" 
                            : "text-amber-500 flex-shrink-0"
                      } 
                    />
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">웹 카메라</p>
                      <p className="text-[11px] text-slate-400">
                        {hasCameraPermission === true 
                          ? "연결 및 송출 정상" 
                          : hasCameraPermission === false 
                            ? "카메라 권한 필요" 
                            : "권한 확인 중..."}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">오디오 마이크</p>
                      <p className="text-[11px] text-slate-400">수신 데시벨 정상</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-slate-700">네트워크 연결</p>
                      <p className="text-[11px] text-slate-400">지연 속도 양호 (양방향)</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Mode Selection & Start */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 md:p-8 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-[18px] font-black text-slate-800 mb-5 pb-3 border-b border-slate-100">
                    진행할 면접 방식 선택
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    {/* Practice Mode Card */}
                    <div 
                      onClick={() => setMode("practice")}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                        mode === "practice" 
                          ? "border-[#004C99] bg-[#EBF5FF]/20" 
                          : "border-slate-200/60 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg flex-shrink-0 ${mode === "practice" ? "bg-[#004C99] text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[16px] text-slate-800">연습 면접 모드</span>
                          <span className="text-[10px] font-black bg-[#EBF5FF] text-[#004C99] px-2 py-0.5 rounded">3문항</span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1">
                          답변을 조율할 수 있도록 실시간 **AI 답변 비책 가이드** 및 기업 핵심 **권장 키워드 팁**을 화면에 함께 노출해 줍니다.
                        </p>
                      </div>
                    </div>

                    {/* Real Mode Card */}
                    <div 
                      onClick={() => setMode("real")}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                        mode === "real" 
                          ? "border-[#004C99] bg-[#EBF5FF]/20" 
                          : "border-slate-200/60 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg flex-shrink-0 ${mode === "real" ? "bg-[#004C99] text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Target size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[16px] text-slate-800">실전 면접 모드</span>
                          <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded">5문항+</span>
                        </div>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed mt-1">
                          답변 팁이 주어지지 않고 제한시간(120초) 타이머가 긴박하게 작동합니다. 직무 적합성과 압박 꼬리 질문이 계속해서 출제됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={startInterview}
                    className="w-full py-4 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-[1.01] active:scale-98 text-[15px] flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #0056b3 0%, #003d7a 100%)',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    <Play size={16} fill="white" />
                    {mode === "practice" ? "연습 면접실 입장" : "실전 면접실 입장"}
                  </button>
                  <p className="text-center text-[12px] text-slate-400 mt-3 font-semibold">
                    ※ 입장 즉시 기업 맞춤 가치관 학습을 거쳐 첫 질문이 로딩됩니다.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* 2. Active Mock Interview Phase */}
      {step === "interview" && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Company Context Sidebar */}
          <InterviewSidebar 
            company={company} 
            resumeText={resumeText} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />

          {/* Main Interview Suite */}
          <div className="flex-1 flex flex-col h-full bg-[#111827] relative text-white">
            
            {/* Top Bar Status */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#0F172A] z-20">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <div className="flex flex-col">
                  <h2 className="font-extrabold text-[15px] tracking-tight text-white flex items-center gap-1.5">
                    {company.name} AI 면접실
                  </h2>
                  <span className="text-[11px] font-bold text-slate-400">
                    면접관: {persona.roleName} / 스타일: {persona.style}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full border ${
                  mode === 'practice' 
                    ? 'bg-[#004C99]/20 border-[#004C99]/40 text-[#0066CC]' 
                    : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}>
                  {mode === 'practice' ? '연습 모드 진행 중' : '실전 모드 진행 중'}
                </span>
                
                <button 
                  onClick={toggleMute}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                  title={isMuted ? "음소거 해제" : "음소거"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                
                <button 
                  onClick={() => {
                    if (confirm("면접을 중단하고 홈으로 이동하시겠습니까?")) {
                      router.push("/");
                    }
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                  title="면접 퇴장"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Split Screen Video Simulator */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center">
              <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* AI Interviewer Video Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden aspect-[4/3] flex flex-col items-center justify-center p-6 shadow-xl group">
                  <div className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-300 relative bg-slate-900 ${
                    interviewerSpeaking || isTyping ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105' : 'border-slate-800'
                  }`}>
                    <img 
                      src="/images/ai_interviewer_avatar.png" 
                      alt="AI Interviewer"
                      className="w-full h-full object-cover"
                    />
                    {(interviewerSpeaking || isTyping) && (
                      <span className="absolute inset-0 border-4 border-blue-500 rounded-full animate-ping opacity-75"></span>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="font-extrabold text-[14px] text-slate-300">{persona.roleName}</p>
                    <div className="flex items-center justify-center gap-1 mt-1 text-[11px] text-slate-500 font-bold">
                      <Volume2 size={12} />
                      <span>{isTyping ? "질문 분석 중..." : "오디오 전송 상태 양호"}</span>
                    </div>
                  </div>

                  {/* Simulated wave bars */}
                  {(interviewerSpeaking || isTyping) && (
                    <div className="absolute bottom-4 flex items-end gap-1.5 h-6">
                      {[...Array(6)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-[#0066CC] rounded-full animate-bounce" 
                          style={{ 
                            height: `${Math.random() * 100}%`,
                            animationDuration: `${Math.floor(Math.random() * 500) + 400}ms` 
                          }}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Candidate Camera Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden aspect-[4/3] flex flex-col items-center justify-center p-6 shadow-xl">
                  {/* Blinking REC indicator */}
                  <div className="flex items-center gap-1.5 absolute top-4 left-4 bg-red-500/10 border border-red-500/30 text-red-500 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider animate-pulse z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    REC
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white/5 text-slate-400 text-[11px] font-bold px-3 py-1 rounded-full border border-white/5 z-10">
                    지원자 비디오 송출 중
                  </div>

                  {/* Webcam Feed or Fallback */}
                  {stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 z-10">
                      <div className={`w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all duration-300 ${
                        isRecording ? 'border-red-500 bg-red-500/5' : ''
                      }`}>
                        <User size={36} className={isRecording ? 'text-red-500' : ''} />
                      </div>
                      <p className="text-[13px] font-bold mt-3 text-slate-400">지원자 실시간 화면</p>
                      <p className="text-[11px] text-slate-600 mt-1 font-semibold">
                        {webcamError ? webcamError : "Webcam Loading..."}
                      </p>
                    </div>
                  )}

                  {/* Decibel volume wave indicator at bottom */}
                  {isRecording && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800 z-10">
                      <div 
                        className="h-full bg-red-500 transition-all duration-100" 
                        style={{ width: `${voiceVolume}%` }}
                      ></div>
                    </div>
                  )}
                </div>

              </div>

              {/* Subtitles Area (Current Question) */}
              <div className="max-w-[1000px] w-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col gap-3">
                <div className="text-slate-400 text-[12px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>진행중인 질문</span>
                  {timerActive && (
                    <span className="ml-auto text-[#0066CC] bg-[#EBF5FF]/10 px-2.5 py-0.5 rounded border border-[#0066CC]/20 font-mono">
                      남은 시간: {formatTime(timeLeft)}
                    </span>
                  )}
                </div>
                
                <div className="text-[16px] md:text-[18px] text-white font-bold leading-relaxed break-keep min-h-[60px]">
                  {messages[messages.length - 1]?.content.includes("질문: ") 
                    ? messages[messages.length - 1].content.split("질문: ").pop() 
                    : messages[messages.length - 1]?.content || "질문을 대기 중입니다..."}
                </div>
              </div>
              
              {/* Practice Guide Panel (연습 모드 전용) */}
              {mode === "practice" && (currentTips || currentKeywords.length > 0) && (
                <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-12 gap-5 mt-6">
                  
                  {/* Tips Box */}
                  <div className="md:col-span-8 bg-[#004C99]/5 border border-[#004C99]/15 rounded-xl p-5 flex gap-3.5">
                    <BookOpen size={20} className="text-[#0066CC] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-black text-[#0066CC] mb-1">Hermes AI 답변 비책</h4>
                      <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                        {currentTips || "질문에 부합하는 명확한 기술 사례나 성과를 먼저 정의한 후 설명하세요."}
                      </p>
                    </div>
                  </div>

                  {/* Keywords Checker */}
                  <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[13px] font-black text-slate-400 mb-2 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#0066CC]" />
                        권장 핵심 키워드
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {currentKeywords.map((keyword, i) => {
                          const isMatched = matchedKeywords.includes(keyword);
                          return (
                            <span 
                              key={i} 
                              className={`text-[11px] font-bold px-2 py-1 rounded transition-all duration-300 border ${
                                isMatched 
                                  ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.1)]' 
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              {keyword} {isMatched ? '✓' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {matchedKeywords.length > 0 && (
                      <p className="text-[10px] text-green-400 font-bold mt-2">
                        ✓ {matchedKeywords.length}개 키워드 매칭 완료!
                      </p>
                    )}
                  </div>

                </div>
              )}

            </div>

            {/* Answer Control Console */}
            <div className="p-6 border-t border-slate-800 bg-[#0F172A] z-20">
              <div className="max-w-[800px] mx-auto flex gap-4">
                
                {/* Voice Record Button */}
                <button
                  onClick={startVoiceSimulation}
                  disabled={isTyping}
                  className={`w-[60px] h-[60px] rounded-xl flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-600 text-white animate-pulse' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isRecording ? "녹음 중지" : "음성 답변 시뮬레이션"}
                >
                  {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                
                <textarea
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 outline-none focus:border-[#004C99] focus:ring-1 focus:ring-[#004C99] transition-all text-white resize-none h-[60px] min-h-[60px] max-h-32 text-[14px] leading-relaxed placeholder-slate-500"
                  placeholder={isRecording ? "음성을 텍스트로 녹음하는 중입니다..." : "이곳에 답변 내용을 기입하거나 음성 입력을 지원하세요..."}
                  value={input}
                  disabled={isTyping}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-[60px] h-[60px] flex items-center justify-center rounded-xl transition-all shadow-md bg-[#004C99] hover:bg-[#00366D] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTyping ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} fill="currentColor" />
                  )}
                </button>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. Interview Result / Evaluation Phase */}
      {step === "result" && (
        <InterviewResult 
          company={company} 
          evaluation={finalEvaluation} 
          qaReport={qaReport}
          scores={finalScores}
          cultureFitBreakdown={finalCultureFitBreakdown}
        />
      )}

    </div>
  );
}
