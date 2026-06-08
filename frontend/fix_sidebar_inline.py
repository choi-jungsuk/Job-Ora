import re

file_path = "src/app/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the specific sidebar block
new_sidebar = """        {/* Left Sidebar Filters */}
        <aside className="w-[400px] md:w-[560px] flex-shrink-0">
          <div className="card sticky top-[120px] flex flex-col" style={{ gap: '40px' }}>
            <h3 className="font-extrabold text-[24px] text-[#222] border-b border-[#E8EBEF] flex items-center" style={{ gap: '12px', paddingBottom: '20px' }}>
              <Search size={22} className="text-[#004C99]"/> 상세 필터
            </h3>
            
            <div className="flex flex-col" style={{ gap: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label className="block text-[18px] font-bold text-[#666]" style={{ marginBottom: '12px' }}>희망 국가</label>
                <select 
                  className="w-full bg-[#fdfdfd] focus:bg-white border border-[#E8EBEF] rounded-[8px] text-[16px] font-medium outline-none focus:border-[#004C99]"
                  style={{ padding: '16px' }}
                  value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                >
                  <option value="">국가 전체선택</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="block text-[18px] font-bold text-[#666]" style={{ marginBottom: '12px' }}>유망 직종</label>
                <select 
                  className="w-full bg-[#fdfdfd] focus:bg-white border border-[#E8EBEF] rounded-[8px] text-[16px] font-medium outline-none focus:border-[#004C99]"
                  style={{ padding: '16px' }}
                  value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}
                >
                  <option value="">직종 전체선택</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label className="block text-[18px] font-bold text-[#666]" style={{ marginBottom: '12px' }}>요구 경력</label>
                <select 
                  className="w-full bg-[#fdfdfd] focus:bg-white border border-[#E8EBEF] rounded-[8px] text-[16px] font-medium outline-none focus:border-[#004C99]"
                  style={{ padding: '16px' }}
                  value={filterExp} onChange={e => setFilterExp(e.target.value)}
                >
                  <option value="">경력사항 전체</option>
                  <option value="신입">신입 (Junior)</option>
                  <option value="경력">경력 (Senior)</option>
                </select>
              </div>
            </div>

            <button 
               className="bg-[#f0f4f8] text-[#004C99] hover:bg-[#e1ebf5] border border-[#d6e4f0] font-bold text-[18px] rounded-[8px] transition-colors flex items-center justify-center w-full"
               style={{ padding: '16px', marginTop: '16px' }}
               onClick={() => {
                 setFilterCountry("");
                 setFilterIndustry("");
                 setFilterExp("");
               }}
            >
              조건 초기화
            </button>
          </div>
        </aside>"""

pattern = r'\{/\* Left Sidebar Filters \*/}.*?</aside>'

new_content = re.sub(pattern, new_sidebar, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
