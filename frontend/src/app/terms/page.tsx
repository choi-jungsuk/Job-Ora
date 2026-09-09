import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANY_INFO } from "@/data/companyInfo";

export const metadata: Metadata = {
  title: "이용약관 | Job-Ora",
  description: "Job-Ora(주식회사 그란오소) 서비스 이용 조건 및 절차, 권리와 의무, 책임사항을 규정하는 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />

      <main className="max-w-[960px] w-full mx-auto px-4 md:px-8 py-12 flex-1">
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-6 md:p-12">
          {/* 타이틀 헤더 */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Job-Ora 이용약관
            </h1>
            <p className="text-slate-500 text-[14px] mt-2">
              최종 수정일: 2026년 9월 9일 | 시행일: 2026년 9월 9일
            </p>
          </div>

          <div className="space-y-8 text-[15px] leading-relaxed text-slate-700">
            {/* 제1조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제1조</span> (목적)
              </h2>
              <p>
                본 약관은 <strong>{COMPANY_INFO.legalName}</strong>(이하 &ldquo;회사&rdquo;)가 운영하는 <strong>Job-Ora</strong> 서비스(이하 &ldquo;서비스&rdquo;)의 이용 조건, 절차, 권리와 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </article>

            {/* 제2조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제2조</span> (서비스의 내용)
              </h2>
              <p>
                Job-Ora는 해외취업 준비생 및 구직자를 대상으로 목표 기업, 직무, 채용공고, 이력서 또는 자기소개 내용을 기반으로 AI 모의면접 질문 생성, 꼬리질문 진행, 답변 피드백 리포트를 제공하는 온라인 연습 서비스입니다.
              </p>
            </article>

            {/* 제3조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제3조</span> (회원가입 및 계정 관리)
              </h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>이용자는 이메일 계정 등 회사가 정한 방식을 통해 회원가입 또는 로그인을 신청할 수 있습니다.</li>
                <li>이용자는 본인의 계정 및 비밀번호 정보를 성실하게 관리해야 하며, 제3자에게 양도하거나 대여할 수 없습니다.</li>
                <li>타인의 정보를 도용하거나 허위 사실을 기재한 경우, 회사는 서비스 이용을 제한하거나 회원 자격을 정지할 수 있습니다.</li>
              </ol>
            </article>

            {/* 제4조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제4조</span> (유료 이용권 구매 및 사용)
              </h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>이용자는 회사가 연동한 결제대행(PG) 수단을 통해 모의면접 이용권을 유료로 구매할 수 있습니다.</li>
                <li>결제가 성공적으로 완료되면 이용권은 즉시 이용자의 계정에 지급됩니다.</li>
                <li>구매한 이용권의 기본 유효기간은 <strong>결제일로부터 30일</strong>입니다.</li>
                <li>이용권은 AI 모의면접 세션을 시작(질문 생성 요청)하는 시점에 차감 사용 처리됩니다.</li>
                <li>회사는 서비스 운영 상황에 따라 상품 구성, 가격, 제공 범위를 변경할 수 있으며, 변경 사항은 사전에 사이트 내에 공지합니다.</li>
              </ol>
            </article>

            {/* 제5조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제5조</span> (환불)
              </h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>결제 완료 후 모의면접 세션을 시작하지 않은 미사용 이용권은 결제 취소 및 전액 환불 요청이 가능합니다.</li>
                <li>모의면접을 시작한 경우 AI 컴퓨팅 리소스가 즉시 소모되므로 관련 법령(전자상거래 등에서의 소비자보호에 관한 법률 등)에 따라 환불이 제한될 수 있습니다.</li>
                <li>회사의 귀책 사유 또는 시스템 오류로 인해 정상적인 모의면접 진행이 불가능했던 경우 회사는 확인 후 이용권 재지급 또는 환불 조치를 진행합니다.</li>
                <li>중복 결제가 발생한 경우 확인 후 즉시 초과 결제분을 전액 환불 처리합니다.</li>
                <li>세부적인 환불 요건 및 절차는 별도의 <a href="/refund" className="text-[#004C99] underline font-medium">환불정책</a>에 따릅니다.</li>
              </ol>
            </article>

            {/* 제6조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제6조</span> (이용자의 금지행위)
              </h2>
              <p className="mb-2">이용자는 본 서비스 이용 시 다음 각 호의 행위를 하여서는 안 됩니다.</p>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>타인의 개인정보, 신용카드 정보, 계정 정보를 도용하는 행위</li>
                <li>허위 정보 또는 타인의 저작물을 무단 입력하는 행위</li>
                <li>서비스의 시스템을 해킹하거나 결제 절차를 우회·비정상적으로 조작하는 행위</li>
                <li>AI 모의면접 결과를 악의적이거나 불법적인 용도로 재가공·배포하는 행위</li>
                <li>회사 또는 제3자의 지식재산권 및 기타 권리를 침해하거나 업무를 방해하는 행위</li>
              </ol>
            </article>

            {/* 제7조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제7조</span> (개인정보 보호)
              </h2>
              <p>
                회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하며, 세부적인 사항은 별도로 고지된 <a href="/privacy" className="text-[#004C99] underline font-medium">개인정보처리방침</a>에 따릅니다.
              </p>
            </article>

            {/* 제8조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제8조</span> (서비스의 변경 또는 중단)
              </h2>
              <p>
                회사는 정기 점검, 시스템 개선, 통신망 장애, 외부 AI API 제공자의 일시적 장애 또는 천재지변 등의 불가항력적 사유가 발생하는 경우 서비스 제공을 일시적으로 중단하거나 변경할 수 있습니다. 이 경우 사이트를 통해 사전 또는 사후에 공지합니다.
              </p>
            </article>

            {/* 제9조 */}
            <article className="bg-amber-50/60 p-5 rounded-xl border border-amber-200/80">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제9조</span> (면책 고지)
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-slate-800">
                <li><strong>Job-Ora는 취업 준비를 돕기 위한 연습·학습 보조 서비스이며, 이용자의 특정 기업 채용, 합격, 고용 승인을 일체 보장하지 않습니다.</strong></li>
                <li>AI가 생성한 모의면접 질문, 평가, 점수, 피드백은 데이터 기반의 참고용 의견일 뿐이며, 실제 채용 기업의 평가 기준이나 면접 결과와 상이할 수 있습니다.</li>
                <li>회사는 이용자가 서비스의 결과를 신뢰하여 결정한 취업 지원 결과나 직무 선택에 대해 법적 책임을 지지 않습니다.</li>
              </ol>
            </article>

            {/* 제10조 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-[#004C99]">제10조</span> (문의 및 분쟁 해결)
              </h2>
              <p>
                서비스 이용, 결제, 환불 등과 관련한 모든 문의 및 불만 처리는 회사의 공식 문의 창구를 통해 접수하실 수 있습니다.
              </p>
              <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                <p><strong>운영 주체:</strong> {COMPANY_INFO.legalName}</p>
                <p><strong>대표 문의 이메일:</strong> <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-[#004C99] underline">{COMPANY_INFO.supportEmail}</a></p>
                <p><strong>운영 시간:</strong> {COMPANY_INFO.operatingHours}</p>
              </div>
            </article>

            {/* 부칙 */}
            <div className="pt-6 border-t border-slate-200 text-slate-500 text-sm">
              <p><strong>부칙</strong></p>
              <p className="mt-1">본 약관은 2026년 9월 9일부터 적용됩니다.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
