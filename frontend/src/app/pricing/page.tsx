import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PRICING_PLANS } from "@/data/companyInfo";
import { CheckCircle2, AlertCircle, ShieldCheck, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "가격 및 상품 안내 | Job-Ora",
  description: "Job-Ora의 AI 모의면접 이용권 가격 및 상품 안내입니다. 해외취업 준비생을 위한 합리적인 모의면접 이용권을 확인하세요.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />
      
      <main className="max-w-[1024px] w-full mx-auto px-4 md:px-8 py-12 flex-1">
        {/* 헤더 섹션 */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-blue-50 text-[#004C99] border border-blue-100 mb-4">
            <ShieldCheck size={16} />
            투명하고 합리적인 소액 결제
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Job-Ora 이용권 안내
          </h1>
          <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">
            Job-Ora는 해외취업을 준비하는 청년과 취업준비생을 위한 AI 모의면접 연습 서비스입니다. 목표 기업과 직무에 맞춘 AI 질문 응답 연습과 피드백을 부담 없는 가격으로 제공합니다.
          </p>
        </div>

        {/* 상품 카드 목록 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {PRICING_PLANS.map((plan) => {
            const isRecommended = plan.id === "standard";
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 flex flex-col transition-all bg-white border ${
                  isRecommended
                    ? "border-[#004C99] shadow-[0_12px_36px_rgba(0,76,153,0.12)] ring-1 ring-[#004C99]/20"
                    : "border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 right-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-extrabold uppercase tracking-wide shadow-sm ${
                        isRecommended
                          ? "bg-[#004C99] text-white"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                  <p className="text-slate-500 text-[14px] mt-2 leading-relaxed min-h-[42px]">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-slate-100">
                  <span className="text-3xl md:text-4xl font-black text-slate-900">
                    {plan.priceFormatted}
                  </span>
                  <span className="text-slate-500 text-[14px] font-medium">/ 1회</span>
                  <span className="ml-auto text-[13px] text-slate-500 flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <Clock size={14} />
                    {plan.period}
                  </span>
                </div>

                {/* 포함된 혜택 */}
                <div className="space-y-3 mb-8 flex-1">
                  <p className="text-[13px] font-bold text-slate-800 tracking-wide uppercase">
                    제공 내용
                  </p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-slate-700 text-[14px]">
                      <CheckCircle2
                        size={18}
                        className={`flex-shrink-0 mt-0.5 ${
                          isRecommended ? "text-[#004C99]" : "text-slate-400"
                        }`}
                      />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 버튼 영역 */}
                <div className="space-y-2 mt-auto">
                  <button
                    disabled
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-[15px] bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed text-center transition-all"
                  >
                    결제 준비 중 (심사 승인 후 오픈)
                  </button>
                  <Link
                    href="/contact"
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-[13px] text-[#004C99] hover:bg-blue-50/70 border border-transparent hover:border-blue-100 text-center transition-all block"
                  >
                    베타 이용 및 단체 문의하기 &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* 이용 절차 섹션 */}
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-6 md:p-10 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#004C99] rounded-full inline-block"></span>
            이용 절차
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: "01", title: "공고 선택", desc: "목표 기업 또는 채용공고를 선택합니다." },
              { step: "02", title: "정보 입력", desc: "이력서 또는 자기소개 내용을 입력합니다." },
              { step: "03", title: "이용권 구매", desc: "원하는 모의면접 이용권을 선택 후 결제합니다." },
              { step: "04", title: "이용권 지급", desc: "결제 완료 후 이용자 계정에 즉시 지급됩니다." },
              { step: "05", title: "면접 진행", desc: "AI 모의면접을 진행하고 피드백을 확인합니다." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 flex flex-col relative"
              >
                <span className="text-[12px] font-black text-[#004C99] mb-1 tracking-wider">
                  STEP {item.step}
                </span>
                <h3 className="text-[15px] font-bold text-slate-800 mb-1.5">{item.title}</h3>
                <p className="text-[13px] text-slate-600 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 유의 및 환불 안내 섹션 */}
        <section className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 md:p-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
            이용 시 유의사항
          </h2>
          <ul className="space-y-2 text-slate-600 text-[14px] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>면접 연습 목적:</strong> Job-Ora는 면접 준비와 답변 개선을 돕는 연습 서비스입니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>결과 미보장:</strong> 본 서비스는 특정 기업의 채용, 합격, 취업 결과를 보장하지 않습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>AI 생성물 참고용:</strong> AI가 생성한 질문과 피드백은 참고용이며, 최종 지원 판단과 면접 준비의 책임은 이용자 본인에게 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>환불 규정:</strong> 결제 후 모의면접을 시작하기 전에는 취소 및 전액 환불이 가능하나, 면접이 시작된 이후에는 AI 리소스 사용으로 인해 환불이 제한될 수 있습니다. 자세한 내용은 <Link href="/refund" className="text-[#004C99] underline font-medium">환불정책</Link>을 확인해 주세요.</span>
            </li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
