"use client";

import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState, useRef } from "react";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Dùng useRef để lưu trữ timer
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (term: string) => {
    // Xóa timer cũ nếu người dùng vẫn đang gõ
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Đặt timer mới (chờ 300ms mới chạy)
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("search", term);
      } else {
        params.delete("search");
      }
      replace(`${pathname}?${params.toString()}`);
    }, 300);
  };

  return (
    <div className="relative z-50 hidden md:flex items-center px-4 py-2 bg-slate-100/50 border border-slate-200 rounded-full text-slate-600 text-sm gap-2 w-64 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 group cursor-text">
      <Search
        size={16}
        className="text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0"
      />
      <input
        type="text"
        placeholder="Tìm tên dự án..."
        className="bg-transparent outline-none w-full placeholder:text-slate-400 text-slate-700 h-full py-1"
        // Gọi hàm handleSearch thủ công
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("search")?.toString()}
      />
    </div>
  );
}
