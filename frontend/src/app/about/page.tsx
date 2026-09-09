import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANY_INFO } from "@/data/companyInfo";
import { Globe2, Sparkles, Target, Compass, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "회사 및 서비스 소개 | Job-Ora",
  description: "글로벌 취업을 준비하는 인재들을 위한 AI 실전 모의면접 파트너, Job-Ora와 주식회사 그란오소를 소개합니다.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />

      <main className="max-w-[1024px] w-full mx-auto px-4 md:px-8 py-12 flex-1">
        {/* 상단 히어로 */}
        <section className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-blue-50 text-[#004C99] border border-blue-100 mb-4">
            <Globe2 size={16} />
            Global Career Interview Partner
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            해외취업 준비의 새로운 기준,<br />
            <span className="text-[#004C99]">Job-Ora</span>가 함께합니다.
          </h1>
          <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">
            Job-Ora는 목표 글로벌 기업의 채용공고와 지원자의 이력서를 심층 분석하여, 현업 채용 담당자 관점의 맞춤형 질문과 실전 꼬리질문으로 면접 역량 강화를 돕는 AI 모의면접 연습 서비스입니다.
          </p>
        </section>

        {/* 핵심 가치 카드 3종 */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#004C99] flex items-center justify-center mb-5 font-bold">
              <Target size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">기업 DNA 맞춤 분석</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              지원 기업의 비전, 핵심 가치, 최신 채용 요건을 다각도로 분석하여 기업이 실제로 찾는 인재상에 최적화된 질문을 제시합니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 font-bold">
              <Sparkles size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">실시간 꼬리질문 검증</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              정형화된 문답이 아닌, 지원자의 실제 답변 내용의 구체성과 논리적 근거를 바탕으로 심층 꼬리질문을 유기적으로 진행합니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 font-bold">
              <Compass size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">객관적인 피드백 리포트</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              면접 세션 종료 후 답변의 명확성, 직무 역량 적합성, 개선 포인트를 체계적인 종합 리포트로 즉시 피드백합니다.
            </p>
          </div>
        </section>

        {/* 운영사 소개 및 신뢰 고지 */}
        <section className="bg-white rounded-2xl border border-slate-200/70 p-8 md:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.04)] mb-12">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-4">
            <ShieldCheck size={20} className="text-[#004C99]" />
            운영사 소개 및 서비스 철학
          </div>
          <p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
            Job-Ora는 <strong>{COMPANY_INFO.legalName}</strong>가 연구·개발하는 AI 기반 취업 역량 솔루션입니다. 우리는 취업준비생들이 겪는 정보 비대칭과 막연한 면접 불안감을 해소하고, 누구나 합리적인 비용으로 양질의 실전 면접 연습을 할 수 있도록 지원합니다.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed">
            <strong>투명한 운영 고지:</strong> Job-Ora는 구직자의 주체적인 면접 역량 강화를 돕는 연습 도구이며, 특정 기업의 합격이나 채용을 보증하거나 대리하지 않습니다. AI 질문과 분석 피드백은 참고 자료로 제공되며, 최종 지원 결정 및 면접 응시는 지원자 본인의 책임하에 진행됩니다.
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              궁금한 점이 있으시거나 제휴를 원하시나요?
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-bold text-[#004C99] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                이용권 안내 보기
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 text-sm font-bold text-white bg-[#004C99] rounded-lg hover:bg-[#00366D] transition-colors flex items-center gap-1"
              >
                문의하기
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
