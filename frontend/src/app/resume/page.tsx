"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Star, Trash2, Edit2, CheckCircle, X } from "lucide-react";
import Header from "@/components/Header";

interface Resume {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
  lastModified: string;
}

export default function ResumeManagement() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResume, setEditingResume] = useState<Partial<Resume> | null>(null);

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem("jobora_resumes");
    if (saved) {
      setResumes(JSON.parse(saved));
    } else {
      // Mock initial data if empty
      const intialMock = [
        {
          id: "1",
          title: "영문 이력서 (Software Engineer)",
          content: "John Doe\n\n- Software Engineer with 5 years experience\n- Fluent in React, Node.js",
          isDefault: true,
          lastModified: new Date().toLocaleDateString()
        }
      ];
      setResumes(intialMock);
      localStorage.setItem("jobora_resumes", JSON.stringify(intialMock));
    }
  }, []);

  const saveResumes = (newResumes: Resume[]) => {
    setResumes(newResumes);
    localStorage.setItem("jobora_resumes", JSON.stringify(newResumes));
  };

  const handleSetDefault = (id: string) => {
    const updated = resumes.map(r => ({
      ...r,
      isDefault: r.id === id
    }));
    saveResumes(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("이력서를 삭제하시겠습니까?")) {
      saveResumes(resumes.filter(r => r.id !== id));
    }
  };

  const handleSaveModal = () => {
    if (!editingResume?.title || !editingResume?.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    let updated = [...resumes];
    if (editingResume.id) {
      // Edit existing
      updated = updated.map(r => r.id === editingResume.id ? {
        ...(editingResume as Resume),
        lastModified: new Date().toLocaleDateString()
      } : r);
    } else {
      // Add new
      const newResume: Resume = {
        id: Date.now().toString(),
        title: editingResume.title,
        content: editingResume.content,
        isDefault: updated.length === 0, // default if it's the first one
        lastModified: new Date().toLocaleDateString()
      };
      updated.push(newResume);
    }

    saveResumes(updated);
    setIsModalOpen(false);
    setEditingResume(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col">
      {/* Premium GNB Header */}
      <Header />

      <main className="max-w-[1000px] w-full mx-auto px-6 py-10 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-[26px] font-black text-[#0F172A] mb-1">내 이력관리</h1>
            <p className="text-[14px] text-slate-500 font-bold">Job-Ora AI 모의면접에서 사용할 이력서를 등록하고 관리하세요.</p>
          </div>
          <button 
            className="hover:shadow-md hover:shadow-blue-500/10 cursor-pointer rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] px-5 py-3 text-[14px] flex items-center gap-2 self-start sm:self-auto"
            style={{ 
              background: 'linear-gradient(135deg, #0056b3 0%, #003d7a 100%)',
              color: '#ffffff',
              border: 'none'
            }}
            onClick={() => {
              setEditingResume({ title: "", content: "" });
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            새 이력서 등록
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumes.map(resume => (
            <div 
              key={resume.id} 
              className={`bg-white rounded-2xl p-6 flex flex-col justify-between h-[260px] border-2 transition-all duration-300 ${
                resume.isDefault 
                  ? 'border-[#004C99] shadow-[0_8px_30px_rgba(0,76,153,0.04)] bg-slate-50/10' 
                  : 'border-slate-200/50 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-[18px] font-extrabold text-[#0F172A] flex-1 pr-2 truncate">{resume.title}</h3>
                  {resume.isDefault && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#004C99] px-2.5 py-1 rounded-full whitespace-nowrap">
                      <CheckCircle size={12} /> 기본 이력서
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-slate-500 line-clamp-4 leading-relaxed whitespace-pre-wrap font-medium">
                  {resume.content}
                </p>
              </div>

              <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between items-center text-[13px]">
                <span className="text-slate-400 font-bold">수정: {resume.lastModified}</span>
                <div className="flex gap-2">
                  {!resume.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(resume.id)}
                      className="p-2 text-slate-500 hover:text-[#004C99] bg-slate-50 hover:bg-blue-50/80 rounded-lg transition-all"
                      title="기본 이력서로 설정"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setEditingResume(resume);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-500 hover:text-[#004C99] bg-slate-50 hover:bg-blue-50/80 rounded-lg transition-all"
                    title="이력서 수정"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-all"
                    title="이력서 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {resumes.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 bg-white rounded-2xl">
              <FileText size={44} className="mx-auto text-slate-300 mb-4" />
              <p className="text-[16px] font-extrabold text-slate-500 mb-1">등록된 이력서가 없습니다.</p>
              <p className="text-[14px] text-slate-400">우측 상단의 &apos;새 이력서 등록&apos; 버튼을 눌러 추가해주세요.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[700px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-[20px] font-black text-[#0F172A]">
                {editingResume?.id ? '이력서 수정' : '새 이력서 등록'}
              </h2>
              <button 
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100 transition-all"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-500">이력서 제목</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-200 bg-slate-50/50 focus:bg-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#004C99] focus:ring-1 focus:ring-[#004C99] transition-all text-[15px] font-semibold text-slate-700" 
                  placeholder="예: 영문 이력서 (마케팅 직무)"
                  value={editingResume?.title || ""}
                  onChange={e => setEditingResume({...editingResume, title: e.target.value})}
                />
              </div>
              
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[14px] font-bold text-slate-500">이력서 내용 (Text/Markdown)</label>
                <textarea 
                  className="w-full flex-1 min-h-[320px] border border-slate-200 bg-slate-50/50 focus:bg-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#004C99] focus:ring-1 focus:ring-[#004C99] transition-all text-[14px] resize-none leading-relaxed text-slate-700" 
                  placeholder="기존 이력서 텍스트를 복사하여 붙여넣으세요."
                  value={editingResume?.content || ""}
                  onChange={e => setEditingResume({...editingResume, content: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
              <button 
                className="px-5 py-3 rounded-xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-colors text-[14px]"
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="px-6 py-3 rounded-xl font-bold text-white text-[14px]"
                style={{ 
                  background: 'linear-gradient(135deg, #0056b3 0%, #003d7a 100%)'
                }}
                onClick={handleSaveModal}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
