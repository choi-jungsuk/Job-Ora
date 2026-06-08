"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Globe, Sparkles, SlidersHorizontal, RefreshCw, Briefcase, MapPin, DollarSign, Calendar, Bot, DatabaseZap, ClipboardCheck, ArrowRight } from "lucide-react";
import { MOCK_COMPANIES } from "@/data/mockJobs";
import Header from "@/components/Header";

const AI_AGENTS = [
  {
    name: "기업문화 분석 에이전트",
    role: "Company DNA Agent",
    icon: DatabaseZap,
    color: "from-sky-500 to-blue-700",
    description: "채용공고와 기업의 인재상·미션·핵심가치를 읽고 면접 기준을 설계합니다.",
  },
  {
    name: "AI 면접관 에이전트",
    role: "Interview Agent",
    icon: Bot,
    color: "from-indigo-500 to-violet-700",
    description: "지원 기업의 HR 담당자처럼 첫 질문과 꼬리질문을 실시간으로 진행합니다.",
  },
  {
    name: "피드백 코치 에이전트",
    role: "Evaluation Coach",
    icon: ClipboardCheck,
    color: "from-emerald-500 to-teal-700",
    description: "답변을 평가하고 강점·보완점·기업문화 적합도를 리포트로 정리합니다.",
  },
];

export default function Home() {
  const router = useRouter();
  
  // Filter states
  const [filterCountry, setFilterCountry] = useState("");
  const [filterExp, setFilterExp] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const countries = Array.from(new Set(MOCK_COMPANIES.map(c => c.country)));
  const industries = Array.from(new Set(MOCK_COMPANIES.map(c => c.industry)));

  // Simple filtering
  const filteredCompanies = MOCK_COMPANIES.filter(c => {
    return (filterCountry === "" || c.country === filterCountry) &&
           (filterExp === "" || c.experience.includes(filterExp)) &&
           (filterIndustry === "" || c.industry === filterIndustry);
  });

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const currentCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      
      {/* Premium Global Header */}
      <Header />

      <main className="max-w-[1440px] w-full mx-auto px-4 md:px-8 py-10 flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-[360px] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0]/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 md:p-8 sticky top-[100px] flex flex-col gap-6">
            <h3 className="font-extrabold text-[20px] text-[#0F172A] border-b border-slate-100 flex items-center gap-2 pb-4">
              <SlidersHorizontal size={20} className="text-[#004C99]" />
              상세 필터
            </h3>
            
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Globe size={14} className="text-slate-400" /> 희망 국가
                </label>
                <select 
                  className="w-full bg-slate-50/50 focus:bg-white border border-[#E2E8F0] rounded-xl text-[15px] font-semibold text-slate-700 outline-none focus:border-[#004C99] focus:ring-1 focus:ring-[#004C99] transition-all cursor-pointer"
                  style={{ padding: '14px' }}
                  value={filterCountry} 
                  onChange={e => {setFilterCountry(e.target.value); setCurrentPage(1);}}
                >
                  <option value="">국가 전체선택</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-slate-400" /> 유망 직종
                </label>
                <select 
                  className="w-full bg-slate-50/50 focus:bg-white border border-[#E2E8F0] rounded-xl text-[15px] font-semibold text-slate-700 outline-none focus:border-[#004C99] focus:ring-1 focus:ring-[#004C99] transition-all cursor-pointer"
                  style={{ padding: '14px' }}
                  value={filterIndustry} 
                  onChange={e => {setFilterIndustry(e.target.value); setCurrentPage(1);}}
                >
                  <option value="">직종 전체선택</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-500 flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" /> 요구 경력
                </label>
                <select 
                  className="w-full bg-slate-50/50 focus:bg-white border border-[#E2E8F0] rounded-xl text-[15px] font-semibold text-slate-700 outline-none focus:border-[#004C99] focus:ring-1 focus:ring-[#004C99] transition-all cursor-pointer"
                  style={{ padding: '14px' }}
                  value={filterExp} 
                  onChange={e => {setFilterExp(e.target.value); setCurrentPage(1);}}
                >
                  <option value="">경력사항 전체</option>
                  <option value="신입">신입 (Junior)</option>
                  <option value="경력">경력 (Senior)</option>
                </select>
              </div>
            </div>

            <button 
              className="mt-2 w-full py-3.5 rounded-xl border border-[#004C99]/20 bg-[#004C99]/5 text-[#004C99] hover:bg-[#004C99]/10 active:scale-98 font-bold transition-all text-[15px] flex items-center justify-center gap-2"
              onClick={() => {
                setFilterCountry("");
                setFilterIndustry("");
                setFilterExp("");
                setCurrentPage(1);
              }}
            >
              <RefreshCw size={15} />
              조건 초기화
            </button>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Elegant Hero Section with High Contrast White Text */}
          <div 
            className="w-full rounded-2xl p-8 md:p-12 mb-8 shadow-lg relative overflow-hidden flex flex-col justify-center"
            style={{ 
              background: "linear-gradient(135deg, #0B1938 0%, #0F2D6B 60%, #004C99 100%)"
            }}
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-3xl">
              {/* Pulsing AI Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[12px] font-bold tracking-wider uppercase mb-5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                Hermes AI Interview v2.0
              </div>

              <h1 
                className="text-[28px] md:text-[36px] font-black leading-[1.3] mb-4 tracking-tight break-keep"
                style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
              >
                글로벌 기업 현장 HR 담당자의 <br className="hidden md:block" />초압박 AI 모의면접을 경험해 보십시오.
              </h1>
              
              <p 
                className="text-[15px] md:text-[16px] text-blue-100/90 max-w-2xl font-normal leading-relaxed break-keep"
                style={{ color: '#E0F2FE' }}
              >
                Job-Ora(잡오라)는 대한민국 청년의 성공적인 해외 진출을 지원하는 맞춤형 모의면접 서비스입니다. 채용공고 분석부터 실시간 평가 리포트까지 원스톱으로 지원합니다.
              </p>
            </div>
            
            {/* Background decoration */}
            <div className="absolute right-[-20px] top-[-30px] opacity-10 transform rotate-12 scale-[1.3] hidden md:block text-white">
              <Globe size={260} />
            </div>
          </div>

          {/* AI Agent Collaboration Board */}
          <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-6 md:p-8 mb-8 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-72 h-72 bg-blue-50 rounded-full blur-3xl -translate-y-24 translate-x-20 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#004C99]/5 text-[#004C99] text-[12px] font-black mb-3 border border-[#004C99]/10">
                  <Sparkles size={14} /> Job-Ora AI Agent Collaboration Board
                </div>
                <h2 className="text-[22px] md:text-[26px] font-black text-[#0F172A] tracking-tight">
                  기업별 인재상에 맞춰 3개의 AI 에이전트가 함께 면접을 설계합니다
                </h2>
                <p className="text-slate-500 text-[14px] md:text-[15px] mt-2 leading-relaxed break-keep">
                  단순 공통 질문이 아니라, 지원 기업의 문화와 직무 요구를 분석한 뒤 질문·꼬리질문·평가 리포트를 단계별로 생성합니다.
                </p>
              </div>
              <button
                onClick={() => router.push("/interview")}
                className="self-start md:self-auto inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#004C99] text-white px-5 py-3 rounded-xl font-black text-[14px] transition-all shadow-lg shadow-slate-900/10"
              >
                AI 면접 시작 <ArrowRight size={16} />
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {AI_AGENTS.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <div key={agent.name} className="relative rounded-2xl border border-slate-100 bg-slate-50/60 p-5 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white shadow-lg`}>
                        <Icon size={23} />
                      </div>
                      <span className="text-[12px] font-black text-slate-400">STEP {index + 1}</span>
                    </div>
                    <p className="text-[12px] font-black text-[#004C99] uppercase tracking-wide mb-1">{agent.role}</p>
                    <h3 className="text-[17px] font-black text-[#0F172A] mb-2">{agent.name}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-500 break-keep">{agent.description}</p>
                    {index < AI_AGENTS.length - 1 && (
                      <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-[#004C99] shadow-sm z-20">
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Search Results Header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-200/80 pb-4">
            <h2 className="text-[22px] font-extrabold text-[#0F172A] flex items-center gap-2">
              실시간 채용공고
            </h2>
            <span className="text-slate-500 text-[14px] font-bold bg-slate-100 px-3.5 py-1.5 rounded-full">
              총 <span className="text-[#004C99]">{filteredCompanies.length}</span>건 추천됨
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {currentCompanies.map((company) => (
              <div 
                key={company.id} 
                className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 p-6 md:p-8 flex flex-col justify-between cursor-pointer relative overflow-hidden group"
                onClick={() => router.push(`/job/${company.id}`)}
              >
                {/* Visual Accent Top Bar */}
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#004C99]/30 to-[#004C99]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 mb-2">
                        <span className="text-[16px] leading-none">{company.flag}</span>
                        {company.country}
                      </span>
                      <h3 className="text-[20px] font-black text-[#0F172A] leading-snug mb-1 group-hover:text-[#004C99] transition-colors">
                        {company.name}
                      </h3>
                      <span className="text-[13px] text-[#0066CC] font-bold bg-[#EBF5FF] px-2.5 py-1 rounded-[6px] self-start mt-1">
                        {company.industry}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-[16px] text-slate-700 mb-3">{company.jobRole}</h4>
                  
                  {/* Tag Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="border border-slate-100 bg-slate-50/50 text-slate-600 text-[12px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1">
                      요건: {company.experience}
                    </span>
                    <span className="border border-slate-100 bg-slate-50/50 text-slate-600 text-[12px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1">
                      급여: {company.salary.split('~')[0]}
                    </span>
                    {company.visaSupport && (
                      <span className="border border-[#E0E7FF] bg-[#EEF2FF] text-[#4F46E5] text-[12px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1">
                        비자 지원
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-500 text-[14px] line-clamp-3 leading-relaxed mb-4 h-[66px] overflow-hidden text-ellipsis">
                    {company.description}
                  </p>
                </div>
                
                <div className="pt-5 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[14px] font-extrabold text-[#004C99] inline-flex items-center gap-1.5 cursor-pointer group-hover:underline">
                    이력서 투입 후 모의면접 시작 
                    <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </span>
                </div>
              </div>
            ))}
            
            {filteredCompanies.length === 0 && (
              <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 bg-white rounded-2xl">
                <p className="text-[16px] font-extrabold text-slate-500 mb-1">조건에 맞는 채용공고가 존재하지 않습니다.</p>
                <p className="text-[14px] text-slate-400">필터(국가, 직종, 요건)를 변경해 주십시오.</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4 mb-12 w-full">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-5 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center gap-1.5 ${
                  currentPage === 1 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent' 
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:text-[#004C99] hover:border-[#004C99] active:scale-95 shadow-sm'
                }`}
              >
                &larr; 이전
              </button>
              <span className="text-[15px] font-bold text-slate-700 bg-white border border-[#E2E8F0] px-4 py-3 rounded-xl shadow-sm">
                {currentPage} <span className="text-slate-400 font-normal">/ {totalPages}</span>
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-5 py-3 rounded-xl font-bold text-[14px] transition-all flex items-center gap-1.5 ${
                  currentPage === totalPages 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-transparent' 
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A] hover:text-[#004C99] hover:border-[#004C99] active:scale-95 shadow-sm'
                }`}
              >
                다음 &rarr;
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
