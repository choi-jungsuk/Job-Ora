"use client";

import { ArrowLeft, Briefcase, Target, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { CompanyData } from "@/data/mockJobs";

interface InterviewSidebarProps {
  company: CompanyData;
  resumeText: string;
  activeTab: "jd" | "ideal" | "resume";
  setActiveTab: (tab: "jd" | "ideal" | "resume") => void;
}

export default function InterviewSidebar({
  company,
  resumeText,
  activeTab,
  setActiveTab
}: InterviewSidebarProps) {
  const router = useRouter();

  return (
    <div className="w-[300px] border-r border-slate-800 bg-[#0F172A] flex flex-col h-full transform transition-transform hidden lg:flex z-20 shadow-lg text-white">
      {/* Header Info */}
      <div className="flex flex-col p-5 border-b border-slate-800 bg-slate-950/20">
        <button 
          onClick={() => {
            if (confirm("면접을 중단하고 홈으로 이동하시겠습니까?")) {
              router.push("/");
            }
          }} 
          className="self-start text-[12px] font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Job-Ora 홈으로
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center flex-shrink-0">
            <span className="text-[18px] pb-1">{company.flag}</span>
          </div>
          <div>
            <h2 className="font-extrabold text-[15px] text-white leading-tight">{company.name}</h2>
            <div className="text-[12px] text-blue-400 font-bold mt-0.5">{company.industry}</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-3 border-b border-slate-800 bg-slate-950/10 text-[13px] font-bold">
        <button 
          className={`pb-2.5 transition-all duration-300 border-b-2 flex items-center gap-1.5 ${
            activeTab === "jd" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("jd")}
        >
          <Briefcase size={13} />
          JD 공고
        </button>
        
        <button 
          className={`pb-2.5 transition-all duration-300 border-b-2 flex items-center gap-1.5 ${
            activeTab === "ideal" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("ideal")}
        >
          <Target size={13} />
          인재상
        </button>
        
        <button 
          className={`pb-2.5 transition-all duration-300 border-b-2 flex items-center gap-1.5 ${
            activeTab === "resume" 
              ? "border-blue-500 text-blue-400" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("resume")}
        >
          <FileText size={13} />
          내 이력서
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 text-[13px] text-slate-300 bg-slate-950/5 whitespace-pre-wrap leading-[1.7] font-medium">
        {activeTab === "jd" && company.description}
        {activeTab === "ideal" && company.idealCandidate}
        {activeTab === "resume" && resumeText}
      </div>
    </div>
  );
}
