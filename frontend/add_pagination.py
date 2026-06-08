import re
import sys

file_path = "src/app/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    orig = f.read()

# 1. Add currentPage state
orig = orig.replace(
    'const [filterIndustry, setFilterIndustry] = useState("");',
    'const [filterIndustry, setFilterIndustry] = useState("");\n  const [currentPage, setCurrentPage] = useState(1);'
)

# 2. Add pagination logic 
orig = orig.replace(
    '  return (\n    <div className="min-h-screen',
    '  const ITEMS_PER_PAGE = 3;\n  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);\n  const currentCompanies = filteredCompanies.slice(\n    (currentPage - 1) * ITEMS_PER_PAGE, \n    currentPage * ITEMS_PER_PAGE\n  );\n\n  return (\n    <div className="min-h-screen'
)

# 3. reset page on country filter
orig = orig.replace(
    'value={filterCountry} onChange={e => setFilterCountry(e.target.value)}',
    'value={filterCountry} onChange={e => {setFilterCountry(e.target.value); setCurrentPage(1);}}'
)

# 4. reset page on industry filter
orig = orig.replace(
    'value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}',
    'value={filterIndustry} onChange={e => {setFilterIndustry(e.target.value); setCurrentPage(1);}}'
)

# 5. reset page on exp filter
orig = orig.replace(
    'value={filterExp} onChange={e => setFilterExp(e.target.value)}',
    'value={filterExp} onChange={e => {setFilterExp(e.target.value); setCurrentPage(1);}}'
)

# 6. reset page on reset button
orig = orig.replace(
    'setFilterExp("");\n               }}',
    'setFilterExp("");\n                 setCurrentPage(1);\n               }}'
)

# 7. Use currentCompanies instead of filteredCompanies in the map
orig = orig.replace(
    '{filteredCompanies.map((company) => (',
    '{currentCompanies.map((company) => ('
)

# 8. Add Pagination UI after grid
pagination_ui = """            {filteredCompanies.length === 0 && (
              <div className="col-span-1 xl:col-span-2 py-16 text-center text-[#666666] border border-dashed border-[#E8EBEF] bg-white rounded-[6px]">
                <p className="text-[15px] font-bold">조건에 맞는 채용공고가 존재하지 않습니다.</p>
                <p className="text-[13px] mt-1 text-[#888888]">필터(국가, 직종, 요건)를 변경해 주십시오.</p>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-2 mb-10 w-full">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-6 py-3 rounded-[8px] font-bold text-[16px] transition-colors ${currentPage === 1 ? 'bg-[#f0f4f8] text-[#a0b0c0] cursor-not-allowed' : 'bg-white border border-[#E8EBEF] text-[#666] hover:text-[#004C99] hover:border-[#004C99]'}`}
              >
                &larr; 이전 페이지
              </button>
              <span className="text-[16px] font-bold text-[#444] px-4">
                {currentPage} <span className="text-[#888] font-normal">/ {totalPages}</span>
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-6 py-3 rounded-[8px] font-bold text-[16px] transition-colors ${currentPage === totalPages ? 'bg-[#f0f4f8] text-[#a0b0c0] cursor-not-allowed' : 'bg-white border border-[#E8EBEF] text-[#666] hover:text-[#004C99] hover:border-[#004C99]'}`}
              >
                다음 페이지 &rarr;
              </button>
            </div>
          )}"""

orig = orig.replace(
    """            {filteredCompanies.length === 0 && (
              <div className="col-span-1 xl:col-span-2 py-16 text-center text-[#666666] border border-dashed border-[#E8EBEF] bg-white rounded-[6px]">
                <p className="text-[15px] font-bold">조건에 맞는 채용공고가 존재하지 않습니다.</p>
                <p className="text-[13px] mt-1 text-[#888888]">필터(국가, 직종, 요건)를 변경해 주십시오.</p>
              </div>
            )}
          </div>""",
    pagination_ui
)

# We want 3 items, making grid columns identical gives them the same width, but 3 items in a 2-column grid means the last item is left-aligned. We can let it be, or change to 1-column. Let's keep 1-col on mobile, 2-col on large displays, which means 2 items on row 1, 1 on row 2. 
# Alternatively, make it grid-cols-1 to be safe and perfectly structured.
orig = orig.replace('className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-10"', 'className="grid grid-cols-1 gap-6 mb-6"')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(orig)

print("done")
