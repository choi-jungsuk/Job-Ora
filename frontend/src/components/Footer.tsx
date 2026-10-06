import Link from "next/link";
import { COMPANY_INFO } from "@/data/companyInfo";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-[13px] border-t border-slate-800 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* 상단: 서비스 면책 및 성격 고지 */}
        <div className="bg-slate-800/60 rounded-xl p-5 mb-8 border border-slate-700/60 space-y-2">
          <p className="text-slate-200 font-semibold leading-relaxed">
            Job-Ora는 사용자가 입력한 채용공고·기업정보·직무정보를 바탕으로 면접 질문과 답변 피드백을 제공하는 AI 모의면접 서비스입니다. 채용정보 제공, 직업소개, 취업 알선, 기업 매칭은 제공하지 않습니다.
          </p>
          <p className="text-slate-400 text-[12px] leading-relaxed">
            Job-Ora는 사용자가 준비 중인 지원 건에 대해 면접 연습을 돕는 보조 도구입니다. 채용공고의 정확성, 채용 여부, 비자 승인 여부, 고용 조건은 해당 공고 제공처 또는 관련 기관을 통해 직접 확인해야 합니다.
          </p>
        </div>

        {/* 중단: 정책 및 바로가기 링크 */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-6 border-b border-slate-800 text-slate-300 font-semibold text-[14px]">
          <Link href="/pricing" className="hover:text-white transition-colors">
            가격 안내
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/terms" className="hover:text-white transition-colors">
            이용약관
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/privacy" className="hover:text-white transition-colors">
            개인정보처리방침
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/refund" className="hover:text-white transition-colors">
            환불정책
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            고객문의
          </Link>
          <span className="text-slate-700">|</span>
          <Link href="/about" className="hover:text-white transition-colors">
            회사 소개
          </Link>
        </div>

        {/* 하단: 사업자 정보 및 저작권 */}
        <div className="pt-6 space-y-2 leading-relaxed text-slate-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-slate-200 font-medium">{COMPANY_INFO.legalName}</span>
            <span className="text-slate-700">|</span>
            <span>대표: {COMPANY_INFO.representative}</span>
            <span className="text-slate-700">|</span>
            <span>사업자등록번호: {COMPANY_INFO.businessRegistrationNumber}</span>
            <span className="text-slate-700">|</span>
            <span>통신판매업 신고: {COMPANY_INFO.mailOrderSalesRegistration}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              고객문의:{" "}
              <a
                href={`mailto:${COMPANY_INFO.supportEmail}`}
                className="text-slate-300 hover:text-white underline underline-offset-2"
              >
                {COMPANY_INFO.supportEmail}
              </a>
            </span>
            <span className="text-slate-700">|</span>
            <span>운영시간: {COMPANY_INFO.operatingHours}</span>
          </div>

          <div className="pt-4 text-slate-500 text-[12px]">
            © {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
