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
    better_answer?: string;
  }[];
  scores?: {
    technical: number;
    communication: number;
    problem_solving: number;
    culture_fit: number;
    initiative: number;
  } | null;
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
  scores,
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
            AI 종합 평가 및 정량 역량 진단 카드
            ======================================================== */}
        <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-[18px] font-black text-slate-900 flex items-center gap-2.5">
              <Sparkles size={18} className="text-[#004C99]" />
              AI 모의면접 정량 진단 및 총평
            </h2>
            <span className={`text-[12px] font-bold px-3 py-1 rounded-full border ${
              scores
                ? "text-blue-700 bg-blue-50 border-blue-100"
                : "text-slate-500 bg-slate-50 border-slate-200"
            }`}>
              {scores ? "정량 평가 완료" : "숫자 평가 미완료/미제공"}
            </span>
          </div>

          {evaluation && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 mb-5 text-[14px] text-slate-700 leading-relaxed">
              <strong className="text-[#004C99] block mb-1 font-bold">면접 총평</strong>
              <p className="whitespace-pre-wrap">{evaluation}</p>
            </div>
          )}

          {scores ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">직무 역량</span>
                <span className="text-[20px] font-black text-[#004C99]">{scores.technical}점</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">의사소통</span>
                <span className="text-[20px] font-black text-[#004C99]">{scores.communication}점</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">문제해결</span>
                <span className="text-[20px] font-black text-[#004C99]">{scores.problem_solving}점</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">조직적합도</span>
                <span className="text-[20px] font-black text-[#004C99]">{scores.culture_fit}점</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">주도성</span>
                <span className="text-[20px] font-black text-[#004C99]">{scores.initiative}점</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-600 text-[13px] flex items-center justify-between">
              <div>
                <strong className="text-slate-800 font-bold block mb-0.5">정량 점수 안내</strong>
                <span>숫자 평가 미완료/미제공 (서술형 코칭 및 답변 피드백 중심으로 제공됩니다)</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
                서술형 피드백
              </span>
            </div>
          )}
        </section>

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
            <span className="text-[12px] font-bold text-slate-400">
              {qaReport.length > 0 ? "질문별 실전 작성 및 수정" : "공통 참고 가이드 질문 연습"}
            </span>
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
              문항별 AI 맞춤 피드백
            </span>
          </div>

          <p className="text-slate-500 text-[14px] mb-5">
            제출하신 답변을 바탕으로 AI 면접관이 직접 분석한 정밀 피드백과 개선 모범 답안입니다.
          </p>

          {/* 질문별 상세 피드백 아코디언 */}
          <div className="space-y-4">
            {qaReport.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500">
                <p className="text-[14px] font-bold text-slate-700 mb-1">
                  작성된 모의면접 질의응답 피드백이 없습니다.
                </p>
                <p className="text-[12px] text-slate-400">
                  모의면접을 진행하고 답변을 제출하시면 각 문항별 AI 정밀 진단과 개선 모범 답안이 이곳에 표시됩니다.
                </p>
              </div>
            ) : (
              qaReport.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                const effectiveBetterAnswer = item.betterAnswer || item.better_answer;
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
                      {effectiveBetterAnswer && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] font-black text-[#10B981]">개선 모범 답안 예시</span>
                          <div className="bg-[#10B981]/5 p-4 rounded-xl border border-[#10B981]/20 text-[13.5px] text-slate-700 leading-relaxed font-normal">
                            {effectiveBetterAnswer}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })
          )}
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
