"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Bot, DatabaseZap, ClipboardCheck, ArrowRight,
  HelpCircle, CheckCircle2, AlertCircle, FileText, RefreshCw,
  ChevronDown, ChevronUp, Check, Award, ExternalLink
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// AI 에이전트 협업 단계
const AI_AGENTS = [
  {
    step: "STEP 1",
    name: "공고 & 직무 분석 에이전트",
    role: "Job Analysis Agent",
    icon: DatabaseZap,
    color: "from-sky-500 to-blue-700",
    description: "사용자가 입력한 채용공고 URL 또는 본문에서 필요 역량과 핵심 업무 요건을 정밀 분석합니다.",
  },
  {
    step: "STEP 2",
    name: "AI 면접관 질문 설계 에이전트",
    role: "Interview Designer",
    icon: Bot,
    color: "from-indigo-500 to-violet-700",
    description: "분석된 공고 직무를 바탕으로 지원 동기, 실무 역량, 해외 근무 적응에 관한 실전 면접 질문을 생성합니다.",
  },
  {
    step: "STEP 3",
    name: "답변 피드백 코치 에이전트",
    role: "Evaluation Coach",
    icon: ClipboardCheck,
    color: "from-emerald-500 to-teal-700",
    description: "작성된 답변의 명확성, 직무 관련성, 구체성, 개선할 표현을 5대 관점에서 다각도로 코칭합니다.",
  },
];

// 예시 공고 데이터 (채용 카드가 아닌, 사용자가 버튼 클릭 시 입력창에 편리하게 채워넣을 수 있는 텍스트 프리셋)
const PRESET_JOBS = [
  {
    title: "샘플 입력 1: IT 직무 공고문 예시",
    company: "예시 기업 A",
    role: "Frontend Engineer (React/TypeScript)",
    text: `[기업 및 직무 개요]
예시 기업 A는 B2B 클라우드 솔루션을 연구·개발하는 IT 기술 기업입니다.

[인재상 및 핵심 비전]
- 능동적인 문제 해결과 끊임없는 기술 학습
- 다문화 환경에서의 유연한 의사소통 및 협업

[주요 업무]
- 웹 애플리케이션의 프론트엔드 UI/UX 설계 및 개발
- 글로벌 엔지니어링 팀과의 원격 기술 협업
- 대시보드 시각화 및 웹 성능 최적화

[자격 요건]
- 웹 개발 관련 실무 또는 프로젝트 경험
- 영어 기술 문서 독해 및 기본 업무 소통 가능자
- 팀워크와 책임감을 갖춘 분`,
  },
  {
    title: "샘플 입력 2: 서비스 직무 공고문 예시",
    company: "예시 기업 B",
    role: "Guest Service Associate",
    text: `[기업 및 직무 개요]
예시 기업 B는 글로벌 호텔 및 호스피탈리티 서비스를 운영하는 기업입니다.

[인재상 및 핵심 비전]
- 고객 중심 사고와 진정성 있는 서비스 마인드
- 글로벌 고객 응대를 위한 원활한 소통과 침착한 대처

[주요 업무]
- 프론트 데스크 고객 응대 및 안내 지원
- 고객 요청 및 불편 사항 경청 및 해결 조치
- 원활한 팀 교대 근무 및 부서 간 협업

[자격 요건]
- 고객 응대 경험 및 긍정적인 태도
- 기초 비즈니스 영어 회화 및 현장 적응력
- 낯선 환경에서도 조화롭게 협력할 수 있는 성실성`,
  },
];

export default function Home() {
  const router = useRouter();
  const inputSectionRef = useRef<HTMLDivElement | null>(null);

  // 공고 입력 상태
  const [jobInput, setJobInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  // 생성 완료된 모의면접 미리보기 상태
  const [generatedSession, setGeneratedSession] = useState<{
    summary: string;
    competencies: string[];
    questions: string[];
    practiceAnswers: Record<number, string>;
    feedbackShown: boolean;
  } | null>(null);

  // FAQ 아코디언 상태
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 메인 CTA 클릭 시 입력 영역으로 스크롤 이동
  const scrollToInput = () => {
    if (inputSectionRef.current) {
      inputSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      const textarea = inputSectionRef.current.querySelector("textarea");
      if (textarea) {
        setTimeout(() => textarea.focus(), 400);
      }
    }
  };

  // 예시 공고 채우기
  const handleApplyPreset = (presetText: string) => {
    setJobInput(presetText);
    scrollToInput();
  };

  // AI 모의면접 생성 처리
  const handleGenerateInterview = () => {
    if (!jobInput.trim()) {
      alert("지원하려는 채용공고 URL 또는 공고문 텍스트를 입력해 주세요.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep("입력하신 채용공고의 핵심 내용을 분석하고 있습니다...");

    setTimeout(() => {
      setGenerationStep("공고에서 요구하는 주요 직무 역량을 도출하고 있습니다...");
    }, 700);

    setTimeout(() => {
      setGenerationStep("직무 맞춤형 예상 면접 질문을 생성하고 있습니다...");
    }, 1400);

    setTimeout(() => {
      // 분석 결과 객체 생성
      const parsedTitle = jobInput.includes("기업") ? "입력된 지원 기업" : "사용자 입력 공고";
      const sampleRole = jobInput.includes("프론트엔드") || jobInput.includes("개발")
        ? "소프트웨어 엔지니어"
        : jobInput.includes("호텔") || jobInput.includes("서비스")
        ? "게스트 서비스 담당자"
        : "지원 희망 직무";

      const sessionData = {
        summary: jobInput.length > 250 ? jobInput.slice(0, 250) + "..." : jobInput,
        competencies: [
          "직무 전문성 및 업무 이해도",
          "영어 및 글로벌 커뮤니케이션",
          "성실성 및 팀워크",
          "현장 적응력 및 문제 해결력"
        ],
        questions: [
          "이 직무에 지원한 이유와 본인이 생각하는 핵심 강점을 설명해 주세요.",
          "이전 경험 중 이 업무와 직접적으로 연결될 수 있는 구체적인 경험이나 프로젝트가 있나요?",
          "해외 근무 환경이나 다문화 팀에서 예상치 못한 어려움이 생기면 어떻게 대응하시겠습니까?"
        ],
        practiceAnswers: { 0: "", 1: "", 2: "" },
        feedbackShown: false,
      };

      // localStorage에 저장 (인터뷰 페이지와도 완벽 연동)
      const customCompany = {
        id: "custom-" + Date.now(),
        name: parsedTitle,
        country: "지원 대상 국가",
        flag: "🌐",
        industry: "지원 직무 분야",
        jobRole: sampleRole,
        salary: "공고 명시 조건",
        experience: "입력된 요건",
        visaSupport: false,
        description: jobInput,
        idealCandidate: "입력된 공고문 기반 필요 역량 충족 인재",
        culture: "사용자 입력 공고 기반",
      };

      const defaultResume = "지원 직무에 부합하는 관련 실무 지식과 도전 정신을 보유하고 있으며, 새로운 환경에서도 기민하게 협업할 준비가 되어 있습니다.";

      localStorage.setItem("jobora_company", JSON.stringify(customCompany));
      localStorage.setItem("jobora_resume", defaultResume);

      setGeneratedSession(sessionData);
      setIsGenerating(false);

      // 결과 영역으로 스크롤 이동
      setTimeout(() => {
        const resultEl = document.getElementById("interview-result-section");
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }, 2100);
  };

  // 실전 인터뷰 화면으로 진입
  const handleStartFullInterview = () => {
    router.push("/interview");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      {/* 글로벌 Header */}
      <Header />

      <main className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 flex flex-col gap-10 flex-1">

        {/* ========================================================
            3. 첫 화면 Hero 섹션
            ======================================================== */}
        <section
          className="w-full rounded-3xl p-8 md:p-14 shadow-xl relative overflow-hidden flex flex-col items-center text-center justify-center border border-slate-800/40"
          style={{
            background: "linear-gradient(135deg, #0B1938 0%, #0F2D6B 55%, #004C99 100%)"
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl flex flex-col items-center">
            {/* 상단 뱃지 */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-[12.5px] font-bold tracking-wide uppercase mb-6 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              기업 인재상 기반 AI 모의면접 서비스
            </div>

            {/* Hero 큰 제목 */}
            <h1
              className="text-[30px] sm:text-[38px] md:text-[44px] font-black leading-[1.25] mb-5 tracking-tight break-keep text-white"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
            >
              지원 기업의 인재상 맞춤형 AI 모의면접
            </h1>

            {/* Hero 설명문 */}
            <p
              className="text-[16px] md:text-[18px] text-blue-100/95 max-w-2xl font-normal leading-relaxed break-keep mb-8"
            >
              채용공고, 기업 비전, 인재상, 직무 설명을 입력하세요.<br className="hidden sm:inline" />
              Job-Ora가 지원 기업의 관점에 맞춘 예상 면접 질문과 답변 피드백을 제공합니다.
            </p>

            {/* 메인 CTA 버튼 */}
            <button
              onClick={scrollToInput}
              className="inline-flex items-center gap-3 bg-white text-[#004C99] hover:bg-blue-50 active:scale-98 px-8 py-4 rounded-2xl font-black text-[16px] md:text-[17px] shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span>지원 기업 맞춤 모의면접 시작하기</span>
              <ArrowRight size={20} className="text-[#004C99]" />
            </button>
          </div>
        </section>

        {/* ========================================================
            4. 입력 영역 구성
            ======================================================== */}
        <section
          ref={inputSectionRef}
          id="input-section"
          className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_10px_35px_rgba(15,23,42,0.04)] p-6 md:p-10 scroll-mt-24"
        >
          <div className="max-w-4xl mx-auto flex flex-col gap-6">

            {/* 헤더 & 제목 */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#004C99] text-[12px] font-black mb-2 border border-blue-100">
                <FileText size={14} /> 공고 입력 단계
              </div>
              <h2 className="text-[24px] md:text-[28px] font-black text-[#0F172A] tracking-tight">
                지원하려는 공고를 붙여넣으세요
              </h2>
              {/* 입력 안내문 */}
              <p className="text-slate-600 text-[14.5px] md:text-[15.5px] mt-2 leading-relaxed break-keep">
                채용공고 URL, 공고문 텍스트, 기업 소개, 인재상, 비전, 직무 설명을 입력하면 Job-Ora가 해당 내용을 바탕으로 면접 질문과 답변 피드백을 생성합니다.
              </p>
            </div>

            {/* 빠른 입력 편의를 위한 예시 공고 프리셋 버튼 */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-bold text-slate-400 mr-1">샘플 입력:</span>
                {PRESET_JOBS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.text)}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-[#004C99] border border-slate-200 text-slate-600 text-[12.5px] font-bold transition-all"
                  >
                    {preset.title}
                  </button>
                ))}
                {jobInput && (
                  <button
                    type="button"
                    onClick={() => setJobInput("")}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-500 text-[12.5px] font-bold ml-auto transition-colors"
                  >
                    지우기
                  </button>
                )}
              </div>
              <p className="text-[12px] text-slate-400 font-normal">
                * 아래 샘플은 입력 형식을 보여주기 위한 예시이며, Job-Ora가 제공하거나 추천하는 채용공고가 아닙니다.
              </p>
            </div>

            {/* 입력창 (Textarea) */}
            <div className="relative">
              <textarea
                rows={7}
                value={jobInput}
                onChange={(e) => setJobInput(e.target.value)}
                placeholder="예: 채용공고 URL, 공고문, 기업 인재상, 비전, 직무 설명을 붙여넣어 주세요."
                className="w-full p-5 bg-slate-50/60 focus:bg-white border-2 border-slate-200 focus:border-[#004C99] rounded-2xl text-[15px] text-slate-800 placeholder-slate-400 outline-none transition-all leading-relaxed"
              />
              <div className="absolute right-4 bottom-4 text-[12px] text-slate-400 font-medium">
                {jobInput.length}자 입력됨
              </div>
            </div>

            {/* 버튼 및 보조 안내문 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* 보조 안내문 */}
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-xl order-2 sm:order-1 flex items-start gap-1.5">
                <AlertCircle size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  Job-Ora는 채용정보를 제공하거나 특정 일자리를 추천하지 않습니다. 사용자가 입력한 채용공고·기업정보·인재상 자료를 바탕으로 면접 연습을 도와드립니다.
                </span>
              </p>

              {/* 생성 버튼 */}
              <button
                onClick={handleGenerateInterview}
                disabled={isGenerating}
                className={`order-1 sm:order-2 inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-white font-black text-[15.5px] shadow-lg transition-all flex-shrink-0 ${
                  isGenerating
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#004C99] hover:bg-[#00366D] active:scale-98 hover:shadow-blue-900/20"
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>분석 및 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>AI 모의면접 생성하기</span>
                  </>
                )}
              </button>
            </div>

            {/* 생성 로딩 알림 */}
            {isGenerating && (
              <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-blue-950 flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#004C99] text-white flex items-center justify-center font-bold flex-shrink-0">
                  <RefreshCw size={16} className="animate-spin" />
                </div>
                <div className="text-[14px] font-bold">
                  {generationStep}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ========================================================
            5. 결과 화면 구조 (생성 완료 시 동적 노출)
            ======================================================== */}
        {generatedSession && (
          <section
            id="interview-result-section"
            className="bg-white rounded-3xl border-2 border-blue-200 shadow-[0_12px_40px_rgba(0,76,153,0.06)] p-6 md:p-10 animate-fade-in flex flex-col gap-8 scroll-mt-24"
          >
            {/* 상단 안내 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-black border border-emerald-100 mb-2">
                  <Check size={14} /> 모의면접 생성 완료
                </span>
                <h3 className="text-[22px] md:text-[26px] font-black text-[#0F172A]">
                  지원 기업 기준 AI 모의면접 분석
                </h3>
                <p className="text-[14px] text-slate-500 mt-1">
                  입력하신 채용공고, 기업정보, 인재상, 직무 설명을 바탕으로 분석된 공고 요약, 요구 역량, 예상 질문 및 답변 피드백입니다.
                </p>
              </div>

              <button
                onClick={handleStartFullInterview}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#004C99] text-white text-[14px] font-black transition-all shadow-md self-start sm:self-auto"
              >
                <span>실시간 음성/화상 면접실 입장</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* 1. 공고 핵심 요약 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200">
              <h4 className="text-[17px] font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#004C99] text-white flex items-center justify-center text-[12px] font-bold">1</span>
                공고 핵심 요약
              </h4>
              <p className="text-[14px] text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                {generatedSession.summary}
              </p>
            </div>

            {/* 2. 요구 역량 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200">
              <h4 className="text-[17px] font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#004C99] text-white flex items-center justify-center text-[12px] font-bold">2</span>
                요구 역량
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedSession.competencies.map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white border border-slate-200/80">
                    <CheckCircle2 size={16} className="text-[#004C99]" />
                    <span className="text-[14px] font-bold text-slate-800">{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 예상 면접 질문 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200">
              <h4 className="text-[17px] font-black text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#004C99] text-white flex items-center justify-center text-[12px] font-bold">3</span>
                예상 면접 질문
              </h4>
              <div className="space-y-3">
                {generatedSession.questions.map((q, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200/80">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#004C99] font-black text-[12px] mt-0.5">
                      질문 {idx + 1}
                    </span>
                    <p className="text-[15px] font-bold text-slate-800 leading-snug">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 답변 연습 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200">
              <h4 className="text-[17px] font-black text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#004C99] text-white flex items-center justify-center text-[12px] font-bold">4</span>
                답변 연습
              </h4>
              <p className="text-[13.5px] text-slate-500 mb-4">
                생성된 질문에 대해 직접 답변을 작성해 보세요. 입력 후 아래에서 5대 관점 피드백을 확인할 수 있습니다.
              </p>

              <div className="space-y-4">
                {generatedSession.questions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200">
                    <p className="text-[14px] font-extrabold text-slate-800 mb-2">
                      Q{idx + 1}. {q}
                    </p>
                    <textarea
                      rows={3}
                      value={generatedSession.practiceAnswers[idx] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGeneratedSession(prev => prev ? ({
                          ...prev,
                          practiceAnswers: { ...prev.practiceAnswers, [idx]: val }
                        }) : null);
                      }}
                      placeholder="이 질문에 대한 본인의 답변을 자유롭게 작성해 보세요."
                      className="w-full p-3 bg-slate-50/50 border border-slate-200 rounded-lg text-[13.5px] text-slate-800 outline-none focus:border-[#004C99]"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setGeneratedSession(prev => prev ? ({ ...prev, feedbackShown: true }) : null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#004C99] text-white font-bold text-[14px] hover:bg-[#00366D] transition-colors"
                >
                  작성 답변 피드백 분석 확인
                </button>
              </div>
            </div>

            {/* 5. 답변 피드백 */}
            {generatedSession.feedbackShown && (
              <div className="p-6 rounded-2xl bg-blue-50/40 border border-blue-200 animate-fade-in">
                <h4 className="text-[17px] font-black text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#004C99] text-white flex items-center justify-center text-[12px] font-bold">5</span>
                  답변 피드백
                </h4>
                <p className="text-[13.5px] text-slate-600 mb-4">
                  작성하신 답변에 대해 다음 5가지 관점으로 분석한 피드백 가이드입니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-[12px] font-black text-[#004C99] block mb-1">답변의 명확성</span>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      두괄식 결론 제시 여부와 핵심 요점이 간결하게 드러나는지 평가합니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-[12px] font-black text-[#004C99] block mb-1">직무와의 관련성</span>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      공고의 업무 요건과 본인의 경험이 직접적으로 연계되는지 점검합니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-[12px] font-black text-slate-700 block mb-1">구체성</span>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      추상적 설명 대신 구체적 사례, 행동 과정, 객관적 지표를 포함하도록 안내합니다.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-[12px] font-black text-slate-700 block mb-1">개선할 표현</span>
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      모호하거나 자신감 없는 어조를 비즈니스에 적합한 신뢰감 있는 문장으로 수정합니다.
                    </p>
                  </div>
                  <div className="md:col-span-2 p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-[12px] font-black text-amber-700 block mb-1">추가하면 좋은 경험 또는 근거</span>
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      지원 공고의 우대조건을 뒷받침할 수 있는 관련 프로젝트나 문제 극복 사례를 보강할 것을 권장합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </section>
        )}

        {/* ========================================================
            AI 에이전트 협업 소개 (공고 기반 프로세스)
            ======================================================== */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.03)] p-6 md:p-10 overflow-hidden relative">
          <div className="relative z-10 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004C99]/5 text-[#004C99] text-[12px] font-black mb-3 border border-[#004C99]/10">
              <Sparkles size={14} /> Job-Ora AI Pipeline
            </div>
            <h2 className="text-[22px] md:text-[26px] font-black text-[#0F172A] tracking-tight">
              입력한 공고를 바탕으로 3개의 AI 에이전트가 함께 모의면접을 완성합니다
            </h2>
            <p className="text-slate-500 text-[14px] md:text-[15px] mt-2 leading-relaxed break-keep">
              단순 정형화된 공통 질문이 아니라, 사용자가 입력한 공고문과 직무 설명을 분석하여 예상 질문과 맞춤 피드백을 단계별로 도출합니다.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {AI_AGENTS.map((agent) => {
              const Icon = agent.icon;
              return (
                <div key={agent.name} className="relative rounded-2xl border border-slate-100 bg-slate-50/60 p-6 hover:bg-white hover:shadow-lg transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-[12px] font-black text-slate-400">{agent.step}</span>
                  </div>
                  <p className="text-[12px] font-black text-[#004C99] uppercase tracking-wide mb-1">{agent.role}</p>
                  <h3 className="text-[17px] font-black text-[#0F172A] mb-2">{agent.name}</h3>
                  <p className="text-[13px] leading-relaxed text-slate-500 break-keep">{agent.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            6. 서비스 설명 & 7. 워홀원모어 제휴 고려 안내 섹션
            ======================================================== */}
        <section className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-lg space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-[13px] font-bold">
            <Award size={18} /> 서비스 성격 및 신뢰 고지
          </div>
          <h3 className="text-[20px] md:text-[22px] font-black text-white leading-snug">
            Job-Ora의 운영 원칙과 서비스 범위 안내
          </h3>
          <div className="space-y-3 pt-2 text-slate-300 text-[14px] md:text-[14.5px] leading-relaxed">
            <p className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
              <strong className="text-white">서비스 정의: </strong>
              Job-Ora는 사용자가 입력한 채용공고·기업정보·직무정보를 바탕으로 면접 질문과 답변 피드백을 제공하는 AI 모의면접 서비스입니다. 채용정보 제공, 직업소개, 취업 알선, 기업 매칭은 제공하지 않습니다.
            </p>
            <p className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-slate-400 text-[13.5px]">
              <strong className="text-slate-300">이용 시 유의사항: </strong>
              Job-Ora는 사용자가 준비 중인 지원 건에 대해 면접 연습을 돕는 보조 도구입니다. 채용공고의 정확성, 채용 여부, 비자 승인 여부, 고용 조건은 해당 공고 제공처 또는 관련 기관을 통해 직접 확인해야 합니다.
            </p>
          </div>
        </section>

        {/* ========================================================
            8. FAQ 섹션 (자주 묻는 질문)
            ======================================================== */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.03)] p-6 md:p-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#004C99] text-[12px] font-black mb-2 border border-blue-100">
              <HelpCircle size={14} /> FAQ
            </div>
            <h2 className="text-[22px] md:text-[26px] font-black text-[#0F172A]">
              자주 묻는 질문
            </h2>
            <p className="text-slate-500 text-[14px] mt-1">
              Job-Ora의 서비스 이용과 관련해 궁금하신 점을 확인해 보세요.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Q. Job-Ora가 채용공고를 추천해 주나요?",
                a: "아니요. Job-Ora는 채용공고를 제공하거나 특정 일자리를 추천하지 않습니다. 사용자가 직접 입력한 공고나 기업정보를 바탕으로 면접 연습을 도와드립니다."
              },
              {
                q: "Q. Job-Ora가 취업이나 비자 승인을 보장하나요?",
                a: "아니요. Job-Ora는 합격, 취업, 비자 승인을 보장하지 않습니다. 면접 준비를 돕는 AI 모의면접 서비스입니다."
              },
              {
                q: "Q. 어떤 자료를 입력하면 좋나요?",
                a: "지원하려는 채용공고 URL, 공고문 텍스트, 기업 소개, 직무 설명, 우대 조건 등을 입력하면 더 구체적인 면접 질문을 생성할 수 있습니다."
              }
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-extrabold text-[15.5px] text-slate-800">
                      {faq.q}
                    </span>
                    <span className="text-slate-400 flex-shrink-0">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 bg-slate-50/60 border-t border-slate-100 text-[14.5px] text-slate-600 leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            9. 공공 해외취업 정보 확인처 섹션 (하단 보조 안내)
            ======================================================== */}
        <section className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-6 md:p-8 space-y-4">
          <div>
            <h2 className="text-[18px] md:text-[20px] font-bold text-slate-900 tracking-tight">
              공공 해외취업 정보 확인처
            </h2>
            <p className="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed break-keep mt-2">
              Job-Ora는 채용정보를 제공하거나 특정 일자리를 추천하지 않습니다.<br />
              해외취업 공고와 지원 조건은 공공기관 또는 해당 공고 제공처에서 직접 확인한 뒤,
              필요한 내용을 Job-Ora에 붙여넣어 면접 연습에 활용할 수 있습니다.
            </p>
          </div>

          <div>
            <a
              href="https://www.worldjob.or.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 text-[13.5px] font-bold transition-colors shadow-sm"
            >
              <span>월드잡플러스 바로가기</span>
              <ExternalLink size={14} className="text-slate-500" />
            </a>
          </div>

          <p className="text-[12.5px] text-slate-500 leading-relaxed">
            외부 사이트의 채용공고, 지원 조건, 비자 요건, 고용 조건은 해당 사이트와 관련 기관의 안내를 기준으로 확인해야 합니다.
          </p>
        </section>

      </main>

      {/* 글로벌 Footer */}
      <Footer />
    </div>
  );
}
