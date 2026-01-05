"use client";

import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  BarChart2,
  ArrowRight,
  Hash,
  Copy,
  Trash2, // 👇 Import icon thùng rác
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { deleteProject } from "@/actions/project-actions"; // 👇 Import action xóa
import { useTransition } from "react"; // 👇 Import hook xử lý loading

export default function ProjectCard({ project, currentUserId }: any) {
  const [isPending, startTransition] = useTransition();

  // 1. Logic màu sắc & Trạng thái
  const isOwner = project.ownerId === currentUserId;
  const isCompleted = project.status === "COMPLETED";

  const totalTasks = project.tasks?.length || 0;
  const completedTasks =
    project.tasks?.filter((t: any) => t.status === "DONE").length || 0;
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const getProgressColor = () => {
    if (isCompleted) return "bg-emerald-500";
    if (progress < 30) return "bg-rose-500";
    if (progress < 70) return "bg-amber-500";
    return "bg-blue-500";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // 2. Hàm Copy ID
  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(project.id);
    toast.success("Đã sao chép ID!");
  };

  // 3. Hàm Xóa Dự Án (MỚI)
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Chặn chuyển trang
    e.stopPropagation(); // Chặn sự kiện lan truyền

    // Hỏi xác nhận cho chắc
    const confirmMsg = `CẢNH BÁO: Bạn có chắc chắn muốn xóa dự án "${project.name}"?\n\nHành động này sẽ xóa toàn bộ công việc và dữ liệu liên quan!`;
    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Đã xóa dự án thành công");
      } catch (error) {
        toast.error("Có lỗi xảy ra khi xóa");
      }
    });
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block h-full group relative"
    >
      <div
        className={`h-full bg-white rounded-2xl border border-slate-200 group-hover:border-indigo-300 group-hover:shadow-xl group-hover:shadow-indigo-100 transition-all duration-300 flex flex-col overflow-hidden ${
          isPending ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {/* --- HEADER --- */}
        <div className="px-5 pt-5 pb-3 flex justify-between items-start">
          <div className="flex gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-blue-50 text-blue-600 border-blue-100"
              }`}
            >
              {isCompleted ? "Đã xong" : "Đang chạy"}
            </span>

            {isOwner && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white border border-slate-900">
                Leader
              </span>
            )}
          </div>

          {/* 👇 NÚT XÓA (Chỉ hiện khi là Leader) */}
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent transition-all z-10"
              title="Xóa dự án này"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin text-rose-500" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          )}
        </div>

        {/* --- BODY --- */}
        <div className="px-5 flex-1">
          <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
            {project.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 h-10 leading-relaxed">
            {project.description || "Chưa có mô tả cho dự án này."}
          </p>
        </div>

        {/* --- METRICS --- */}
        <div className="px-5 py-4 space-y-2">
          <div className="flex justify-between items-end text-xs mb-1">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <BarChart2 size={14} /> Tiến độ
            </span>
            <span className="font-bold text-slate-800">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={13} className="text-slate-400" />
              <span>{formatDate(project.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 size={13} className="text-slate-400" />
              <span>
                {completedTasks}/{totalTasks} việc
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 w-fit px-1.5 py-0.5 -ml-1.5 rounded transition-colors z-10"
            >
              <Hash size={12} className="opacity-70" />
              <span className="font-mono">{project.id.slice(0, 8)}...</span>
              <Copy
                size={10}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">
                L
              </div>
              {project.members?.length > 0 && (
                <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
                  +{project.members.length}
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
