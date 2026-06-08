"use client";

import { useState } from "react";
import { CheckCircle, Home, RotateCcw, ChevronDown, ChevronUp, Award, FileText, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyData } from "@/data/mockJobs";

interface InterviewResultProps {
  company: CompanyData;
  evaluation: string;
  qaReport: {
    question: string;
    answer: string;
    evaluation: string;
    betterAnswer?: string;
  }[];
  scores: {
    technical: number;
    communication: number;
    problem_solving: number;
    culture_fit: number;
    initiative: number;
  };
  cultureFitBreakdown: {
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
  cultureFitBreakdown 
}: InterviewResultProps) {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Compute average score safely
  const scoresObj = scores || {
    technical: 80,
    communication: 80,
    problem_solving: 80,
    culture_fit: 80,
    initiative: 80
  };
  
  const avgScore = Math.round(
    (scoresObj.technical + 
     scoresObj.communication + 
     scoresObj.problem_solving + 
     scoresObj.culture_fit + 
     scoresObj.initiative) / 5
  );

  // Determine letter grade
  const getLetterGrade = (score: number) => {
    if (score >= 95) return "S";
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "B+";
    if (score >= 70) return "B";
    return "C";
  };

  const grade = getLetterGrade(avgScore);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] relative animate-fade-in overflow-y-auto">
      <div className="max-w-[1000px] mx-auto w-full p-6 md:p-12 space-y-8 mt-4">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-2">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-[30px] font-black text-slate-800 tracking-tight">면접 평가 리포트</h1>
          <p className="text-[16px] text-slate-500 font-bold max-w-xl mx-auto leading-relaxed">
            {company.name} AI 인사담당관의 종합 진단이 완료되었습니다. 지원자님의 답변을 바탕으로 분석된 역량 점수와 컬처 핏 상태를 확인하세요.
          </p>
        </div>

        {/* Top Section: Grade Card & Competency Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Grade Card (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">AI 종합 등급</span>
            
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-[#004C99]/10 bg-slate-50 mb-4">
              <span className="text-[48px] font-black text-[#004C99] tracking-tighter">{grade}</span>
              <span className="absolute bottom-1 right-2 bg-[#004C99] text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                {avgScore}점
              </span>
            </div>

            <h3 className="font-extrabold text-[16px] text-slate-800 mb-2">{company.name} 합격 가능성 진단</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed font-semibold">
              {avgScore >= 85 
                ? "해당 기업의 인재상에 매우 높은 적합도를 보이고 있습니다. 실전 면접에서도 긍정적인 평가가 예상됩니다." 
                : "기업 고유의 가치관을 답변에 좀 더 부합하게 녹여낸다면 합격 가능성을 크게 향상시킬 수 있습니다."}
            </p>
          </div>

          {/* Competency Radar Breakdown (Span 8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 flex flex-col justify-between">
            <h3 className="text-[16px] font-black text-slate-800 mb-5 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Award size={18} className="text-[#004C99]" />
              5대 주요 역량 지표 (Competency)
            </h3>
            
            <div className="space-y-4">
              {/* Technical */}
              <div>
                <div className="flex justify-between text-[13px] font-bold text-slate-600 mb-1">
                  <span>직무 적합도 (Technical Fit)</span>
                  <span className="text-[#004C99]">{scoresObj.technical}점</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-[#004C99] rounded-full" style={{ width: `${scoresObj.technical}%` }}></div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <div className="flex justify-between text-[13px] font-bold text-slate-600 mb-1">
                  <span>의사소통 (Communication)</span>
                  <span className="text-[#004C99]">{scoresObj.communication}점</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-[#004C99] rounded-full" style={{ width: `${scoresObj.communication}%` }}></div>
                </div>
              </div>

              {/* Problem Solving */}
              <div>
                <div className="flex justify-between text-[13px] font-bold text-slate-600 mb-1">
                  <span>문제 해결력 (Problem Solving)</span>
                  <span className="text-[#004C99]">{scoresObj.problem_solving}점</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-[#004C99] rounded-full" style={{ width: `${scoresObj.problem_solving}%` }}></div>
                </div>
              </div>

              {/* Culture Fit */}
              <div>
                <div className="flex justify-between text-[13px] font-bold text-slate-600 mb-1">
                  <span>조직 적응력 (Culture Fit)</span>
                  <span className="text-[#004C99]">{scoresObj.culture_fit}점</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-[#004C99] rounded-full" style={{ width: `${scoresObj.culture_fit}%` }}></div>
                </div>
              </div>

              {/* Initiative */}
              <div>
                <div className="flex justify-between text-[13px] font-bold text-slate-600 mb-1">
                  <span>자기 주도성 (Initiative)</span>
                  <span className="text-[#004C99]">{scoresObj.initiative}점</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-[#004C99] rounded-full" style={{ width: `${scoresObj.initiative}%` }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Corporate Culture Fit Breakdown Section */}
        {cultureFitBreakdown && cultureFitBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <h3 className="text-[16px] font-black text-slate-800 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#10B981]" />
              {company.name} 인재상 매칭 정밀 진단
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {cultureFitBreakdown.map((item, idx) => (
                <div key={idx} className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[15px] text-slate-800">{item.value_name}</span>
                    <span className="text-[12px] font-black bg-[#EBF5FF] text-[#0066CC] px-2.5 py-1 rounded">
                      매칭률 {item.score}%
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-semibold">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Evaluation Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
          <h2 className="text-[18px] font-black text-[#004C99] mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText size={18} />
            AI 총평 및 개선 방향 가이드
          </h2>
          <div className="text-slate-600 leading-[1.8] text-[14px] whitespace-pre-wrap font-medium">
            {evaluation || "평가 피드백 데이터를 처리 중입니다."}
          </div>
        </div>

        {/* Q&A Accordion List */}
        {qaReport && qaReport.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <h3 className="text-[18px] font-black text-slate-800 mb-6 pb-3 border-b border-slate-100">
              질문별 상세 피드백 및 모범 답변 복기
            </h3>
            
            <div className="space-y-4">
              {qaReport.map((item, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-slate-50/20"
                  >
                    {/* Accordion Trigger */}
                    <button 
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className="w-full p-5 text-left flex justify-between items-center gap-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-black bg-[#EBF5FF] text-[#004C99] px-2 py-0.5 rounded">
                          질문 {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-[15px] text-slate-800 mt-1.5 truncate">
                          {item.question}
                        </h4>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="p-6 space-y-6">
                        
                        {/* 1. Candidate Answer */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] font-black text-slate-400">내 답변</span>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-[13.5px] text-slate-700 leading-relaxed font-semibold">
                            {item.answer || "(작성된 답변이 없습니다.)"}
                          </div>
                        </div>

                        {/* 2. AI Critical Evaluation */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] font-black text-[#004C99]">Hermes AI 피드백 코칭</span>
                          <div className="bg-[#EBF5FF]/10 p-4 rounded-xl border border-[#004C99]/10 text-[13.5px] text-slate-600 leading-relaxed font-semibold">
                            {item.evaluation}
                          </div>
                        </div>

                        {/* 3. Better Answer optimized for the target company */}
                        {item.betterAnswer && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[12px] font-black text-[#10B981]">지원 기업 최적화 모범 답안 예시</span>
                            <div className="bg-[#10B981]/5 p-4 rounded-xl border border-[#10B981]/10 text-[13.5px] text-slate-600 leading-relaxed font-semibold italic">
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#E2E8F0] text-slate-700 font-bold hover:bg-[#F8FAFC] transition-colors shadow-sm text-[14px]"
          >
            <Home size={18} />
            홈으로 돌아가기
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
            다시 면접보기
          </button>
        </div>
        
      </div>
    </div>
  );
}
