"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Bell, Check, X, Loader2 } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/actions/notification-actions";
import { handleJoinRequest } from "@/actions/project-actions"; // Import action xử lý
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotificationBtn() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý Duyệt nhanh
  const handleQuickAction = async (
    e: React.MouseEvent,
    notif: any,
    action: "ACCEPT" | "REJECT"
  ) => {
    e.stopPropagation();
    if (!notif.requestId || !notif.projectId) return;

    startTransition(async () => {
      try {
        await handleJoinRequest(notif.requestId, notif.projectId, action);
        await markAsRead(notif.id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id
              ? {
                  ...n,
                  isRead: true,
                  content:
                    action === "ACCEPT" ? "✅ Đã duyệt." : "❌ Đã từ chối.",
                  type: "INFO",
                }
              : n
          )
        );
        toast.success("Đã xử lý yêu cầu.");
        if (action === "ACCEPT") router.refresh();
      } catch (error) {
        toast.error("Lỗi xử lý.");
      }
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-xs text-slate-700 uppercase">
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true }))
                  );
                }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                Không có thông báo mới
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.type !== "JOIN_REQUEST") {
                        markAsRead(n.id);
                        if (n.link) router.push(n.link);
                        setIsOpen(false);
                      }
                    }}
                    className={`p-3 border-b border-slate-50 transition-colors flex gap-3 ${
                      !n.isRead ? "bg-indigo-50/40" : "bg-white"
                    } ${
                      n.type !== "JOIN_REQUEST"
                        ? "cursor-pointer hover:bg-slate-50"
                        : ""
                    }`}
                  >
                    <div
                      className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        !n.isRead ? "bg-indigo-500" : "bg-slate-200"
                      }`}
                    ></div>

                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          !n.isRead
                            ? "font-semibold text-slate-800"
                            : "text-slate-500"
                        }`}
                      >
                        {n.content}
                      </p>
                      <span className="text-[10px] text-slate-400 block mb-2">
                        {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                      </span>

                      {/* Nút bấm Duyệt/Từ chối */}
                      {n.type === "JOIN_REQUEST" && !n.isRead && (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            disabled={isPending}
                            onClick={(e) => handleQuickAction(e, n, "ACCEPT")}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-md flex items-center justify-center gap-1"
                          >
                            {isPending ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}{" "}
                            Duyệt
                          </button>
                          <button
                            disabled={isPending}
                            onClick={(e) => handleQuickAction(e, n, "REJECT")}
                            className="flex-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-md flex items-center justify-center gap-1"
                          >
                            {isPending ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <X size={12} />
                            )}{" "}
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
