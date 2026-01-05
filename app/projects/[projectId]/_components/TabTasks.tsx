"use client";

import {
  createMajorItem,
  deleteMajorItem,
  createTask,
  deleteTask,
  updateTask,
  toggleTaskStatus,
} from "@/actions/project-actions";
import {
  Trash2,
  Calendar,
  User,
  Layers,
  Plus,
  FolderPlus,
  ArrowRight,
  Target,
  X,
  Pencil,
  Filter,
  ArrowUpDown,
  ArrowDownAz,
  ArrowUpAz,
  Save,
  Ban,
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  List,
  LayoutGrid,
  Hourglass,
  Lock,
  MoreHorizontal,
  Briefcase,
} from "lucide-react";
import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

// --- LOGIC GIỮ NGUYÊN ---
function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

function getDeadlineStatus(deadlineStr: string, isDone: boolean) {
  if (isDone)
    return {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "Hoàn thành",
      icon: CheckCircle2,
    };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      color: "bg-rose-50 text-rose-600 border-rose-200 font-semibold",
      label: `Trễ ${Math.abs(diffDays)} ngày`,
      icon: AlertCircle,
    };
  if (diffDays === 0)
    return {
      color: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
      label: "Hôm nay",
      icon: Hourglass,
    };
  if (diffDays <= 3)
    return {
      color: "bg-orange-50 text-orange-700 border-orange-200 font-medium",
      label: `Còn ${diffDays} ngày`,
      icon: Clock,
    };

  return {
    color: "bg-slate-100 text-slate-600 border-slate-200",
    label: null,
    icon: Calendar,
  };
}

export default function TabTasks({
  tasks = [],
  majorItems = [],
  objectives = [],
  projectId,
  isLeader,
  fullTeam = [],
  isCompleted,
}: any) {
  const { user } = useUser();
  const currentUserEmail = user?.primaryEmailAddress?.emailAddress;

  const assignableMembers = fullTeam.filter(
    (m: any) => m.role !== "SUPERVISOR"
  );

  const [isPending, startTransition] = useTransition();

  // State
  const [majorName, setMajorName] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filterMajor, setFilterMajor] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [viewMode, setViewMode] = useState<"list" | "week" | "month">("week");
  const [formData, setFormData] = useState({
    majorItemId: "",
    minorItem: "",
    deadline: "",
    mainResp: "",
    subResp: "",
    objectiveIds: [] as string[],
  });

  // --- CRUD HANDLERS (GIỮ NGUYÊN) ---
  const handleAddMajor = () => {
    if (!majorName.trim()) return;
    startTransition(async () => {
      await createMajorItem(projectId, majorName);
      toast.success("Đã thêm hạng mục");
      setMajorName("");
    });
  };

  const handleDeleteMajor = (id: string) => {
    if (!confirm("Cảnh báo: Xóa mục lớn sẽ xóa tất cả công việc bên trong!"))
      return;
    startTransition(async () => {
      await deleteMajorItem(id, projectId);
      toast.success("Đã xóa hạng mục");
    });
  };

  const handleEditClick = (task: any) => {
    setEditingTaskId(task.id);
    setFormData({
      majorItemId: task.majorItemId,
      minorItem: task.minorItem,
      deadline: new Date(task.deadline).toISOString().split("T")[0],
      mainResp: task.mainResp,
      subResp: task.subResp || "",
      objectiveIds: task.objectives.map((o: any) => o.id),
    });
    // Scroll nhẹ lên form
    const formElement = document.getElementById("task-form-anchor");
    if (formElement)
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setFormData({
      majorItemId: "",
      minorItem: "",
      deadline: "",
      mainResp: "",
      subResp: "",
      objectiveIds: [],
    });
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.majorItemId) return toast.error("Vui lòng chọn Mục lớn!");
    if (!formData.mainResp)
      return toast.error("Vui lòng chọn người phụ trách chính!");

    startTransition(async () => {
      try {
        if (editingTaskId) {
          await updateTask({ taskId: editingTaskId, projectId, ...formData });
          toast.success("Đã cập nhật công việc!");
          setEditingTaskId(null);
        } else {
          await createTask({ ...formData, projectId });
          toast.success("Đã tạo công việc mới!");
        }
        setFormData((prev) => ({
          ...prev,
          minorItem: "",
          mainResp: "",
          subResp: "",
          objectiveIds: [],
        }));
      } catch (error) {
        toast.error("Có lỗi xảy ra.");
      }
    });
  };

  const handleDeleteTask = (id: string) => {
    if (!confirm("Xóa công việc này?")) return;
    startTransition(async () => {
      await deleteTask(id, projectId);
      toast.success("Đã xóa công việc");
    });
  };

  const toggleObjective = (objId: string) => {
    setFormData((prev) => {
      const exists = prev.objectiveIds.includes(objId);
      return exists
        ? {
            ...prev,
            objectiveIds: prev.objectiveIds.filter((id) => id !== objId),
          }
        : { ...prev, objectiveIds: [...prev.objectiveIds, objId] };
    });
  };

  const handleStatusChange = (taskId: string, currentStatus: string) => {
    if (isCompleted) return;
    startTransition(async () => {
      try {
        const result = await toggleTaskStatus(taskId, currentStatus, projectId);
        if (result && result.error) toast.error(result.error);
      } catch (error) {
        toast.error("Lỗi cập nhật trạng thái");
      }
    });
  };

  const getMemberName = (email: string) => {
    const member = fullTeam.find((m: any) => m.email === email);
    return member ? member.name : email;
  };

  // --- PROCESSING LOGIC (GIỮ NGUYÊN) ---
  const processedTasks = useMemo(() => {
    let result = [...tasks];
    if (filterMajor !== "ALL")
      result = result.filter((t) => t.majorItemId === filterMajor);

    result.sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      if (dateA !== dateB)
        return sortOrder === "ASC" ? dateA - dateB : dateB - dateA;
      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();
      return createdA - createdB;
    });
    return result;
  }, [tasks, filterMajor, sortOrder]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, any[]> = {};
    processedTasks.forEach((task) => {
      let key = "";
      if (viewMode === "list") {
        const majorItem = majorItems.find(
          (m: any) => m.id === task.majorItemId
        );
        key = majorItem ? majorItem.name : "Khác";
      } else if (!task.deadline) {
        key = "Chưa có hạn";
      } else {
        const date = new Date(task.deadline);
        if (viewMode === "month") {
          key = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
        } else {
          key = `Tuần ${getWeekNumber(date)} - Năm ${date.getFullYear()}`;
        }
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    return groups;
  }, [processedTasks, viewMode, majorItems]);

  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedTasks);
    if (viewMode === "list") {
      const majorNames = majorItems.map((m: any) => m.name);
      return keys.sort((a, b) => {
        if (a === "Khác") return 1;
        if (b === "Khác") return -1;
        return majorNames.indexOf(a) - majorNames.indexOf(b);
      });
    } else {
      return keys.sort((a, b) => {
        if (a === "Chưa có hạn") return 1;
        if (b === "Chưa có hạn") return -1;
        return a.localeCompare(b);
      });
    }
  }, [groupedTasks, viewMode, majorItems]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 font-sans text-slate-800">
      {/* 1. SECTION: QUẢN LÝ MỤC LỚN (Clean Dashboard Widget Style) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Briefcase size={20} className="text-indigo-600" />
            Quản lý Hạng mục (Major Items)
          </h3>
          <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
            {majorItems.length} hạng mục
          </span>
        </div>

        <div className="p-6">
          {/* Lớp phủ Lock */}
          {isCompleted && (
            <div className="absolute inset-0 bg-slate-50/60 z-10 flex items-center justify-center backdrop-blur-[2px]">
              <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 text-slate-500 font-medium">
                <Lock size={16} /> Dự án đã hoàn tất - Chỉ xem
              </div>
            </div>
          )}

          {isLeader && !isCompleted && (
            <div className="flex gap-3 mb-6">
              <input
                value={majorName}
                onChange={(e) => setMajorName(e.target.value)}
                placeholder="Nhập tên hạng mục chính..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
              <button
                onClick={handleAddMajor}
                disabled={isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                <Plus size={18} /> Thêm mới
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {majorItems.map((m: any) => (
              <div
                key={m.id}
                className="group relative pl-4 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-all cursor-default select-none"
              >
                {m.name}
                {isLeader && !isCompleted && (
                  <button
                    onClick={() => handleDeleteMajor(m.id)}
                    className="ml-2 p-0.5 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-colors inline-flex"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {majorItems.length === 0 && (
              <p className="text-sm text-slate-400 italic">
                Chưa có hạng mục nào được tạo.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. SECTION: FORM TASK (Floating Card Style) */}
      {isLeader && !isCompleted && (
        <section id="task-form-anchor" className="scroll-mt-24">
          <form
            onSubmit={handleSubmitTask}
            className={`
                relative p-6 md:p-8 rounded-2xl border shadow-lg transition-all duration-300
                ${
                  editingTaskId
                    ? "bg-white border-amber-200 shadow-amber-100/50 ring-1 ring-amber-100"
                    : "bg-white border-slate-200 shadow-xl shadow-slate-200/50"
                }
              `}
          >
            {/* Form Header */}
            <div className="flex justify-between items-center mb-6">
              <h3
                className={`text-lg font-bold flex items-center gap-2 ${
                  editingTaskId ? "text-amber-700" : "text-slate-700"
                }`}
              >
                {editingTaskId ? (
                  <>
                    <Pencil size={20} className="text-amber-600" /> Cập nhật
                    công việc
                  </>
                ) : (
                  <>
                    <Layers size={20} className="text-indigo-600" /> Tạo công
                    việc mới
                  </>
                )}
              </h3>
              {editingTaskId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-md transition flex items-center gap-1.5"
                >
                  <Ban size={16} /> Hủy bỏ
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Input: Major Item */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Thuộc hạng mục
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.majorItemId}
                    onChange={(e) =>
                      setFormData({ ...formData, majorItemId: e.target.value })
                    }
                  >
                    <option value="">-- Chọn hạng mục --</option>
                    {majorItems.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <FolderPlus
                    size={16}
                    className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Input: Task Name */}
              <div className="md:col-span-8 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tên công việc
                </label>
                <input
                  required
                  placeholder="Nhập tên công việc cụ thể..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  value={formData.minorItem}
                  onChange={(e) =>
                    setFormData({ ...formData, minorItem: e.target.value })
                  }
                />
              </div>

              {/* Input: Deadline */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Hạn chót (Deadline)
                </label>
                <div className="relative">
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Input: Main Resp */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Người Chính <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.mainResp}
                    onChange={(e) =>
                      setFormData({ ...formData, mainResp: e.target.value })
                    }
                  >
                    <option value="">-- Chọn người --</option>
                    {assignableMembers.map((m: any) => (
                      <option key={m.id} value={m.email}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <User
                    size={16}
                    className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Input: Sub Resp */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Người Phụ
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={formData.subResp}
                    onChange={(e) =>
                      setFormData({ ...formData, subResp: e.target.value })
                    }
                  >
                    <option value="">-- Không --</option>
                    {fullTeam.map((m: any) => (
                      <option key={m.email} value={m.email}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <User
                    size={16}
                    className="absolute right-3 top-3 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* OPPM Objectives */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target size={16} className="text-indigo-500" /> Liên kết mục
                tiêu OPPM
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {objectives.map((obj: any) => {
                  const isSelected = formData.objectiveIds.includes(obj.id);
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => toggleObjective(obj.id)}
                      className={`text-left text-xs px-3 py-2.5 rounded-lg border transition-all flex items-start gap-2.5 group
                          ${
                            isSelected
                              ? editingTaskId
                                ? "bg-amber-50 border-amber-300 text-amber-800"
                                : "bg-indigo-50 border-indigo-300 text-indigo-800"
                              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                          }
                        `}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                          isSelected
                            ? editingTaskId
                              ? "border-amber-500 bg-amber-500"
                              : "border-indigo-500 bg-indigo-500"
                            : "border-slate-300 bg-white group-hover:border-indigo-300"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2 size={10} className="text-white" />
                        )}
                      </div>
                      <span className="leading-snug">{obj.content}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <button
                disabled={isPending || majorItems.length === 0}
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex justify-center items-center gap-2 active:scale-[0.99]
                      ${
                        editingTaskId
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-200 hover:shadow-orange-300"
                          : "bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-200 hover:shadow-indigo-300"
                      }
                    `}
              >
                {isPending ? (
                  "Đang xử lý..."
                ) : editingTaskId ? (
                  <>
                    <Save size={18} /> Lưu thay đổi
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Thêm công việc này
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* 3. SECTION: TOOLBAR (Unified Control Bar) */}
      <div className="sticky top-20 z-20 bg-white/90 backdrop-blur-md border border-slate-200 p-2 rounded-xl shadow-lg shadow-slate-200/50 flex flex-col xl:flex-row gap-4 justify-between items-center transition-all">
        {/* View Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          {[
            { id: "list", label: "Danh sách", icon: List },
            { id: "week", label: "Theo Tuần", icon: LayoutGrid },
            { id: "month", label: "Theo Tháng", icon: Calendar },
          ].map((mode: any) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                viewMode === mode.id
                  ? "bg-white text-indigo-700 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <mode.icon size={16} /> {mode.label}
            </button>
          ))}
        </div>

        {/* Filters & Sorts */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto px-2 xl:px-0">
          <div className="flex items-center gap-3 flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="bg-transparent text-sm w-full outline-none text-slate-700 font-medium py-1"
            >
              <option value="ALL">Tất cả mục lớn</option>
              {majorItems.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <span className="text-xs font-bold text-slate-500 px-2 uppercase tracking-wide">
              Xếp theo:
            </span>
            <button
              onClick={() => setSortOrder("ASC")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                sortOrder === "ASC"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:bg-slate-200"
              }`}
            >
              <ArrowUpAz size={14} /> Gần nhất
            </button>
            <button
              onClick={() => setSortOrder("DESC")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                sortOrder === "DESC"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:bg-slate-200"
              }`}
            >
              <ArrowDownAz size={14} /> Xa nhất
            </button>
          </div>
        </div>
      </div>

      {/* 4. SECTION: TASK LIST (Modern Cards) */}
      <div className="space-y-12">
        {sortedGroupKeys.map((groupKey) => {
          const groupTasks = groupedTasks[groupKey];
          if (!groupTasks || groupTasks.length === 0) return null;

          return (
            <div
              key={groupKey}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-5 group select-none">
                <div
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-violet-100 text-violet-600"
                  }`}
                >
                  {viewMode === "list" ? (
                    <ArrowRight size={20} />
                  ) : (
                    <Calendar size={20} />
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {groupKey}
                </h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                  {groupTasks.length}
                </span>
                <div className="h-[1px] flex-1 bg-slate-100 group-hover:bg-slate-200 transition-colors ml-2"></div>
              </div>

              {/* Tasks Grid */}
              <div className="grid grid-cols-1 gap-4">
                {groupTasks.map((task: any) => {
                  const deadlineStatus = getDeadlineStatus(
                    task.deadline,
                    task.status === "DONE"
                  );
                  const StatusIcon = deadlineStatus.icon;
                  const isDone = task.status === "DONE";
                  const isMyTask = task.mainResp === currentUserEmail;
                  const canChangeStatus =
                    !isCompleted && (isLeader || isMyTask);

                  return (
                    <div
                      key={task.id}
                      className={`
                        group relative bg-white border rounded-xl p-5 md:p-6 transition-all duration-200 
                        ${
                          editingTaskId === task.id
                            ? "ring-2 ring-amber-400 border-amber-300 bg-amber-50/30 z-10 scale-[1.01] shadow-xl"
                            : "border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5"
                        }
                        ${isDone ? "bg-slate-50/50" : ""}
                      `}
                    >
                      {/* Left Border Status Indicator */}
                      <div
                        className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors ${
                          isDone
                            ? "bg-emerald-400"
                            : deadlineStatus.color.includes("red")
                            ? "bg-rose-500"
                            : "bg-indigo-500"
                        }`}
                      ></div>

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pl-4">
                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between md:justify-start md:items-center gap-3 mb-2">
                            <h4
                              className={`text-lg font-bold text-slate-800 leading-snug ${
                                isDone
                                  ? "line-through text-slate-400 decoration-slate-300"
                                  : ""
                              }`}
                            >
                              {task.minorItem}
                            </h4>

                            {/* Badge Deadline */}
                            <span
                              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide ${deadlineStatus.color}`}
                            >
                              <StatusIcon size={12} strokeWidth={2.5} />
                              {deadlineStatus.label ||
                                new Date(task.deadline).toLocaleDateString(
                                  "vi-VN"
                                )}
                            </span>
                          </div>

                          {/* Metadata Row */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                              <User size={14} className="text-slate-400" />
                              <span className="font-medium text-slate-700">
                                {getMemberName(task.mainResp)}
                              </span>
                              {task.subResp && (
                                <span className="text-slate-400 text-xs">
                                  / {getMemberName(task.subResp)}
                                </span>
                              )}
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() =>
                                canChangeStatus &&
                                handleStatusChange(task.id, task.status)
                              }
                              disabled={isPending || !canChangeStatus}
                              className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-bold uppercase tracking-wider transition-all
                                  ${
                                    isDone
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                                      : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                                  }
                                  ${
                                    !canChangeStatus
                                      ? "opacity-50 cursor-not-allowed"
                                      : "active:scale-95"
                                  }
                                `}
                            >
                              {isDone ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <Circle size={14} />
                              )}
                              {isDone ? "Đã xong" : "Chưa xong"}
                            </button>
                          </div>

                          {/* Objectives List */}
                          {task.objectives && task.objectives.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {task.objectives.map((obj: any) => (
                                <span
                                  key={obj.id}
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs border max-w-full truncate ${
                                    isDone
                                      ? "bg-slate-100 text-slate-400 border-slate-200"
                                      : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isDone ? "bg-slate-300" : "bg-indigo-500"
                                    }`}
                                  ></div>
                                  <span className="truncate max-w-[200px]">
                                    {obj.content}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Admin Controls (Hover to reveal) */}
                        {isLeader && !isCompleted && (
                          <div className="flex md:flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-start">
                            <button
                              onClick={() => handleEditClick(task)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Xóa"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {processedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Filter className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">
              Không tìm thấy công việc nào
            </h3>
            <p className="text-slate-500 mt-1 max-w-xs">
              Thử thay đổi bộ lọc hoặc thêm công việc mới vào dự án này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
