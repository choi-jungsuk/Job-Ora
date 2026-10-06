"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function JobRedirectPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_35px_rgba(15,23,42,0.05)] p-8 md:p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#004C99] flex items-center justify-center mb-6">
            <FileText size={32} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[12px] font-bold mb-4">
            <AlertCircle size={14} /> 서비스 안내
          </span>

          <h1 className="text-[22px] md:text-[24px] font-black text-slate-900 tracking-tight mb-4 break-keep">
            Job-Ora는 채용공고를 제공하지 않습니다
          </h1>

          <p className="text-[14.5px] md:text-[15px] text-slate-600 leading-relaxed break-keep mb-8">
            지원하려는 공고나 기업 정보를 직접 입력해 AI 모의면접을 생성해 주세요.
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#004C99] hover:bg-[#00366D] active:scale-98 text-white px-6 py-4 rounded-xl font-black text-[15px] shadow-lg shadow-blue-900/10 transition-all"
          >
            <span>공고 입력 화면으로 이동</span>
            <ArrowRight size={18} />
          </button>

          <p className="text-[12px] text-slate-400 mt-4">
            {countdown}초 후 공고 입력 화면으로 자동 이동합니다.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
