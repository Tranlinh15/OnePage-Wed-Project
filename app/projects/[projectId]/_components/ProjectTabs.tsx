"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  DollarSign,
  FileSpreadsheet,
  Users,
} from "lucide-react";

// Import các Tab con
import TabInfo from "./TabInfo";
import TabObjectives from "./TabObjectives";
import TabTasks from "./TabTasks";
import TabCosts from "./TabCosts";
import TabOPPM from "./TabOPPM";
import TabTeam from "./TabTeam";

export default function ProjectTabs({
  projectId,
  isLeader,
  isSupervisor,
  project,
  fullTeam = [],
}: any) {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  // Mặc định chọn tab 1 (Thông tin)
  const [activeTab, setActiveTab] = useState(1);

  // Quyền chỉnh sửa: Leader VÀ không phải Supervisor
  const canEdit = isLeader && !isSupervisor;

  const safeMajorItems = project?.majorItems || [];
  const safeTasks = project?.tasks || [];
  const safeObjectives = project?.objectives || [];
  const safeCosts = project?.costs || [];

  // --- CẤU HÌNH THỨ TỰ TAB MỚI ---
  const tabs = [
    { id: 1, label: "Thông tin", icon: LayoutDashboard },
    { id: 2, label: "Nhân sự", icon: Users }, // <-- Đưa lên vị trí 2
    { id: 3, label: "Mục tiêu", icon: Target }, // <-- Đẩy xuống vị trí 3
    { id: 4, label: "Công việc", icon: CheckSquare },
    { id: 5, label: "Chi phí", icon: DollarSign },
    { id: 6, label: "OPPM View", icon: FileSpreadsheet },
  ];

  return (
    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- HEADER CÁC TAB --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-md border border-blue-100 transform scale-105"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent hover:text-gray-700"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- NỘI DUNG CÁC TAB --- */}
      <div className="mt-4 p-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
        {/* 1. Tab Thông tin */}
        {activeTab === 1 && (
          <TabInfo project={project} isLeader={canEdit} fullTeam={fullTeam} />
        )}

        {/* 2. Tab Nhân sự (Đã chuyển lên đây) */}
        {activeTab === 2 && (
          <TabTeam
            project={project}
            fullTeam={fullTeam}
            currentUserEmail={userEmail}
            isViewerLeader={canEdit}
          />
        )}

        {/* 3. Tab Mục tiêu */}
        {activeTab === 3 && (
          <TabObjectives
            objectives={safeObjectives}
            projectId={projectId}
            isLeader={canEdit}
          />
        )}

        {/* 4. Tab Công việc */}
        {activeTab === 4 && (
          <TabTasks
            tasks={safeTasks}
            majorItems={safeMajorItems}
            objectives={safeObjectives}
            projectId={projectId}
            isLeader={canEdit}
            fullTeam={fullTeam}
          />
        )}

        {/* 5. Tab Chi phí */}
        {activeTab === 5 && (
          <TabCosts
            costs={safeCosts}
            projectId={projectId}
            isLeader={canEdit}
          />
        )}

        {/* 6. Tab OPPM View */}
        {activeTab === 6 && <TabOPPM project={project} />}
      </div>
    </div>
  );
}
