"use client";

import { createObjective, deleteObjective } from "@/actions/project-actions";
import { Trash2, PlusCircle, Target } from "lucide-react"; // Icon đẹp
import { useState, useTransition } from "react";

export default function TabObjectives({
  objectives,
  projectId,
  isLeader,
}: any) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!content.trim()) return;
    startTransition(async () => {
      await createObjective(projectId, content);
      setContent("");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa mục tiêu này?")) return;
    startTransition(async () => {
      await deleteObjective(id, projectId);
    });
  };

  return (
    <div className="space-y-6">
      {/* Form thêm mới (Chỉ hiện cho Leader) */}
      {isLeader && (
        <div className="flex gap-2 items-center bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập mục tiêu dự án mới..."
            className="flex-1 border-none bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm text-sm font-medium"
          >
            <PlusCircle size={16} /> Thêm
          </button>
        </div>
      )}

      {/* Danh sách Mục tiêu */}
      <div className="grid gap-3">
        {objectives.length === 0 && (
          <p className="text-center text-gray-400 py-4">
            Chưa có mục tiêu nào.
          </p>
        )}

        {objectives.map((obj: any, index: number) => (
          <div
            key={obj.id}
            className="group flex items-center justify-between bg-white p-4 rounded-lg border hover:shadow-md transition-all border-l-4 border-l-blue-500"
          >
            <div className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                {index + 1}
              </span>
              <p className="text-gray-800 font-medium">{obj.content}</p>
            </div>
            {isLeader && (
              <button
                onClick={() => handleDelete(obj.id)}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-2"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
