"use client";

import { toggleTaskStatus } from "@/actions/project-actions";
import {
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  AlertCircle,
  PlayCircle,
} from "lucide-react";
import { useTransition, Fragment } from "react"; // <--- 1. Thêm import Fragment

export default function TabOPPM({ project }: any) {
  const [isPending, startTransition] = useTransition();

  const { tasks = [], objectives = [], majorItems = [], costs = [] } = project;

  // --- 1. TÍNH TOÁN THỐNG KÊ ---
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: any) => t.status === "DONE").length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const totalBudget = costs.reduce(
    (acc: number, cur: any) =>
      cur.type === "INCOME" ? acc + cur.amount : acc - cur.amount,
    0
  );

  // --- 2. XỬ LÝ CLICK ---
  const handleStatusClick = (taskId: string, currentStatus: string) => {
    startTransition(async () => {
      await toggleTaskStatus(taskId, currentStatus, project.id);
    });
  };

  // --- 3. HELPER RENDER NÚT TRẠNG THÁI ---
  const renderStatusButton = (
    status: string,
    taskId: string,
    deadline: string
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const isOverdue = deadlineDate < today && status !== "DONE";

    let color = "text-gray-300";
    let Icon = Circle;
    let label = "Chưa làm";

    if (status === "IN_PROGRESS") {
      color = "text-blue-600";
      Icon = PlayCircle;
      label = "Đang làm";
    } else if (status === "DONE") {
      color = "text-green-600";
      Icon = CheckCircle2;
      label = "Hoàn thành";
    }

    if (isOverdue) {
      color = "text-red-600 animate-pulse";
      Icon = AlertCircle;
      label = "TRỄ HẠN!";
    }

    return (
      <button
        disabled={isPending}
        onClick={() => handleStatusClick(taskId, status)}
        className={`flex items-center justify-center gap-2 ${color} hover:opacity-80 transition active:scale-95 w-full`}
        title={
          isOverdue
            ? `Đã quá hạn ngày ${deadlineDate.toLocaleDateString("vi-VN")}`
            : "Bấm để cập nhật tiến độ"
        }
      >
        <Icon size={24} strokeWidth={2.5} />
        <span
          className={`text-xs font-bold uppercase hidden md:block ${
            isOverdue ? "text-red-600" : ""
          }`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#e5e7eb"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#2563eb"
                strokeWidth="6"
                fill="none"
                strokeDasharray={175}
                strokeDashoffset={175 - (175 * progressPercent) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-bold text-blue-700">
              {progressPercent}%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Tiến độ tổng thể
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {doneTasks}/{totalTasks} công việc
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-full shrink-0 ${
              totalBudget >= 0
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Ngân sách khả dụng
            </p>
            <h3
              className={`text-xl font-bold ${
                totalBudget >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {totalBudget.toLocaleString("vi-VN")} VNĐ
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-full bg-orange-100 text-orange-600 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ngày kết thúc</p>
            <h3 className="text-lg font-bold text-gray-800">
              {new Date(project.endDate).toLocaleDateString("vi-VN")}
            </h3>
          </div>
        </div>
      </div>

      {/* BẢNG OPPM */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left w-[30%]">Công việc / Hạng mục</th>
                <th className="p-4 text-center w-[15%]">Người làm</th>
                {objectives.map((obj: any, index: number) => (
                  <th
                    key={obj.id}
                    className="p-2 text-center w-10 border-l border-gray-700 relative group cursor-help"
                  >
                    <span className="font-bold">MT {index + 1}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-gray-900 text-white p-2 rounded z-20 normal-case font-normal shadow-lg text-xs leading-relaxed">
                      {obj.content}
                    </div>
                  </th>
                ))}
                <th className="p-4 text-center w-[20%] border-l border-gray-700">
                  Trạng thái
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {majorItems.map((major: any) => {
                const majorTasks = tasks.filter(
                  (t: any) => t.majorItemId === major.id
                );
                if (majorTasks.length === 0) return null;

                return (
                  // --- 2. SỬA ĐỔI Ở ĐÂY: Dùng Fragment thay cho <> ---
                  <Fragment key={major.id}>
                    {/* Dòng Tiêu đề Mục lớn */}
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3 + objectives.length}
                        className="p-3 font-bold text-indigo-800 border-b border-gray-200"
                      >
                        📂 {major.name}
                      </td>
                    </tr>

                    {/* Các dòng công việc */}
                    {majorTasks.map((task: any) => (
                      <tr
                        key={task.id}
                        className="hover:bg-blue-50/30 transition group"
                      >
                        <td className="p-3 pl-8 font-medium text-gray-700 border-r border-gray-100">
                          <div className="flex flex-col">
                            <span>{task.minorItem}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                              Deadline:{" "}
                              {new Date(task.deadline).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-gray-600 border-r border-gray-100 font-medium">
                          {task.mainResp}
                        </td>

                        {objectives.map((obj: any) => {
                          const isLinked = task.objectives.some(
                            (o: any) => o.id === obj.id
                          );
                          return (
                            <td
                              key={obj.id}
                              className="p-2 text-center border-r border-gray-100"
                            >
                              {isLinked ? (
                                <div className="w-4 h-4 bg-indigo-600 rounded-full mx-auto shadow-sm ring-2 ring-indigo-100"></div>
                              ) : (
                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full mx-auto opacity-50"></div>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-3 flex justify-center items-center">
                          {renderStatusButton(
                            task.status,
                            task.id,
                            task.deadline
                          )}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <AlertCircle className="mx-auto mb-3 opacity-30" size={48} />
            <p>Chưa có dữ liệu công việc để tạo báo cáo OPPM.</p>
          </div>
        )}
      </div>

      {/* HƯỚNG DẪN */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-3 items-start shadow-sm">
        <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-600 mt-0.5">
          <AlertCircle size={18} />
        </div>
        <div>
          <strong>Cách đọc & sử dụng Báo cáo OPPM:</strong>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-blue-700/80">
            <li>
              Cột <strong>"MT 1, MT 2..."</strong>: Các Mục tiêu dự án.
            </li>
            <li>
              <strong>Chấm tròn xanh đậm</strong>: Thể hiện Công việc đóng góp
              vào Mục tiêu.
            </li>
            <li>
              <strong>Cập nhật tiến độ</strong>: Bấm vào icon trạng thái để
              chuyển đổi.
            </li>
            <li>
              Biểu tượng{" "}
              <span className="font-bold text-red-500">TRỄ HẠN!</span> nhấp nháy
              báo hiệu việc cần xử lý gấp.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
