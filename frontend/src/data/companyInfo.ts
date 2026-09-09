export interface CompanyInfo {
  serviceName: string;
  legalName: string;
  representative: string;
  businessRegistrationNumber: string;
  businessType: string;
  businessItem: string;
  supportEmail: string;
  operatingHours: string;
  mailOrderSalesRegistration: string;
}

export const COMPANY_INFO: CompanyInfo = {
  serviceName: "Job-Ora",
  legalName: "주식회사 그란오소",
  representative: "최정석",
  businessRegistrationNumber: "246-87-02662",
  businessType: "교육서비스업, 정보통신업, 전문·과학 및 기술서비스업 등",
  businessItem: "취업 및 스타트업 교육 및 멘토링, 응용 소프트웨어 개발·공급·운영업, 취업 및 스타트업 지원 컨설팅업 등",
  supportEmail: "contact@granosoai.com",
  operatingHours: "평일 10:00 ~ 17:00 (주말 및 공휴일 휴무)",
  mailOrderSalesRegistration: "확인 중", // 통신판매업 신고 완료 시 번호로 교체
};

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  badge?: string;
  period: string;
  description: string;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "trial",
    name: "체험 모의면접 이용권",
    price: 1000,
    priceFormatted: "1,000원",
    badge: "입문용",
    period: "결제일로부터 30일",
    description: "목표 기업 맞춤형 AI 모의면접을 가볍게 경험해 볼 수 있는 체험 이용권입니다.",
    features: [
      "목표 기업 기반 짧은 AI 모의면접 1회",
      "핵심 답변 역량 기본 피드백",
      "모의면접 결과 요약 리포트",
      "이용 유효기간 30일",
    ],
  },
  {
    id: "standard",
    name: "기본 모의면접 이용권",
    price: 2000,
    priceFormatted: "2,000원",
    badge: "추천",
    period: "결제일로부터 30일",
    description: "심층 꼬리질문과 종합 피드백으로 실전 면접 감각을 극대화하는 정규 이용권입니다.",
    features: [
      "목표 기업 기반 AI 심층 모의면접 1회",
      "답변 맞춤형 정밀 꼬리질문 생성",
      "직무 역량별 답변 요약 및 심층 피드백",
      "모의면접 상세 분석 리포트",
      "이용 유효기간 30일",
    ],
  },
];
