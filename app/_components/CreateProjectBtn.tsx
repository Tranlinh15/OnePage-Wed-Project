"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Sparkles,
  Layers,
  Type,
  AlignLeft,
  Calendar,
  Loader2,
} from "lucide-react";
import { createProjectCustom } from "@/actions/project-actions"; // Đảm bảo đường dẫn đúng
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateProjectBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (formData: FormData) => {
    // ... logic giữ nguyên ...
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }
    setIsLoading(true);
    try {
      const result = await createProjectCustom(formData);
      if (result.success) {
        toast.success("Thành công!");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-3 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 hover:shadow-2xl hover:shadow-slate-300 hover:-translate-y-1 transition-all duration-300 active:scale-95"
      >
        <div className="bg-white/10 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
          <Plus size={20} strokeWidth={3} />
        </div>
        <span className="text-base tracking-wide whitespace-nowrap">
          Tạo dự án mới
        </span>
      </button>

      {isOpen && (
        <div
          onClick={() => !isLoading && setIsOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        >
          {/* 👇 RESPONSIVE CONTAINER: w-[95vw] cho mobile, max-w-xl cho PC */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[95vw] md:w-full md:max-w-xl max-h-[85vh] flex flex-col bg-white rounded-[24px] md:rounded-[28px] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 relative overflow-hidden"
          >
            {/* Header: Padding nhỏ hơn trên mobile */}
            <div className="px-5 py-4 md:px-8 md:py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                  <Layers
                    size={20}
                    className="md:w-6 md:h-6"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">
                    Khởi tạo dự án
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Thiết lập không gian mới
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isLoading && setIsOpen(false)}
                disabled={isLoading}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body: p-5 trên mobile, p-8 trên PC */}
            <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar">
              <form action={handleCreate} className="space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Tên dự án
                  </label>
                  <div className="relative group">
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none">
                      <Type size={18} className="md:w-5 md:h-5" />
                    </div>
                    <input
                      name="name"
                      required
                      autoFocus
                      disabled={isLoading}
                      placeholder="Ví dụ: Chiến dịch Marketing..."
                      className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold text-base md:text-lg text-slate-800 placeholder:text-slate-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    Mô tả ngắn
                  </label>
                  <div className="relative group">
                    <div className="absolute top-3.5 left-4 text-slate-400 pointer-events-none">
                      <AlignLeft size={18} className="md:w-5 md:h-5" />
                    </div>
                    <textarea
                      name="description"
                      rows={3}
                      disabled={isLoading}
                      placeholder="Mục tiêu của dự án này..."
                      className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none text-sm md:text-base text-slate-700 placeholder:text-slate-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* 👇 GRID RESPONSIVE: 1 cột trên mobile, 2 cột trên PC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Bắt đầu
                    </label>
                    <div className="relative group">
                      <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        name="startDate"
                        required
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-700 cursor-pointer disabled:opacity-60 text-sm md:text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      Kết thúc
                    </label>
                    <div className="relative group">
                      <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <input
                        type="date"
                        name="endDate"
                        required
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-700 cursor-pointer disabled:opacity-60 text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setIsOpen(false)}
                    className="px-5 md:px-6 py-3 md:py-3.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50 text-sm md:text-base"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 md:py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm md:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Xử lý...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="text-yellow-300" /> Tạo
                        ngay
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
