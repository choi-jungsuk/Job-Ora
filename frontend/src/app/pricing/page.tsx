import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "가격 및 상품 안내 | Job-Ora",
  description: "Job-Ora의 AI 모의면접 이용권 가격 및 상품 안내입니다. 해외취업 준비생을 위한 합리적인 모의면접 이용권을 확인하세요.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />
      <PricingClient />
      <Footer />
    </div>
  );
}
