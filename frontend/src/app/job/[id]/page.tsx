"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, FileText, UserCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { MOCK_COMPANIES } from "@/data/mockJobs";
import { use } from "react";
import Header from "@/components/Header";

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const resolvedParams = use(params);
  
  useEffect(() => {
    const saved = localStorage.getItem("jobora_resumes");
    if (saved) {
      try {
        const resumes = JSON.parse(saved);
        const defaultResume = resumes.find((r: { isDefault: boolean, content: string }) => r.isDefault);
        if (defaultResume) {
          setResumeText(defaultResume.content);
        }
      } catch (e) {
        console.error("Failed to parse resumes", e);
      }
    }
  }, []);

  const company = MOCK_COMPANIES.find(c => c.id === resolvedParams.id);

  if (!company) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-12 text-center text-[18px] font-bold text-[#222]">
          해당 채용공고를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  const handleStartInterview = () => {
    if (!resumeText.trim()) {
      alert("진행 전 지원하실 이력서 텍스트를 입력해 주십시오.");
      return;
    }
    
    localStorage.setItem("jobora_company", JSON.stringify(company));
    localStorage.setItem("jobora_resume", resumeText);
    
    router.push("/interview");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      
      {/* Premium Global Header */}
      <Header />

      {/* Breadcrumb / Back Button */}
      <div className="max-w-[1240px] w-full mx-auto px-6 pt-6 pb-2">
        <button 
          onClick={() => router.back()} 
          className="text-slate-500 hover:text-[#004C99] transition-all flex items-center gap-1.5 font-bold text-[14px] group"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" /> 
          전체 채용공고 목록으로
        </button>
      </div>

      <main className="max-w-[1240px] w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Company Info (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6 md:p-8 flex flex-col">
            
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-8 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-center flex-shrink-0 text-3xl pb-1 shadow-sm">
                {company.flag}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="border border-blue-100 bg-[#EBF5FF] text-[#0066CC] px-2.5 py-1 rounded-[6px] text-[12px] font-bold">
                    {company.country}
                  </span>
                  <span className="border border-slate-100 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-[6px] text-[12px] font-bold">
                    요건: {company.experience}
                  </span>
                  {company.visaSupport && (
                    <span className="border border-[#E0E7FF] bg-[#EEF2FF] text-[#4F46E5] px-2.5 py-1 rounded-[6px] text-[12px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> 비자 지원 (Visa Supported)
                    </span>
                  )}
                </div>
                <h2 className="text-[26px] font-black text-[#0F172A] leading-tight mb-1">{company.name}</h2>
                <h3 className="text-[17px] font-extrabold text-[#0066CC]">{company.jobRole}</h3>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="flex items-center gap-2 text-[16px] font-black text-[#0F172A] mb-4 border-b-2 border-[#004C99] pb-2 inline-flex">
                  <Briefcase size={16} className="text-[#004C99]" /> 채용 공고 전문 (Job Description)
                </h4>
                <p className="text-slate-600 leading-[1.7] whitespace-pre-wrap text-[15px]">
                  {company.description}
                </p>
              </div>
              
              <div 
                className="p-6 rounded-2xl border border-[#004C99]/15 shadow-sm"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(0, 76, 153, 0.02) 0%, rgba(0, 76, 153, 0.05) 100%)' 
                }}
              >
                <h4 className="flex items-center gap-2 text-[15px] font-black text-[#004C99] mb-3">
                  <UserCheck size={16} /> 기업 핵심 인재상 (HR Criteria)
                </h4>
                <p className="text-[#0F172A] leading-[1.7] text-[14px] font-bold">
                  {company.idealCandidate}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: User Input (Span 5) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-6 md:p-8 flex flex-col h-full lg:sticky lg:top-[110px]">
            <h3 className="flex items-center gap-2 text-[18px] font-black text-[#0F172A] mb-2">
              <FileText size={18} className="text-[#004C99]" /> 지원 이력서 등록
            </h3>
            
            <p className="text-slate-500 text-[13px] mb-5 font-bold leading-[1.5]">
              대상 기업 정보와 인재상을 바탕으로 현지 글로벌 HR 담당자 컨셉의 모의 압박 면접이 진행됩니다. 준비된 이력서(영문/국문)를 본문에 기입해 주십시오.
            </p>
            
            <textarea
              className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-[2px] focus:ring-[#0066CC]/20 focus:border-[#0066CC] outline-none transition-all resize-none text-slate-700 placeholder-slate-400 min-h-[300px] text-[14px] leading-relaxed"
              placeholder="여기에 이력서 텍스트를 기입하거나, 아래 버튼을 통해 면접을 시작하세요. (기본 설정된 이력서가 자동으로 불러와집니다)"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            
            <button
              onClick={handleStartInterview}
              className="mt-6 py-4 text-[15px] font-bold shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/15 cursor-pointer rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex gap-2 items-center justify-center w-full"
              style={{
                background: 'linear-gradient(135deg, #0056b3 0%, #003d7a 100%)',
                color: '#ffffff',
                border: 'none'
              }}
            >
              면접 모니터링 시스템 연결
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
