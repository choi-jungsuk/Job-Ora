import re
import os

files = [
    "src/app/page.tsx",
    "src/app/resume/page.tsx",
    "src/app/job/[id]/page.tsx",
]

# The template pattern we want to replace
new_gnb = """      <header className="sticky top-0 bg-white z-20 border-b border-[#E8EBEF] min-w-[max-content] sm:min-w-0">
        <div className="max-w-[1440px] mx-auto px-6 h-[80px] flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0 lg:w-[280px]" onClick={() => router.push("/")}>
            <div className="w-11 h-11 bg-[#004C99] text-white rounded-[10px] flex items-center justify-center font-bold text-[24px] shadow-sm leading-none pt-[2px]">
              J
            </div>
            <div className="text-[26px] lg:text-[28px] font-black tracking-tight flex items-baseline">
              <span className="text-[#004C99]" style={{ fontFamily: "'Arial Black', 'NanumSquare', sans-serif" }}>Job-Ora</span>
            </div>
          </div>

          {/* Menus (Center aligned) */}
          <nav className="flex-1 flex justify-center items-center gap-8 lg:gap-12 text-[15px] font-bold text-[#555] whitespace-nowrap">
            <span className="{resume_class}" onClick={() => router.push("/resume")}>내 이력관리</span>
            <span className="cursor-pointer hover:text-[#004C99] transition-colors" onClick={() => router.push("/interview")}>모의면접 분석</span>
            <span className="cursor-pointer hover:text-[#004C99] transition-colors" onClick={() => alert("기능 준비중")}>회사 소개</span>
          </nav>
          
          {/* Right: Tools */}
          <div className="flex items-center justify-end gap-3 lg:gap-4 flex-shrink-0 lg:w-[280px]">
            {/* Language */}
            <div className="flex items-center gap-1.5 text-[14px] font-semibold text-[#555] border border-[#E5E7EB] rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
              <Globe size={16} className="text-[#888]" />
              <span className="leading-none pt-[1px]">한국어</span>
              <ChevronDown size={14} className="text-[#888] ml-0.5" />
            </div>
            
            {/* Alarm */}
            <div className="w-10 h-10 flex items-center justify-center text-[#555] hover:bg-gray-100 rounded-full cursor-pointer transition-colors relative flex-shrink-0">
              <Bell size={22} />
              <span className="absolute top-[8px] right-[8px] w-[5px] h-[5px] bg-red-500 rounded-full"></span>
            </div>

            {/* Login */}
            <div className="bg-[#004C99] hover:bg-[#003d7a] cursor-pointer text-white text-[14px] px-6 py-[9px] rounded-[100px] font-bold transition-all shadow-sm whitespace-nowrap flex-shrink-0" onClick={() => alert("기능 준비중")}>
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
        
    # We find the start of the `<header className="sticky top-0 bg-white...` and the end `</header>\n`
    pattern = r'<header className="sticky top-0 bg-white z-20 border-b border-\[#E8EBEF\] min-w-\[max-content\] sm:min-w-0">.*?</header>'
    
    # Determine the highlight class based on file
    resume_class = 'cursor-pointer hover:text-[#004C99] transition-colors'
    if 'resume' in file_path:
        resume_class = 'text-[#004C99] transition-colors cursor-pointer'
        
    new_header = new_gnb.replace("{resume_class}", resume_class)
    
    new_content = re.sub(pattern, new_header, content, flags=re.DOTALL)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Updated {file_path}")
