import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANY_INFO } from "@/data/companyInfo";
import { ShieldCheck, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Job-Ora",
  description: "Job-Ora(주식회사 그란오소)의 개인정보 수집 항목, 이용 목적, 보관 기간 및 이용자의 권리에 대한 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />

      <main className="max-w-[960px] w-full mx-auto px-4 md:px-8 py-12 flex-1">
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-6 md:p-12">
          {/* 타이틀 헤더 */}
          <div className="border-b border-slate-200 pb-6 mb-8">
            <div className="flex items-center gap-2 text-[#004C99] font-bold text-sm mb-2">
              <ShieldCheck size={18} />
              <span>안전한 정보 보호</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Job-Ora 개인정보처리방침
            </h1>
            <p className="text-slate-500 text-[14px] mt-2">
              최종 수정일: 2026년 9월 9일 | 시행일: 2026년 9월 9일
            </p>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">
            <strong>{COMPANY_INFO.legalName}</strong>(이하 &ldquo;회사&rdquo;)는 Job-Ora 서비스 제공을 위해 필요한 최소한의 개인정보를 수집·이용하며, 관련 법령(개인정보 보호법 등)에 따라 이용자의 개인정보를 안전하게 관리합니다.
          </p>

          <div className="space-y-10 text-[15px] leading-relaxed text-slate-700">
            {/* 1. 수집하는 개인정보 항목 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-1 border-b border-slate-100">
                1. 수집하는 개인정보 항목
              </h2>
              <p className="mb-4">서비스 이용 과정에서 다음 항목들이 수집될 수 있습니다.</p>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <h3 className="font-bold text-slate-900 mb-1.5">회원 및 이용자 정보</h3>
                  <p className="text-slate-600 text-sm">
                    이메일 주소, 이름 또는 닉네임, 로그인 식별자(SNS 계정 연동 시 식별값), 서비스 이용 기록
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <h3 className="font-bold text-slate-900 mb-1.5">면접 준비 및 연습 정보</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    학교명 또는 소속 구분, 전공 계열, 졸업/취업준비 상태, 희망 국가 및 직무, 목표 기업 또는 채용공고 정보, 이력서 또는 자기소개 입력 내용, 모의면접 질의응답 및 음성/텍스트 답변 기록
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <h3 className="font-bold text-slate-900 mb-1.5">결제 및 거래 정보</h3>
                  <p className="text-slate-600 text-sm">
                    주문번호, 결제금액, 결제일시, 결제수단 종류, 결제 승인번호 또는 PG사 거래 식별키
                  </p>
                  <div className="mt-2.5 flex items-start gap-2 text-blue-900 bg-blue-50/70 p-3 rounded-lg border border-blue-100 text-xs">
                    <AlertCircle size={15} className="text-[#004C99] flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>결제 보안 고지:</strong> 신용카드 번호, CVC 등 민감한 원문 금융 결제 정보는 Job-Ora가 일절 수집·저장하지 않으며, 공인된 전자결제대행사(PG사)를 통해 안전하게 암호화 처리됩니다.
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                  <h3 className="font-bold text-slate-900 mb-1.5">자동 수집 정보</h3>
                  <p className="text-slate-600 text-sm">
                    접속 일시, 이용 페이지, 서비스 이용 이벤트 로그, 오류 기록, 기기 및 브라우저 정보, IP 주소
                  </p>
                </div>
              </div>
            </article>

            {/* 2. 개인정보 수집 및 이용 목적 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-1 border-b border-slate-100">
                2. 개인정보 수집 및 이용 목적
              </h2>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                <li>회원 식별, 본인 확인 및 부정 이용 방지</li>
                <li>기업별 인재상 맞춤형 AI 모의면접 질문 생성 및 피드백 리포트 제공</li>
                <li>이용권 결제 확인, 영수증 발급 및 유료 서비스 지급 처리</li>
                <li>고객 문의, 환불 요청 응대 및 서비스 오류 해결</li>
                <li>신규 기능 개발, 성능 측정 및 시스템 품질 최적화</li>
                <li>비식별 통계 분석 및 기관 제안용 집계 자료 작성</li>
                <li>만족도 조사 및 후기 관리</li>
              </ol>
            </article>

            {/* 3. 비식별 통계 활용 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
                3. 비식별 통계 활용
              </h2>
              <p className="mb-2">
                Job-Ora는 서비스 고도화와 청년 취업 지원 정책/기관 제안 자료 작성을 위해 다음과 같은 <strong>개인 식별이 불가능한 통계 데이터</strong>를 집계 및 활용할 수 있습니다.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>누적 가입자 및 실제 서비스 이용자 수 통계</li>
                <li>목표 국가, 산업군, 선호 직무별 모의면접 동향 통계</li>
                <li>대학, 전공 계열, 취업 준비 분야별 활용도 통계</li>
                <li>모의면접 세션 완료율 및 만족도 지표</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                ※ 상기 통계는 어떠한 경우에도 개인을 특정할 수 없는 비식별 집합 통계 형태로만 안전하게 다루어집니다.
              </p>
            </article>

            {/* 4. 사용자 후기 활용 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
                4. 사용자 후기 활용
              </h2>
              <p>
                이용자가 작성한 주관식 후기는 <strong>별도의 동의를 획득한 경우에 한하여 익명화</strong>(이름, 이메일 등 개인정보 제거)하여 서비스 소개 및 홍보, 제안서 등에 활용될 수 있습니다. 사전 동의를 받지 않은 후기는 외부로 공개되지 않습니다.
              </p>
            </article>

            {/* 5. 개인정보 보관 기간 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
                5. 개인정보 보관 및 파기
              </h2>
              <p className="mb-3">
                회사는 원칙적으로 개인정보의 수집 및 이용 목적이 달성되면 지체 없이 해당 정보를 파기합니다. 단, 관계 법령에 의해 보존할 필요가 있는 경우 아래 기준을 따릅니다.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-sm space-y-2">
                <p>• <strong>회원정보:</strong> 회원 탈퇴 시 또는 영구 삭제 요청 시까지</p>
                <p>• <strong>계약 또는 청약철회 등에 관한 기록:</strong> 5년 (전자상거래법)</p>
                <p>• <strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년 (전자상거래법)</p>
                <p>• <strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년 (전자상거래법)</p>
                <p>• <strong>웹사이트 방문 기록(접속로그):</strong> 3개월 (통신비밀보호법)</p>
              </div>
            </article>

            {/* 6. 개인정보 처리 위탁 및 외부 서비스 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
                6. 개인정보 처리 위탁 및 외부 서비스
              </h2>
              <p className="mb-3">
                원활한 서비스 제공을 위해 아래와 같이 전문 외부 업체에 개인정보 처리를 위탁하고 있습니다.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5 text-left border-b border-slate-200">위탁 업무</th>
                      <th className="p-2.5 text-left border-b border-slate-200">수탁 업체</th>
                      <th className="p-2.5 text-left border-b border-slate-200">위탁 항목 및 목적</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-medium">결제 대행 및 정산</td>
                      <td className="p-2.5">토스페이먼츠 주식회사</td>
                      <td className="p-2.5 text-slate-600">주문정보, 결제처리 및 정산, 거래내역 확인</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">클라우드 호스팅 / DB</td>
                      <td className="p-2.5">Railway / MongoDB Atlas</td>
                      <td className="p-2.5 text-slate-600">서비스 인프라 호스팅 및 데이터 안전 보관</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">AI 연산 처리</td>
                      <td className="p-2.5">OpenAI / Azure OpenAI / Anthropic 등</td>
                      <td className="p-2.5 text-slate-600">면접 질문 생성 및 답변 피드백 분석 (개인식별정보 배제)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* 7. 이용자의 권리 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
                7. 이용자의 권리와 행사 방법
              </h2>
              <p>
                이용자는 언제든지 본인의 개인정보에 대하여 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 고객문의 이메일(<a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-[#004C99] underline">{COMPANY_INFO.supportEmail}</a>)로 접수해 주시면 본인 확인 절차를 거친 후 지체 없이 조치하겠습니다.
              </p>
            </article>

            {/* 8. 개인정보 보호 책임자 */}
            <article>
              <h2 className="text-lg font-bold text-slate-900 mb-3 pb-1 border-b border-slate-100">
                8. 개인정보 보호 책임자 및 문의처
              </h2>
              <p className="mb-3">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호 책임자를 지정하고 있습니다.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-sm space-y-1">
                <p><strong>회사명:</strong> {COMPANY_INFO.legalName}</p>
                <p><strong>대표자 / 책임자:</strong> {COMPANY_INFO.representative}</p>
                <p><strong>이메일:</strong> <a href={`mailto:${COMPANY_INFO.supportEmail}`} className="text-[#004C99] underline">{COMPANY_INFO.supportEmail}</a></p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
