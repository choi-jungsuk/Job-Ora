import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANY_INFO } from "@/data/companyInfo";
import { RefreshCcw, CheckCircle2, XCircle, AlertTriangle, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "환불정책 | Job-Ora",
  description: "Job-Ora AI 모의면접 서비스의 환불 가능 기준, 환불 제한 사유, 시스템 오류 보상 및 환불 접수 절차 안내입니다.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />

      <main className="max-w-[960px] w-full mx-auto px-4 md:px-8 py-12 flex-1">
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-6 md:p-12">
          {/* 헤더 */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="flex items-center gap-2 text-[#004C99] font-bold text-sm mb-2">
              <RefreshCcw size={18} />
              <span>투명한 환불 규정</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Job-Ora 환불정책
            </h1>
            <p className="text-slate-500 text-[14px] mt-2">
              최종 수정일: 2026년 9월 9일 | 시행일: 2026년 9월 9일
            </p>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">
            Job-Ora는 소액 이용권 기반의 디지털 AI 모의면접 서비스입니다. 결제 후 서비스 이용 상태 및 제공 단계에 따라 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 의거하여 다음과 같이 공정하고 투명한 환불 기준을 운영합니다.
          </p>

          <div className="space-y-10 text-[15px] leading-relaxed">
            {/* 1. 환불 가능 기준 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
                1. 환불 가능 기준
              </h2>
              <p className="text-slate-700 mb-3">다음의 경우에는 전액 환불 또는 결제 취소가 가능합니다.</p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  <span><strong>미사용 이용권:</strong> 결제 완료 후 AI 모의면접 세션을 시작하지 않은 경우 (결제일로부터 7일 이내 청약철회 가능)</span>
                </li>
                <li className="flex items-start gap-2.5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  <span><strong>중복 결제:</strong> 동일 이용권이 시스템 착오나 통신 오류로 2회 이상 중복 결제된 경우 초과분 전액 환불</span>
                </li>
                <li className="flex items-start gap-2.5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  <span><strong>시스템 장애:</strong> 회사의 서버 장애나 심각한 오류로 모의면접이 중단되어 정상 이용이 불가능했던 경우</span>
                </li>
                <li className="flex items-start gap-2.5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                  <span><strong>서비스 불가:</strong> 회사의 사정으로 약정된 서비스를 영구히 제공할 수 없다고 판단한 경우</span>
                </li>
              </ul>
            </article>

            {/* 2. 환불 제한 기준 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <XCircle size={20} className="text-rose-600" />
                2. 환불 제한 기준
              </h2>
              <p className="text-slate-700 mb-3">다음의 경우에는 디지털 콘텐츠의 특성상 환불이 제한될 수 있습니다.</p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0"></span>
                  <span><strong>모의면접 시작 및 완료:</strong> 이용자가 모의면접을 시작하여 AI 맞춤 질문 생성, 꼬리질문, 피드백 리포트 등 디지털 연산 리소스가 이미 제공된 경우</span>
                </li>
                <li className="flex items-start gap-2.5 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0"></span>
                  <span><strong>이용자 환경 귀책:</strong> 이용자의 개인 네트워크 단절, 마이크/브라우저 권한 미허용, 하드웨어 호환 문제 등으로 정상 이용이 중단된 경우</span>
                </li>
                <li className="flex items-start gap-2.5 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0"></span>
                  <span><strong>부정 이용 및 약관 위반:</strong> 타인 계정 도용, 허위 사실 기재, 시스템 우회 시도 등 약관 위반으로 제재를 받은 경우</span>
                </li>
                <li className="flex items-start gap-2.5 bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/80 text-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0"></span>
                  <span><strong>유효기간 만료:</strong> 결제일로부터 30일이 경과하여 이용권이 만료된 경우</span>
                </li>
              </ul>
            </article>

            {/* 3. 시스템 오류 발생 시 보상 처리 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" />
                3. 시스템 오류 발생 시 조치
              </h2>
              <p className="text-slate-700 mb-3">
                서비스 중단이나 네트워크 오류로 모의면접이 비정상 종료된 경우, 서버 이용 로그를 확인하여 고객님의 불편이 없도록 다음 조치를 우선 제공합니다.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                  <strong className="block text-slate-900 text-sm mb-1">동일 이용권 재지급</strong>
                  <span className="text-slate-500 text-xs">잔여 횟수 차감 없이 재이용 가능하도록 즉시 복구</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                  <strong className="block text-slate-900 text-sm mb-1">결제금액 환불</strong>
                  <span className="text-slate-500 text-xs">재이용을 원하지 않으실 경우 원결제 수단으로 취소</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                  <strong className="block text-slate-900 text-sm mb-1">오류 복구 및 개별 안내</strong>
                  <span className="text-slate-500 text-xs">오류 원인 파악 후 담당자 이메일 개별 피드백</span>
                </div>
              </div>
            </article>

            {/* 4. 환불 요청 방법 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Mail size={20} className="text-[#004C99]" />
                4. 환불 신청 절차
              </h2>
              <p className="text-slate-700 mb-3">
                환불 신청은 고객센터 공식 이메일로 접수하실 수 있습니다. 아래 양식에 맞춰 작성해 주시면 신속히 처리해 드립니다.
              </p>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 space-y-2 text-sm text-slate-700">
                <p><strong>접수처:</strong> <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-[#004C99] underline font-semibold">{COMPANY_INFO.supportEmail}</a></p>
                <div className="pt-2 border-t border-slate-200 text-slate-600">
                  <p className="font-semibold text-slate-800 mb-1">[환불 신청 기재 사항]</p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    <li>결제자 이메일 (계정 정보)</li>
                    <li>주문번호 또는 결제 영수증 식별자</li>
                    <li>결제 일시 및 상품명</li>
                    <li>환불 사유 (오류 시 화면 캡처 첨부 권장)</li>
                  </ul>
                </div>
              </div>
            </article>

            {/* 5. 처리 기간 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Clock size={20} className="text-slate-700" />
                5. 환불 처리 기간
              </h2>
              <p className="text-slate-700">
                환불 접수 후 영업일 기준 <strong>3~5일 이내</strong>에 확인 및 승인 처리를 진행합니다. 신용카드 및 간편결제 결제 취소 승인 후 실제 계좌 입금 또는 청구 취소 시점은 해당 카드사 및 결제대행사(토스페이먼츠 등)의 환불 정책 및 영업일 기준에 따라 상이할 수 있습니다.
              </p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
