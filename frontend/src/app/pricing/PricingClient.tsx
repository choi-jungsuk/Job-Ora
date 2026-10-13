"use client";

import { useState } from "react";
import Link from "next/link";
import { PRICING_PLANS, PricingPlan } from "@/data/companyInfo";
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  CreditCard,
  X,
  Mail,
  Loader2,
} from "lucide-react";
import { loadTossPayments } from "@tosspayments/payment-sdk";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const TOSS_CLIENT_KEY =
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ||
  "test_ck_D5GePWvyJqK4WnvBaexg3N7Xo1m5";

export default function PricingClient() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleOpenModal = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setEmailError("");
    setErrorMessage("");
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setSelectedPlan(null);
    setEmailError("");
    setErrorMessage("");
  };

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("결제 안내를 받을 이메일을 입력해 주세요.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    setEmailError("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      // 1. 백엔드 주문 생성 API 호출
      const orderRes = await fetch(`${API_BASE_URL}/payments/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: selectedPlan.productId,
          customer_email: trimmedEmail,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "주문 생성에 실패했습니다. 다시 시도해 주세요."
        );
      }

      const orderData = await orderRes.json();

      // 2. 토스페이먼츠 SDK 로드 및 결제창 호출
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);

      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://job-ora.com";

      await tossPayments.requestPayment("카드", {
        amount: orderData.amount,
        orderId: orderData.order_id,
        orderName: orderData.order_name,
        customerEmail: orderData.customer_email,
        successUrl: `${origin}/payments/success`,
        failUrl: `${origin}/payments/fail`,
      });
    } catch (err: unknown) {
      console.error("[Payment Error]", err);
      const tossError = err as { code?: string; message?: string };
      if (tossError.code === "USER_CANCEL") {
        setErrorMessage("결제가 취소되었습니다.");
      } else {
        setErrorMessage(
          tossError.message ||
            "결제 진행 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
            Job-Ora는 해외취업을 준비하는 청년과 취업준비생을 위한 AI 모의면접 연습 서비스입니다.
            목표 기업과 직무에 맞춘 AI 질문 응답 연습과 피드백을 부담 없는 가격으로 제공합니다.
          </p>
        </div>

        {/* 상품 카드 목록 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {PRICING_PLANS.map((plan) => {
            const isRecommended = plan.id === "basic_interview";
            const buttonText =
              plan.id === "trial_interview"
                ? "1,000원 결제하기"
                : "2,000원 결제하기";

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

                {/* 결제 버튼 영역 */}
                <div className="space-y-2 mt-auto">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                      isRecommended
                        ? "bg-[#004C99] hover:bg-[#003875] text-white shadow-blue-900/10"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <CreditCard size={18} />
                    <span>{buttonText}</span>
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
              { step: "01", title: "자료 입력", desc: "지원하려는 기업정보 또는 채용공고를 직접 입력합니다." },
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

      {/* 심사용 결제 정보 입력 모달 */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={handleCloseModal}
              disabled={isLoading}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1"
              aria-label="닫기"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-[#004C99] mb-2">
                토스페이먼츠 안전 결제
              </span>
              <h3 className="text-xl font-bold text-slate-900">결제 정보 확인</h3>
              <p className="text-sm text-slate-500 mt-1">
                주문 내용을 확인하고 안내받을 이메일을 입력해 주세요.
              </p>
            </div>

            {/* 상품 요약 박스 */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">선택 상품</span>
                <span className="font-bold text-slate-900">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">제공 혜택</span>
                <span className="font-medium text-slate-800">모의면접 이용권 1회 (30일 유효)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-semibold text-slate-700 text-sm">최종 결제 금액</span>
                <span className="text-2xl font-black text-[#004C99]">
                  {selectedPlan.priceFormatted}
                </span>
              </div>
            </div>

            {/* 이메일 입력 폼 */}
            <form onSubmit={handleStartPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Mail size={16} className="text-[#004C99]" />
                  결제 안내를 받을 이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="예: user@example.com"
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004C99]/30 focus:border-[#004C99] text-sm text-slate-900 transition-all placeholder:text-slate-400"
                />
                {emailError && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">{emailError}</p>
                )}
                <p className="text-xs text-slate-500 mt-1.5">
                  결제 완료 영수증 및 이용권 발급 내역이 해당 이메일로 안내됩니다.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[#004C99] hover:bg-[#003875] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-900/10 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>결제창 연결 중...</span>
                    </>
                  ) : (
                    <span>결제 진행하기</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
