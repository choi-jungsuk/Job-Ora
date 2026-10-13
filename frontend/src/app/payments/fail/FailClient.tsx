"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RotateCcw, Mail, HelpCircle } from "lucide-react";
import { COMPANY_INFO } from "@/data/companyInfo";

export default function FailClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "PAYMENT_INCOMPLETE";
  const message =
    searchParams.get("message") ||
    "결제가 정상적으로 완료되지 않았거나 취소되었습니다.";
  const orderId = searchParams.get("orderId");

  return (
    <main className="max-w-[640px] w-full mx-auto px-4 py-16 flex-1">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_12px_36px_rgba(15,23,42,0.06)] p-6 sm:p-10">
        {/* 상단 실패 아이콘 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <AlertCircle size={36} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100 mb-3">
            결제 미완료
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            결제가 완료되지 않았습니다
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            요청하신 결제가 정상적으로 처리되지 못했습니다. 아래 내용을 확인해 주세요.
          </p>
        </div>

        {/* 실패 상세 정보 */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-3.5 mb-8">
          {orderId && (
            <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200">
              <span className="text-slate-500 font-medium">주문번호</span>
              <span className="font-mono text-slate-800 text-xs font-bold">
                {orderId}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">실패 코드</span>
            <span className="font-mono text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">
              {code}
            </span>
          </div>

          <div className="text-sm pt-1">
            <span className="text-slate-500 font-medium block mb-1">실패 사유</span>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
              {message}
            </div>
          </div>
        </div>

        {/* 고객지원 안내 카드 */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70 mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <HelpCircle size={15} className="text-[#004C99]" />
            <span>결제 관련 문제가 지속되시나요?</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            카드 한도 초과, 통신 오류, 또는 기타 승인 거절 시 결제가 완료되지 않을 수 있습니다.
            궁금한 점이나 환불·오류 문의는 고객지원 이메일로 연락주시면 신속히 확인해 드리겠습니다.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-slate-700 font-medium">
            <Mail size={14} className="text-slate-400" />
            <span>고객문의 이메일:</span>
            <a
              href={`mailto:${COMPANY_INFO.supportEmail}`}
              className="text-[#004C99] underline font-bold"
            >
              {COMPANY_INFO.supportEmail}
            </a>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="w-full py-4 px-6 rounded-xl font-bold text-[15px] bg-[#004C99] hover:bg-[#003875] text-white transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-900/10 text-center"
          >
            <RotateCcw size={18} />
            <span>다시 결제하기</span>
          </Link>
          <Link
            href="/"
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-center block"
          >
            메인 홈으로 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
