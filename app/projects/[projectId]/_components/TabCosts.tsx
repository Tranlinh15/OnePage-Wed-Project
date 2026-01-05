"use client";

import { useState, useTransition, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Trash2,
  DollarSign,
  PiggyBank,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { createCost, deleteCost } from "@/actions/project-actions";

// Hàm format tiền VNĐ
const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function TabCosts({ costs = [], projectId, isLeader }: any) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE"); // Mặc định là Chi
  const [isPending, startTransition] = useTransition();

  // 1. Tính toán thống kê
  const stats = useMemo(() => {
    const income = costs
      .filter((c: any) => c.type === "INCOME")
      .reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const expense = costs
      .filter((c: any) => c.type === "EXPENSE")
      .reduce((acc: number, curr: any) => acc + curr.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [costs]);

  // 2. Xử lý thêm mới
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      toast.warning("Vui lòng nhập đủ thông tin");
      return;
    }

    startTransition(async () => {
      try {
        await createCost(projectId, description, Number(amount), type);
        toast.success("Đã thêm giao dịch mới");
        setDescription("");
        setAmount("");
      } catch (error) {
        toast.error("Lỗi khi thêm chi phí");
      }
    });
  };

  // 3. Xử lý xóa
  const handleDelete = async (id: string) => {
    if (!isLeader) return;
    startTransition(async () => {
      await deleteCost(id, projectId);
      toast.success("Đã xóa giao dịch");
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* --- 1. THỐNG KÊ TỔNG QUAN (CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tổng Thu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng Thu (Ngân sách)
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {formatVND(stats.income)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Tổng Chi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tổng Chi tiêu
            </p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {formatVND(stats.expense)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
            <TrendingDown size={20} />
          </div>
        </div>

        {/* Số Dư */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 rounded-2xl shadow-lg shadow-indigo-200 text-white flex items-center justify-between relative overflow-hidden">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>

          <div className="relative z-10">
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
              Số dư hiện tại
            </p>
            <h3 className="text-2xl font-black mt-1">
              {formatVND(stats.balance)}
            </h3>
          </div>
          <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <Wallet size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- 2. FORM THÊM MỚI (BÊN TRÁI) --- */}
        {isLeader && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" /> Thêm giao dịch
              </h3>

              <form onSubmit={handleAdd} className="space-y-4">
                {/* Chọn Loại */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setType("INCOME")}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                      type === "INCOME"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <TrendingUp size={16} /> Thu vào
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("EXPENSE")}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
                      type === "EXPENSE"
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <TrendingDown size={16} /> Chi ra
                  </button>
                </div>

                {/* Nhập nội dung */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                    Nội dung
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Mua Server, Thu tiền quỹ..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                  />
                </div>

                {/* Nhập số tiền */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                    Số tiền (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-4 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₫
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className={`w-full py-2.5 rounded-lg text-white font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                    type === "INCOME"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                      : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                  }`}
                >
                  {isPending ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <Plus size={18} /> Xác nhận
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- 3. DANH SÁCH LỊCH SỬ (BÊN PHẢI) --- */}
        <div className={isLeader ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase flex items-center gap-2">
                <DollarSign size={16} className="text-slate-500" /> Lịch sử giao
                dịch
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {costs.length} giao dịch
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {costs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <PiggyBank
                    size={48}
                    className="mb-3 text-slate-200"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm font-medium">Chưa có giao dịch nào</p>
                </div>
              ) : (
                costs.map((cost: any) => (
                  <div
                    key={cost.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon loại */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          cost.type === "INCOME"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {cost.type === "INCOME" ? (
                          <TrendingUp size={18} />
                        ) : (
                          <TrendingDown size={18} />
                        )}
                      </div>

                      {/* Nội dung */}
                      <div>
                        <p className="font-bold text-slate-700 text-sm">
                          {cost.description}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          {cost.type === "INCOME" ? "Nguồn thu" : "Chi phí"}
                          {/* Bạn có thể thêm ngày tháng ở đây nếu DB có lưu createdAt */}
                        </p>
                      </div>
                    </div>

                    {/* Số tiền & Hành động */}
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono font-bold text-sm ${
                          cost.type === "INCOME"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {cost.type === "INCOME" ? "+" : "-"}
                        {formatVND(cost.amount)}
                      </span>

                      {isLeader && (
                        <button
                          onClick={() => handleDelete(cost.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
