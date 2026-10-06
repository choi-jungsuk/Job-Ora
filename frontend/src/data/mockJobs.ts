export interface CompanyData {
  id: string;
  name: string;
  country: string;
  flag: string;
  industry: string;
  jobRole: string;
  salary: string;
  experience: string;
  visaSupport: boolean;
  description: string;
  idealCandidate: string;
  culture: string;
}

// 모의면접 타입 호환 및 테스트용 내부 샘플 데이터 (공개 채용공고가 아님)
export const MOCK_COMPANIES: CompanyData[] = [
  {
    id: "sample-it-dev",
    name: "예시 기업 A",
    country: "글로벌 테크",
    flag: "🌐",
    industry: "IT 및 기술 전문직",
    jobRole: "소프트웨어 엔지니어 (Frontend/Backend)",
    salary: "공고 명시 조건",
    experience: "신입/경력",
    visaSupport: false,
    description: "사용자가 입력한 채용공고 예시: 웹 애플리케이션 프론트엔드 UI/UX 설계 및 백엔드 API 연동을 담당합니다.",
    idealCandidate: "능동적인 문제 해결 능력과 다문화 환경에서의 유연한 협업 태도를 갖춘 인재.",
    culture: "사용자 입력 자료 기반 모의면접 연습",
  },
  {
    id: "sample-service",
    name: "예시 기업 B",
    country: "글로벌 서비스",
    flag: "🌐",
    industry: "고객 서비스 및 호스피탈리티",
    jobRole: "게스트 서비스 어소시에이트",
    salary: "공고 명시 조건",
    experience: "신입/경력",
    visaSupport: false,
    description: "사용자가 입력한 채용공고 예시: 호텔 및 서비스 공간에서의 글로벌 고객 응대, 안내 및 예약 지원 업무를 담당합니다.",
    idealCandidate: "고객 중심 사고와 진정성 있는 서비스 마인드, 원활한 의사소통 능력을 갖춘 인재.",
    culture: "사용자 입력 자료 기반 모의면접 연습",
  },
  {
    id: "sample-engineering",
    name: "예시 기업 C",
    country: "글로벌 제조/설계",
    flag: "🌐",
    industry: "엔지니어링 및 기술직",
    jobRole: "시스템 제어 엔지니어",
    salary: "공고 명시 조건",
    experience: "신입/경력",
    visaSupport: false,
    description: "사용자가 입력한 채용공고 예시: 자동화 설비 제어 및 임베디드 시스템 설계, 품질 검증 프로세스를 수행합니다.",
    idealCandidate: "철저한 품질 준수 태도와 분석적인 문제 해결 능력, 성실성을 갖춘 인재.",
    culture: "사용자 입력 자료 기반 모의면접 연습",
  },
];
