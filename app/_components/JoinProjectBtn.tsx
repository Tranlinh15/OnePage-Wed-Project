"use client";

import { joinProject } from "@/actions/project-actions";
import { LogIn, X, Hash, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function JoinProjectBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ... (giữ nguyên logic handleSubmit) ...
  const handleSubmit = async (formData: FormData) => {
    const projectId = formData.get("projectId") as string;
    if (!projectId) return;
    setIsLoading(true);
    try {
      const result = await joinProject(projectId);
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 QUAN TRỌNG: Không dùng "if (isOpen) return..." ở đây!
  return (
    <>
      {/* 1. CÁI NÚT (Luôn luôn nằm ở đây, không bao giờ mất) */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition-all duration-200 active:scale-95"
      >
        <LogIn
          size={18}
          strokeWidth={2.5}
          className="group-hover:translate-x-0.5 transition-transform"
        />
        <span className="text-sm whitespace-nowrap">Tham gia bằng ID</span>
      </button>

      {/* 2. CÁI MODAL (Nằm đè lên trên, chỉ hiện khi isOpen = true) */}
      {isOpen && (
        <div onClick={() => !isLoading && setIsOpen(false)}>
          {/* Hộp nội dung modal */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[90vw] md:w-full md:max-w-[420px] bg-white rounded-[20px] md:rounded-[24px] shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative overflow-hidden"
          >
            <button
              onClick={() => !isLoading && setIsOpen(false)}
              disabled={isLoading}
              className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="p-6 md:p-8 text-center">
              <div className="mx-auto w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 md:mb-5 text-blue-600 ring-4 ring-blue-50/50">
                <Hash size={24} className="md:w-7 md:h-7" strokeWidth={2.5} />
              </div>

              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">
                Nhập mã dự án
              </h2>
              <p className="text-slate-500 text-xs md:text-sm mb-5 md:mb-6 leading-relaxed">
                Điền ID dự án để truy cập Workspace.
              </p>

              <form action={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <input
                    name="projectId"
                    required
                    autoFocus
                    disabled={isLoading}
                    placeholder="CLR-83..."
                    className="w-full h-12 md:h-14 bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-center text-lg md:text-xl font-mono font-bold text-slate-800 tracking-widest uppercase placeholder:text-slate-300 placeholder:font-sans placeholder:tracking-normal placeholder:text-sm md:placeholder:text-base placeholder:font-medium disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 md:h-12 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-slate-900 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Đang xử
                      lý...
                    </>
                  ) : (
                    <>
                      Truy cập ngay <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
