"use client";

import {
  inviteMember,
  removeMember,
  inviteSupervisor,
  removeSupervisor,
} from "@/actions/project-actions"; // Import thêm action mới
import {
  Trash2,
  UserPlus,
  Mail,
  Shield,
  User,
  GraduationCap,
} from "lucide-react"; // Import icon cái mũ cử nhân
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function TabTeam({
  project,
  fullTeam = [],
  currentUserEmail = "",
  isViewerLeader = false,
}: any) {
  const [emailInvite, setEmailInvite] = useState("");
  const [roleInvite, setRoleInvite] = useState("MEMBER"); // "MEMBER" | "SUPERVISOR"
  const [isPending, startTransition] = useTransition();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInvite) return;

    startTransition(async () => {
      try {
        if (roleInvite === "SUPERVISOR") {
          await inviteSupervisor(project.id, emailInvite);
          toast.success(`Đã mời GVHD: ${emailInvite}`);
        } else {
          await inviteMember(project.id, emailInvite);
          toast.success(`Đã mời thành viên: ${emailInvite}`);
        }
        setEmailInvite("");
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  const handleRemove = (email: string, role: string) => {
    if (!confirm(`Xóa người này khỏi dự án?`)) return;
    startTransition(async () => {
      try {
        if (role === "SUPERVISOR") {
          await removeSupervisor(project.id, email);
        } else {
          await removeMember(project.id, email);
        }
        toast.success("Đã xóa thành công");
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. FORM MỜI (CÓ LỰA CHỌN ROLE) */}
      {isViewerLeader && (
        <div className="bg-white p-5 rounded-md border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
            <UserPlus size={18} className="text-indigo-600" />
            Mời vào dự án
          </h3>
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1 relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                required
                placeholder="Nhập email..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                value={emailInvite}
                onChange={(e) => setEmailInvite(e.target.value)}
              />
            </div>

            {/* Select Role */}
            <select
              className="border border-gray-300 rounded-md text-sm px-3 bg-gray-50 outline-none focus:border-indigo-500"
              value={roleInvite}
              onChange={(e) => setRoleInvite(e.target.value)}
            >
              <option value="MEMBER">Thành viên</option>
              <option value="SUPERVISOR">Giám sát / GVHD</option>
            </select>

            <button
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition disabled:opacity-70 flex items-center gap-2"
            >
              {isPending ? "..." : "Mời"}
            </button>
          </form>
        </div>
      )}

      {/* 2. DANH SÁCH NHÂN SỰ */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
            Nhân sự dự án
          </h3>
          <span className="text-xs font-semibold bg-white border border-gray-200 px-2.5 py-0.5 rounded text-gray-600">
            {fullTeam.length} người
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {fullTeam.map((member: any) => {
            const isLeaderOfProject = member.role === "LEADER";
            const isSupervisor = member.role === "SUPERVISOR";
            const isMe = member.email === currentUserEmail;

            return (
              <div
                key={member.id}
                className={`p-4 flex items-center justify-between transition-colors group 
                        ${
                          isSupervisor
                            ? "bg-orange-50/50 hover:bg-orange-50"
                            : "hover:bg-gray-50"
                        }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center text-lg font-bold border shadow-sm
                                ${
                                  isLeaderOfProject
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : isSupervisor
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white text-gray-600 border-gray-200"
                                }`}
                  >
                    {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      {member.name || "Chưa đặt tên"}

                      {/* Badge Leader */}
                      {isLeaderOfProject && (
                        <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded border border-indigo-100 font-bold uppercase tracking-wider">
                          <Shield size={10} fill="currentColor" /> Leader
                        </span>
                      )}

                      {/* Badge Supervisor */}
                      {isSupervisor && (
                        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0.5 rounded border border-orange-200 font-bold uppercase tracking-wider">
                          <GraduationCap size={12} /> Người hướng dẫn
                        </span>
                      )}

                      {/* Badge Tôi */}
                      {isMe && (
                        <span className="text-gray-400 font-normal text-xs italic ml-1">
                          (Tôi)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                      <Mail size={12} /> {member.email}
                    </div>
                  </div>
                </div>

                {/* Nút Xóa */}
                {isViewerLeader && !isLeaderOfProject && (
                  <button
                    onClick={() => handleRemove(member.email, member.role)}
                    disabled={isPending}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                    title="Xóa người này"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
