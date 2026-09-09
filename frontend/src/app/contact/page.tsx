import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANY_INFO } from "@/data/companyInfo";
import { Mail, Clock, Building2, HelpCircle, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "고객문의 및 사업자정보 | Job-Ora",
  description: "Job-Ora 고객지원 문의처(contact@granosoai.com) 및 주식회사 그란오소 공식 사업자등록 정보입니다.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />

      <main className="max-w-[960px] w-full mx-auto px-4 md:px-8 py-12 flex-1">
        <div className="space-y-8">
          {/* 상단 소개 헤더 */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-6 md:p-10">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
              고객문의 및 사업자정보
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Job-Ora 서비스 이용, 모의면접 이용권 결제 및 환불, 제휴 문의, 개인정보 관련 문의사항을 접수해 주시면 빠르고 친절하게 답변해 드리겠습니다.
            </p>

            {/* 빠른 문의 카드 */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="bg-blue-50/60 rounded-xl p-5 border border-blue-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#004C99] font-bold text-sm mb-1">
                    <Mail size={18} />
                    <span>공식 문의 이메일</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {COMPANY_INFO.supportEmail}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    24시간 접수 가능 (영업일 기준 순차 회신)
                  </p>
                </div>
                <div className="mt-4">
                  <a
                    href={`mailto:${COMPANY_INFO.supportEmail}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004C99] text-white rounded-lg text-sm font-semibold hover:bg-[#003875] transition-colors"
                  >
                    이메일 문의하기
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-1">
                    <Clock size={18} />
                    <span>고객지원 운영시간</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {COMPANY_INFO.operatingHours}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    토·일요일 및 법정 공휴일은 휴무입니다.
                  </p>
                </div>
                <div className="mt-4 text-xs text-slate-500 leading-relaxed">
                  문의 내용: 서비스 이용, 결제/환불, 오류 신고, 대학·기관 단체 제휴
                </div>
              </div>
            </div>
          </div>

          {/* 사업자 정보 테이블 */}
          <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-6 md:p-10">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-[#004C99]" />
              사업자등록 정보
            </h2>

            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-sm divide-y divide-slate-200">
                <tbody className="divide-y divide-slate-200">
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      서비스명
                    </th>
                    <td className="p-3.5 text-slate-900 font-medium">
                      {COMPANY_INFO.serviceName}
                    </td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      상호 / 운영 주체
                    </th>
                    <td className="p-3.5 text-slate-900 font-medium">
                      {COMPANY_INFO.legalName}
                    </td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      대표자명
                    </th>
                    <td className="p-3.5 text-slate-900">
                      {COMPANY_INFO.representative}
                    </td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      사업자등록번호
                    </th>
                    <td className="p-3.5 text-slate-900 font-mono">
                      {COMPANY_INFO.businessRegistrationNumber}
                    </td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      통신판매업 신고번호
                    </th>
                    <td className="p-3.5 text-slate-900">
                      {COMPANY_INFO.mailOrderSalesRegistration}
                      <span className="text-xs text-slate-400 ml-2">(신고 완료 후 번호 갱신 예정)</span>
                    </td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      업태
                    </th>
                    <td className="p-3.5 text-slate-900">
                      {COMPANY_INFO.businessType}
                    </td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      종목
                    </th>
                    <td className="p-3.5 text-slate-900">
                      {COMPANY_INFO.businessItem}
                    </td>
                  </tr>
                  <tr className="flex flex-col sm:table-row">
                    <th className="bg-slate-50 sm:w-1/3 p-3.5 text-left font-semibold text-slate-700 border-b sm:border-b-0 sm:border-r border-slate-200">
                      고객문의 이메일
                    </th>
                    <td className="p-3.5 text-slate-900">
                      <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-[#004C99] underline">
                        {COMPANY_INFO.supportEmail}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <HelpCircle size={14} className="flex-shrink-0 mt-0.5 text-slate-400" />
              <span>
                통신판매업 신고번호는 관할 구청 신고 절차 완료 후 최종 번호로 갱신 게시됩니다.
              </span>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
