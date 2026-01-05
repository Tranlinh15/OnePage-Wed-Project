"use client";

import { useState, useMemo } from "react";
import ProjectCard from "./ProjectCard";
// 👇 QUAN TRỌNG: Phải import nút này vào mới dùng được
import JoinProjectBtn from "./JoinProjectBtn";
import {
  Search,
  FolderOpen,
  Clock,
  CheckCircle2,
  Filter,
  User,
  Users,
} from "lucide-react";

export default function ProjectList({
  initialProjects,
  currentUserId,
  currentUserEmail,
}: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "ONGOING" | "COMPLETED"
  >("ALL");

  // State lọc theo quyền sở hữu
  const [filterRole, setFilterRole] = useState<"ALL" | "OWNER" | "MEMBER">(
    "ALL"
  );

  // 1. Xử lý Lọc & Tìm kiếm
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project: any) => {
      // a. Lọc theo tên
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // b. Lọc theo trạng thái
      const matchesStatus =
        filterStatus === "ALL"
          ? true
          : filterStatus === "COMPLETED"
          ? project.status === "COMPLETED"
          : project.status !== "COMPLETED";

      // c. Lọc theo quyền (Role)
      let matchesRole = true;
      if (filterRole === "OWNER") {
        matchesRole = project.ownerId === currentUserId; // Dự án mình tạo
      } else if (filterRole === "MEMBER") {
        matchesRole = project.ownerId !== currentUserId; // Dự án được chia sẻ
      }

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [initialProjects, searchQuery, filterStatus, filterRole, currentUserId]);

  // 2. Tính toán Thống kê (Stats)
  const stats = useMemo(() => {
    const total = initialProjects.length;
    const completed = initialProjects.filter(
      (p: any) => p.status === "COMPLETED"
    ).length;
    const ongoing = total - completed;
    return { total, completed, ongoing };
  }, [initialProjects]);

  return (
    <div className="space-y-8">
      {/* --- 1. STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tổng dự án</p>
            <h4 className="text-2xl font-bold text-slate-800">{stats.total}</h4>
          </div>
        </div>

        {/* Card Ongoing */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Đang thực hiện</p>
            <h4 className="text-2xl font-bold text-slate-800">
              {stats.ongoing}
            </h4>
          </div>
        </div>

        {/* Card Completed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Đã hoàn thành</p>
            <h4 className="text-2xl font-bold text-slate-800">
              {stats.completed}
            </h4>
          </div>
        </div>
      </div>

      {/* --- 2. TOOLBAR (Tìm kiếm & Bộ lọc & Nút Join) --- */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        {/* Group: Search & Role Filter & Join Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full sm:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Dropdown Lọc Quyền */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {filterRole === "ALL" && <Filter size={16} />}
              {filterRole === "OWNER" && <User size={16} />}
              {filterRole === "MEMBER" && <Users size={16} />}
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="appearance-none w-full sm:w-40 pl-9 pr-8 py-2.5 bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả nguồn</option>
              <option value="OWNER">Của tôi</option>
              <option value="MEMBER">Được chia sẻ</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-8 bg-slate-200 mx-1"></div>
        </div>

        {/* Status Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-lg w-full lg:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "ONGOING", label: "Đang chạy" },
            { id: "COMPLETED", label: "Đã xong" },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- 3. PROJECT GRID --- */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredProjects.map((project: any) => (
            <div key={project.id} className="h-full">
              <ProjectCard project={project} currentUserId={currentUserId} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            Không tìm thấy dự án
          </h3>
          <p className="text-slate-500 mt-1 text-center">
            {filterRole === "OWNER"
              ? "Bạn chưa tạo dự án nào."
              : filterRole === "MEMBER"
              ? "Chưa có dự án nào được chia sẻ với bạn."
              : "Thử thay đổi bộ lọc của bạn."}
          </p>
        </div>
      )}
    </div>
  );
}
