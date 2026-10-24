"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

interface ConfirmResult {
  success: boolean;
  message: string;
  order_id: string;
  credit_id?: string;
  credit_token?: string;
  product_id?: string;
  product_name?: string;
  amount: number;
  credit_count?: number;
  expires_at?: string;
}

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amountStr = searchParams.get("amount");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConfirmResult | null>(null);

  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;

    if (!paymentKey || !orderId || !amountStr) {
      setError("결제 승인 검증에 필요한 파라미터(paymentKey, orderId, amount)가 누락되었습니다.");
      setIsLoading(false);
      return;
    }

    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      setError("올바르지 않은 결제 금액 정보입니다.");
      setIsLoading(false);
      return;
    }

    hasRequested.current = true;

    async function confirmPayment() {
      try {
        const storedOrderToken =
          typeof window !== "undefined"
            ? sessionStorage.getItem(`jobora_order_token_${orderId}`) || ""
            : "";

        const res = await fetch(`${API_BASE_URL}/payments/toss/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
            orderToken: storedOrderToken,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data.detail || "토스 결제 승인에 실패했습니다. 고객센터로 문의해 주세요."
          );
        }

        setResult(data);

        // 비회원 이용권 권한 토큰을 sessionStorage에 안전하게 보관 (URL에 노출하지 않음)
        if (data.credit_token) {
          sessionStorage.setItem(
            "jobora_active_credit",
            JSON.stringify({
              credit_id: data.credit_id,
              credit_token: data.credit_token,
              order_id: data.order_id,
              expires_at: data.expires_at,
            })
          );
        }
      } catch (err: unknown) {
        console.error("[Payment Confirm Error]", err);
        const e = err as Error;
        setError(e.message || "결제 승인 처리 중 예기치 못한 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    confirmPayment();
  }, [paymentKey, orderId, amountStr]);

  if (isLoading) {
    return (
      <main className="max-w-[640px] w-full mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <Loader2 size={36} className="animate-spin text-[#004C99]" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">결제 승인 검증 중</h1>
        <p className="text-slate-600 text-sm max-w-sm">
          토스페이먼츠 승인 및 이용권 발급 처리를 진행하고 있습니다. 잠시만 기다려 주세요.
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[640px] w-full mx-auto px-4 py-16 flex-1">
        <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">결제 승인 처리 실패</h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed whitespace-pre-line">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pricing"
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              가격 안내로 돌아가기
            </Link>
            <Link
              href="/contact"
              className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors inline-flex items-center justify-center"
            >
              고객센터 문의
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const productName =
    result?.product_name ||
    (result?.product_id === "basic_interview"
      ? "기본 모의면접 이용권"
      : "체험 모의면접 이용권");
  const formattedAmount = result?.amount
    ? `${result.amount.toLocaleString()}원`
    : `${parseInt(amountStr || "0", 10).toLocaleString()}원`;

  return (
    <main className="max-w-[680px] w-full mx-auto px-4 py-16 flex-1">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_12px_36px_rgba(15,23,42,0.06)] p-6 sm:p-10">
        {/* 상단 축하 배지 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 mb-3">
            <ShieldCheck size={14} />
            결제 정상 승인 완료
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            결제가 완료되었습니다
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            Job-Ora AI 모의면접 이용권이 성공적으로 지급되었습니다.
          </p>
        </div>

        {/* 결제 정보 내역 카드 */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3.5 mb-8">
          <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
            <span className="text-slate-500 font-medium">주문번호</span>
            <span className="font-mono text-slate-800 text-xs font-bold">
              {result?.order_id || orderId}
            </span>
          </div>

          {result?.credit_id && (
            <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
              <span className="text-slate-500 font-medium">이용권 번호</span>
              <span className="font-mono text-[#004C99] text-xs font-bold">
                {result.credit_id}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">상품명</span>
            <span className="font-bold text-slate-900">{productName}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">결제금액</span>
            <span className="font-black text-slate-900 text-base text-[#004C99]">
              {formattedAmount}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">지급 혜택</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <Sparkles size={13} />
              지급된 이용권 1회
            </span>
          </div>

          <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Clock size={14} />
              유효기간
            </span>
            <span className="font-semibold text-slate-700">
              결제일로부터 30일
            </span>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100/80 mb-8 text-xs text-slate-600 leading-relaxed space-y-1">
          <p className="font-bold text-[#004C99] flex items-center gap-1">
            <Sparkles size={14} />
            모의면접 이용 안내
          </p>
          <p>• 지금 바로 목표 기업 채용공고와 이력서를 입력하여 1:1 AI 모의면접을 시작하실 수 있습니다.</p>
          <p>• 결제 취소 및 환불 안내는 하단 및 <Link href="/refund" className="underline font-semibold text-[#004C99]">환불정책</Link>에서 확인 가능합니다.</p>
        </div>

        {/* 메인 액션 버튼: /interview 로 직결 */}
        <div className="space-y-3">
          <Link
            href="/interview"
            className="w-full py-4 px-6 rounded-xl font-bold text-[15px] bg-[#004C99] hover:bg-[#003875] text-white transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-900/10 text-center"
          >
            <span>모의면접 시작하기</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/pricing"
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-center block"
          >
            가격 안내로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}

