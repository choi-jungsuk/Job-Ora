import re
import os

files = [
    "src/app/page.tsx",
    "src/app/resume/page.tsx",
    "src/app/job/[id]/page.tsx",
]

new_gnb = """      <header className="sticky top-0 bg-white z-20 border-b border-[#E8EBEF] min-w-[max-content] sm:min-w-0">
        <div className="max-w-[1440px] mx-auto px-6 h-[90px] flex items-center justify-between overflow-x-auto no-scrollbar">
          
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer flex-shrink-0 lg:w-[320px]" style={{ gap: '16px' }} onClick={() => router.push("/")}>
            <div className="bg-[#004C99] text-white rounded-[12px] flex items-center justify-center font-bold shadow-sm leading-none pt-[3px]" style={{ width: '56px', height: '56px', fontSize: '30px' }}>
              J
            </div>
            <div className="font-black tracking-tight flex items-baseline" style={{ fontSize: '36px', fontFamily: "'Arial Black', 'NanumSquare', sans-serif" }}>
              <span className="text-[#004C99]">Job-Ora</span>
            </div>
          </div>

          {/* Menus (Center aligned) */}
          <nav className="flex-1 flex justify-center items-center font-bold text-[#555] whitespace-nowrap" style={{ gap: '60px', fontSize: '24px' }}>
            <span className="{resume_class}" onClick={() => router.push("/resume")}>내 이력관리</span>
            <span className="cursor-pointer hover:text-[#004C99] transition-colors" onClick={() => router.push("/interview")}>모의면접 분석</span>
            <span className="cursor-pointer hover:text-[#004C99] transition-colors" onClick={() => alert("기능 준비중")}>회사 소개</span>
          </nav>
          
          {/* Right: Tools */}
          <div className="flex items-center justify-end flex-shrink-0 lg:w-[320px]" style={{ gap: '20px' }}>
            {/* Language */}
            <div className="flex items-center font-semibold text-[#555] border border-[#E5E7EB] rounded-full cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap" style={{ padding: '8px 16px', gap: '8px', fontSize: '16px' }}>
              <Globe size={20} className="text-[#888]" />
              <span className="leading-none pt-[2px]">한국어</span>
              <ChevronDown size={18} className="text-[#888]" />
            </div>
            
            {/* Alarm */}
            <div className="flex items-center justify-center text-[#555] hover:bg-gray-100 rounded-full cursor-pointer transition-colors relative flex-shrink-0" style={{ width: '48px', height: '48px' }}>
              <Bell size={26} />
              <span className="absolute bg-red-500 rounded-full" style={{ top: '10px', right: '10px', width: '6px', height: '6px' }}></span>
            </div>

            {/* Login */}
            <div className="bg-[#004C99] hover:bg-[#003d7a] cursor-pointer text-white rounded-[100px] font-bold transition-all shadow-sm whitespace-nowrap flex-shrink-0" style={{ padding: '10px 32px', fontSize: '16px' }} onClick={() => alert("기능 준비중")}>
              로그인
            </div>
          </div>
        </div>
      </header>"""

for file_path in files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    pattern = r'<header className="sticky top-0 bg-white z-20 border-b border-\[#E8EBEF\] min-w-\[max-content\] sm:min-w-0">.*?</header>'
    
    resume_class = 'cursor-pointer hover:text-[#004C99] transition-colors'
    if 'resume' in file_path:
        resume_class = 'text-[#004C99] transition-colors cursor-pointer'
        
    new_header = new_gnb.replace("{resume_class}", resume_class)
    
    new_content = re.sub(pattern, new_header, content, flags=re.DOTALL)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Updated {file_path}")
