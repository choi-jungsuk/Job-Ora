"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Home, RotateCcw, ChevronDown, ChevronUp, Sparkles, BookmarkCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyData } from "@/data/mockJobs";

interface InterviewResultProps {
  company: CompanyData;
  evaluation?: string;
  qaReport: {
    question: string;
    answer: string;
    evaluation: string;
    betterAnswer?: string;
  }[];
  scores?: {
    technical: number;
    communication: number;
    problem_solving: number;
    culture_fit: number;
    initiative: number;
  };
  cultureFitBreakdown?: {
    value_name: string;
    score: number;
    reason: string;
  }[];
}

export default function InterviewResult({
  company,
  evaluation,
  qaReport,
}: InterviewResultProps) {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // 답변 연습을 위한 사용자 로컬 상태
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    qaReport.forEach((item, idx) => {
      initial[idx] = item.answer || "";
    });
    return initial;
  });
  const [savedFeedbackAlert, setSavedFeedbackAlert] = useState<number | null>(null);

  // 공고 요구 역량 목록 추출 (입력 데이터 기반)
  const requiredCompetencies = [
    { name: "직무 전문성 및 업무 이해도", desc: company.jobRole ? `${company.jobRole} 관련 실무 지식 및 수행 능력` : "직무 필수 기술 및 기본기" },
    { name: "영어 및 글로벌 커뮤니케이션", desc: "해외 현지 협업 및 다문화 환경 의사소통 능력" },
    { name: "현장 적응력 및 팀워크", desc: "새로운 업무 환경 적응 및 유연한 협업 태도" },
    { name: "책임감 및 문제 해결력", desc: "돌발 상황 대처 및 성실한 업무 완수 태도" },
  ];

  const handlePracticeSave = (index: number) => {
    setSavedFeedbackAlert(index);
    setTimeout(() => {
      setSavedFeedbackAlert(null);
    }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] relative animate-fade-in overflow-y-auto">
      <div className="max-w-[1000px] mx-auto w-full p-6 md:p-12 space-y-8 mt-4">

        {/* 상단 타이틀 */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#004C99] text-[13px] font-black border border-blue-100">
            <Sparkles size={16} /> Job-Ora AI 모의면접 결과 리포트
          </div>
          <h1 className="text-[28px] md:text-[32px] font-black text-slate-800 tracking-tight">
            지원 기업 기준 AI 모의면접 분석
          </h1>
          <p className="text-[15px] text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            입력하신 채용공고, 기업정보, 인재상, 직무 설명을 바탕으로 분석된 공고 요약, 요구 역량, 예상 질문 및 답변 피드백입니다.
          </p>
        </div>

        {/* ========================================================
            1. 공고 핵심 요약
            ======================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#004C99] text-white flex items-center justify-center text-[13px] font-black">1</span>
              공고 핵심 요약
            </h2>
            <span className="text-[12px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              사용자 입력 자료 기반
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <span className="text-[12px] font-black text-slate-400 block mb-1">지원 기업 / 기관</span>
              <p className="text-[16px] font-black text-slate-800">{company.name || "입력된 기업"}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{company.country || "글로벌"} · {company.industry || "전문 직무"}</p>
            </div>
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <span className="text-[12px] font-black text-slate-400 block mb-1">지원 직무</span>
              <p className="text-[16px] font-black text-[#004C99]">{company.jobRole || "지원 희망 직무"}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">요건: {company.experience || "신입/경력"}</p>
            </div>
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <span className="text-[12px] font-black text-slate-400 block mb-1">근무 형태 및 조건</span>
              <p className="text-[16px] font-black text-slate-800">{company.salary || "공고 내용 참조"}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">비자·고용 조건은 공고 제공처 또는 관련 기관 확인 필요</p>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-slate-700 text-[14px] leading-relaxed">
            <strong className="text-[#004C99] block mb-1 font-bold">공고문 주요 내용 요약</strong>
            <p className="text-slate-600 font-normal leading-relaxed whitespace-pre-wrap">
              {company.description || "사용자가 입력한 채용공고의 핵심 직무 내용과 요구사항입니다."}
            </p>
          </div>
        </section>

        {/* ========================================================
            2. 요구 역량
            ======================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#004C99] text-white flex items-center justify-center text-[13px] font-black">2</span>
              요구 역량 분석
            </h2>
            <span className="text-[12px] font-bold text-slate-400">공고 및 직무 설명 기반 도출</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredCompetencies.map((comp, idx) => (
              <div key={idx} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 size={16} className="text-[#004C99]" />
                  <h3 className="font-extrabold text-[15px] text-slate-800">{comp.name}</h3>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed pl-6 font-normal">
                  {comp.desc}
                </p>
              </div>
            ))}
          </div>

          {company.idealCandidate && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-[13px] text-slate-600">
              <strong className="text-slate-800 block mb-1">인재상 및 직무 적합 지침:</strong>
              {company.idealCandidate}
            </div>
          )}
        </section>

        {/* ========================================================
            3. 예상 면접 질문
            ======================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#004C99] text-white flex items-center justify-center text-[13px] font-black">3</span>
              예상 면접 질문
            </h2>
            <span className="text-[12px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              총 {qaReport.length > 0 ? qaReport.length : 3}개 문항 생성
            </span>
          </div>

          <p className="text-slate-500 text-[14px] mb-4">
            입력하신 공고와 직무 요구사항을 바탕으로 실제 인터뷰에서 나올 확률이 높은 예상 질문입니다.
          </p>

          <div className="space-y-3">
            {(qaReport.length > 0 ? qaReport : [
              { question: "이 직무에 지원한 이유와 본인의 강점을 설명해 주세요.", answer: "", evaluation: "" },
              { question: "이전 경험 중 이 업무와 직접적으로 연결될 수 있는 구체적인 프로젝트나 사례가 있나요?", answer: "", evaluation: "" },
              { question: "해외 근무 환경이나 다문화 협업 시 돌발적인 갈등이 생기면 어떻게 대처하시겠습니까?", answer: "", evaluation: "" }
            ]).map((qItem, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#004C99] font-black text-[12px] flex-shrink-0 mt-0.5">
                  Q{idx + 1}
                </span>
                <p className="text-[15px] font-bold text-slate-800 leading-snug">
                  {qItem.question}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            4. 답변 연습
            ======================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#004C99] text-white flex items-center justify-center text-[13px] font-black">4</span>
              답변 연습
            </h2>
            <span className="text-[12px] font-bold text-slate-400">질문별 실전 작성 및 수정</span>
          </div>

          <p className="text-slate-500 text-[14px] mb-5">
            생성된 예상 질문에 맞추어 본인의 답변을 직접 입력하거나 보완해 보세요. 입력 후 아래 [답변 피드백] 섹션에서 상세 평가를 확인하실 수 있습니다.
          </p>

          <div className="space-y-6">
            {(qaReport.length > 0 ? qaReport : [
              { question: "이 직무에 지원한 이유와 본인의 강점을 설명해 주세요.", answer: "", evaluation: "" },
              { question: "이전 경험 중 이 업무와 직접적으로 연결될 수 있는 구체적인 프로젝트나 사례가 있나요?", answer: "", evaluation: "" },
              { question: "해외 근무 환경이나 다문화 협업 시 돌발적인 갈등이 생기면 어떻게 대처하시겠습니까?", answer: "", evaluation: "" }
            ]).map((qItem, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[12px] font-black text-[#004C99] bg-blue-50 px-2.5 py-1 rounded-md">
                    질문 {idx + 1} 연습
                  </span>
                  <span className="text-[12px] text-slate-400 font-medium">
                    {(practiceAnswers[idx] || "").length}자 작성됨
                  </span>
                </div>
                <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">
                  {qItem.question}
                </h3>

                <textarea
                  rows={4}
                  value={practiceAnswers[idx] || ""}
                  onChange={(e) => setPracticeAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                  placeholder="이 질문에 대한 답변을 구체적인 경험과 수치를 바탕으로 작성해 보세요."
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 outline-none focus:border-[#004C99] focus:ring-1 focus:ring-[#004C99] transition-all"
                />

                <div className="flex justify-between items-center mt-3">
                  <span className="text-[12px] text-slate-400">
                    💡 직무 관련 경험과 구체적 행동 사례를 포함하면 좋은 평가를 받습니다.
                  </span>
                  <button
                    onClick={() => handlePracticeSave(idx)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004C99] hover:bg-[#00366D] text-white text-[13px] font-bold transition-all shadow-sm"
                  >
                    <BookmarkCheck size={14} /> 답변 임시저장
                  </button>
                </div>

                {savedFeedbackAlert === idx && (
                  <p className="mt-2 text-[12px] text-emerald-600 font-bold text-right animate-fade-in">
                    ✓ 답변이 저장되었습니다. 아래 피드백 기준에 맞추어 계속 수정해 보세요.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            5. 답변 피드백
            ======================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#004C99] text-white flex items-center justify-center text-[13px] font-black">5</span>
              답변 피드백
            </h2>
            <span className="text-[12px] font-bold text-[#004C99] bg-blue-50 px-3 py-1 rounded-full">
              5대 정밀 평가 기준
            </span>
          </div>

          <p className="text-slate-500 text-[14px] mb-5">
            작성하신 답변을 바탕으로 AI가 다음 5가지 핵심 관점(명확성, 관련성, 구체성, 표현 개선, 근거 보완)에서 진단한 피드백입니다.
          </p>

          {/* 질문별 상세 피드백 아코디언 */}
          <div className="space-y-4">
            {(qaReport.length > 0 ? qaReport : [
              {
                question: "이 직무에 지원한 이유와 본인의 강점을 설명해 주세요.",
                answer: practiceAnswers[0] || "(연습 답변 작성 대기 중)",
                evaluation: evaluation || "지원 직무의 핵심 역할과 본인의 강점이 잘 연결되어 있으나, 구체적인 성과 지표(숫자)를 보강하면 더욱 설득력이 높아집니다.",
                betterAnswer: "저는 지난 프로젝트에서 사용자 경험 최적화를 통해 전환율을 15% 개선한 경험이 있습니다. 해당 공고에서 요구하는 문제 해결 역량과 저의 데이터 기반 개선 경험이 시너지를 낼 수 있다고 확신하여 지원하였습니다."
              }
            ]).map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-black bg-[#EBF5FF] text-[#004C99] px-2.5 py-1 rounded">
                        피드백 분석 #{idx + 1}
                      </span>
                      <h4 className="font-extrabold text-[15px] text-slate-800 mt-2">
                        {item.question}
                      </h4>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-6 space-y-6">

                      {/* 제출/작성 답변 */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[12px] font-black text-slate-500">제출된 답변 내용</span>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[13.5px] text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                          {item.answer || practiceAnswers[idx] || "(작성된 답변이 없습니다. 상단 '4. 답변 연습'에서 작성해 보세요.)"}
                        </div>
                      </div>

                      {/* 5대 관점 피드백 카드 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
                          <span className="text-[12px] font-black text-[#004C99] block mb-1">1. 답변의 명확성</span>
                          <p className="text-[13px] text-slate-700 leading-relaxed">
                            두괄식으로 핵심 메시지를 먼저 제시하였으며, 질문 의도에 부합하는 명확한 방향성을 보이고 있습니다.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
                          <span className="text-[12px] font-black text-[#004C99] block mb-1">2. 직무와의 관련성</span>
                          <p className="text-[13px] text-slate-700 leading-relaxed">
                            공고에서 요구하는 {company.jobRole || "해당 직무"}의 핵심 업무 책임과 지원자의 경험이 긴밀하게 연결되어 있습니다.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[12px] font-black text-slate-700 block mb-1">3. 구체성</span>
                          <p className="text-[13px] text-slate-600 leading-relaxed">
                            단순한 서술보다 실제 본인이 직면했던 문제 상황(Situation)과 취했던 조치(Action)를 더욱 상세히 기술하는 것이 좋습니다.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[12px] font-black text-slate-700 block mb-1">4. 개선할 표현</span>
                          <p className="text-[13px] text-slate-600 leading-relaxed">
                            &apos;열심히 하겠습니다&apos;, &apos;최선을 다하겠습니다&apos; 같은 추상적 다짐 대신, 객관적 역량 중심의 표현으로 수정해 보세요.
                          </p>
                        </div>
                        <div className="md:col-span-2 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
                          <span className="text-[12px] font-black text-amber-800 block mb-1">5. 추가하면 좋은 경험 또는 근거</span>
                          <p className="text-[13px] text-slate-700 leading-relaxed">
                            지원 공고에 기술된 우대조건이나 협업 사례를 구체적 수치(프로젝트 기간, 기여도 등)와 함께 덧붙이면 설득력이 크게 배가됩니다.
                          </p>
                        </div>
                      </div>

                      {/* 종합 코칭 코멘트 */}
                      {item.evaluation && (
                        <div className="flex flex-col gap-1.5 pt-2">
                          <span className="text-[12px] font-black text-[#004C99]">AI 면접 코치 종합 피드백</span>
                          <div className="bg-[#EBF5FF]/30 p-4 rounded-xl border border-[#004C99]/20 text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {item.evaluation}
                          </div>
                        </div>
                      )}

                      {/* 모범 답안 예시 */}
                      {item.betterAnswer && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] font-black text-[#10B981]">개선 모범 답안 예시</span>
                          <div className="bg-[#10B981]/5 p-4 rounded-xl border border-[#10B981]/20 text-[13.5px] text-slate-700 leading-relaxed font-normal">
                            {item.betterAnswer}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 하단 고지 및 안내 문구 */}
        <div className="p-5 rounded-xl bg-slate-100/80 border border-slate-200 text-[12.5px] text-slate-500 leading-relaxed space-y-1">
          <p className="font-bold text-slate-700">안내 사항</p>
          <p>
            Job-Ora는 사용자가 입력한 채용공고·기업정보·직무정보를 바탕으로 면접 질문과 답변 피드백을 제공하는 AI 모의면접 서비스입니다. 채용정보 제공, 직업소개, 취업 알선, 기업 매칭은 제공하지 않습니다.
          </p>
          <p>
            Job-Ora는 사용자가 준비 중인 지원 건에 대해 면접 연습을 돕는 보조 도구입니다. 채용공고의 정확성, 채용 여부, 비자 승인 여부, 고용 조건은 해당 공고 제공처 또는 관련 기관을 통해 직접 확인해야 합니다.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#E2E8F0] text-slate-700 font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm text-[14px]"
          >
            <Home size={18} />
            새로운 공고 입력하기
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold transition-all hover:shadow-lg shadow-md hover:shadow-blue-500/10 text-[14px]"
            style={{
              background: 'linear-gradient(135deg, #0056b3 0%, #003d7a 100%)',
              border: 'none',
              color: '#ffffff'
            }}
          >
            <RotateCcw size={18} />
            모의면접 다시 연습하기
          </button>
        </div>

      </div>
    </div>
  );
}
