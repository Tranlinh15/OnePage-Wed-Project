"use client";

import { updateProjectInfo } from "@/actions/project-actions";
import { toast } from "sonner";
import {
  Calendar,
  Activity,
  Edit3,
  Save,
  X,
  Crown,
  FileText,
  Type,
} from "lucide-react";
import { useState, useTransition } from "react";

export default function TabInfo({
  project,
  isLeader, // Biến này (true/false) quyết định có hiện nút Sửa hay không
  fullTeam = [],
}: any) {
  // 1. Tìm thông tin Leader để hiển thị (Chỉ hiển thị, không sửa)
  const leader = fullTeam.find((m: any) => m.id === project.ownerId);

  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  // State form
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    startDate: new Date(project.startDate).toISOString().split("T")[0],
    endDate: new Date(project.endDate).toISOString().split("T")[0],
  });

  const handleSave = () => {
    // Validate cơ bản trước khi gửi
    if (!formData.name.trim()) {
      toast.error("Tên dự án không được để trống");
      return;
    }

    startTransition(async () => {
      try {
        // Gọi hàm server action
        await updateProjectInfo(project.id, formData);

        toast.success("Cập nhật thông tin thành công");
        setIsEditing(false);
      } catch (error: any) {
        // In lỗi ra console để debug nếu cần
        console.error("Lỗi cập nhật:", error);
        toast.error(error.message || "Lỗi khi cập nhật");
      }
    });
  };

  const handleCancel = () => {
    setFormData({
      name: project.name,
      description: project.description || "",
      startDate: new Date(project.startDate).toISOString().split("T")[0],
      endDate: new Date(project.endDate).toISOString().split("T")[0],
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER: Tiêu đề + Nút Sửa */}
      <div className="flex justify-between items-start border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Thông tin dự án</h2>
          <p className="text-sm text-gray-500">
            Xem và chỉnh sửa các thông tin cơ bản.
          </p>
        </div>

        {/* Chỉ Leader mới thấy nút Sửa */}
        {isLeader && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition font-medium text-sm"
          >
            <Edit3 size={16} /> Chỉnh sửa
          </button>
        )}

        {/* Nút Lưu / Hủy khi đang Sửa */}
        {isLeader && isEditing && (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm"
            >
              <X size={16} /> Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-1 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-md text-sm shadow-sm"
            >
              {isPending ? (
                "Đang lưu..."
              ) : (
                <>
                  <Save size={16} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* BODY: Các trường thông tin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột Trái: Tên & Mô tả */}
        <div className="space-y-6">
          {/* Tên Dự án */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Type size={16} className="text-indigo-500" /> Tên dự án
            </label>
            {isEditing ? (
              <input
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-900 font-bold text-lg">
                {project.name}
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={16} className="text-indigo-500" /> Mô tả
            </label>
            {isEditing ? (
              <textarea
                rows={5}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 min-h-[120px] whitespace-pre-wrap">
                {project.description || "Chưa có mô tả."}
              </div>
            )}
          </div>
        </div>

        {/* Cột Phải: Leader & Thời gian */}
        <div className="space-y-6">
          {/* LEADER INFO (Chỉ hiển thị, không sửa được ở đây) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Crown size={16} className="text-yellow-500" /> Chủ dự án (Leader)
            </label>
            <div className="flex items-center gap-3 p-3 bg-yellow-50/50 border border-yellow-100 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-lg shadow-sm">
                {leader?.name ? leader.name.charAt(0).toUpperCase() : "L"}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  {leader?.name || "Đang cập nhật..."}
                </p>
                <p className="text-xs text-gray-500">
                  {leader?.email || "..."}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 italic">
              * Để thay đổi thành viên hoặc Leader, vui lòng sang Tab "Nhân sự".
            </p>
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Activity size={16} className="text-green-500" /> Bắt đầu
              </label>
              {isEditing ? (
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              ) : (
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium">
                  {new Date(project.startDate).toLocaleDateString("vi-VN")}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="text-red-500" /> Kết thúc
              </label>
              {isEditing ? (
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              ) : (
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-800 font-medium">
                  {new Date(project.endDate).toLocaleDateString("vi-VN")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
