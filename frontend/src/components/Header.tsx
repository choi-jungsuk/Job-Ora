"use client";

import { useRouter, usePathname } from "next/navigation";
import { Globe, Bell, ChevronDown } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLoginClick = () => {
    alert("기능 준비중입니다.");
  };

  const getMenuClass = (path: string) => {
    const isActive = pathname === path;
    return `relative py-2 cursor-pointer font-bold text-[18px] md:text-[20px] transition-all duration-300 ${
      isActive 
        ? "text-[#004C99]" 
        : "text-[#555555] hover:text-[#004C99]"
    }`;
  };

  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md z-30 border-b border-[#E8EBEF]/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-w-[max-content] sm:min-w-0">
      <div className="max-w-[1440px] mx-auto px-6 h-[80px] flex items-center justify-between">
        
        {/* Left: Logo */}
        <div 
          className="flex items-center cursor-pointer flex-shrink-0 gap-3 group" 
          onClick={() => router.push("/")}
        >
          <div 
            className="rounded-[12px] flex items-center justify-center font-bold shadow-md shadow-blue-500/10 leading-none transform transition-transform duration-300 group-hover:scale-105"
            style={{ 
              width: '46px', 
              height: '46px', 
              fontSize: '24px', 
              background: 'linear-gradient(135deg, #0056b3 0%, #003d7a 100%)',
              color: '#ffffff'
            }}
          >
            J
          </div>
          <div 
            className="font-extrabold tracking-tight flex items-baseline text-[26px] md:text-[28px]" 
            style={{ fontFamily: "'NanumSquare', sans-serif" }}
          >
            <span className="text-[#004C99] transition-colors duration-300 group-hover:text-[#00366D]">Job-Ora</span>
          </div>
        </div>

        {/* Menus (Center aligned) */}
        <nav className="flex-grow flex justify-center items-center gap-10 md:gap-14 whitespace-nowrap px-4">
          <div className="relative group">
            <span 
              className={getMenuClass("/resume")} 
              onClick={() => router.push("/resume")}
            >
              내 이력관리
              <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#004C99] rounded-full transition-transform duration-300 origin-left ${pathname === "/resume" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
            </span>
          </div>
          
          <div className="relative group">
            <span 
              className={getMenuClass("/interview")} 
              onClick={() => router.push("/interview")}
            >
              모의면접 분석
              <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#004C99] rounded-full transition-transform duration-300 origin-left ${pathname === "/interview" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
            </span>
          </div>
          
          <div className="relative group">
            <span 
              className={getMenuClass("/about")} 
              onClick={() => alert("기능 준비중입니다.")}
            >
              회사 소개
              <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-[#004C99] rounded-full transition-transform duration-300 origin-left ${pathname === "/about" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
            </span>
          </div>
        </nav>
        
        {/* Right: Tools */}
        <div className="flex items-center justify-end flex-shrink-0 gap-4">
          {/* Language */}
          <div className="hidden sm:flex items-center font-bold text-[#555555] border border-[#E5E7EB] rounded-full cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 px-4 py-2 gap-2 text-[14px]">
            <Globe size={16} className="text-[#888888]" />
            <span className="leading-none pt-[1px]">한국어</span>
            <ChevronDown size={14} className="text-[#888888]" />
          </div>
          
          {/* Alarm */}
          <div className="flex items-center justify-center text-[#555555] hover:bg-gray-100 rounded-full cursor-pointer transition-all duration-300 relative w-[42px] h-[42px]">
            <Bell size={22} />
            <span className="absolute bg-[#FF4B4B] rounded-full border border-white" style={{ top: '10px', right: '10px', width: '8px', height: '8px' }}></span>
          </div>

          {/* Login */}
          <button 
            className="hover:shadow-md hover:shadow-blue-500/10 cursor-pointer rounded-full font-bold transition-all duration-300 transform hover:scale-102 active:scale-98 whitespace-nowrap flex-shrink-0 px-6 py-2.5 text-[15px]" 
            style={{ 
              background: 'linear-gradient(135deg, #0056b3 0%, #003d7a 100%)',
              color: '#ffffff',
              border: 'none'
            }}
            onClick={handleLoginClick}
          >
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
