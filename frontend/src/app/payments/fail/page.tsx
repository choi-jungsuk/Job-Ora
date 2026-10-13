import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FailClient from "./FailClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "결제 실패 | Job-Ora",
  description: "Job-Ora 모의면접 이용권 결제가 완료되지 않았습니다.",
};

function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
      <Loader2 size={40} className="animate-spin text-[#004C99] mb-4" />
      <p className="text-slate-600 font-medium">결제 실패 정보를 불러오는 중입니다...</p>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <FailClient />
      </Suspense>
      <Footer />
    </div>
  );
}
