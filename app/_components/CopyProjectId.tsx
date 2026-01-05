"use client";

import { useState } from "react";
import { Copy, Check, Hash } from "lucide-react";
import { toast } from "sonner";

export default function CopyProjectId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("Đã sao chép mã dự án!");

    // Reset icon sau 2 giây
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">
        PROJECT ID (Dùng để mời)
      </span>
      <button
        onClick={handleCopy}
        className="group flex items-center gap-3 px-4 py-2 bg-slate-50 border-2 border-slate-200 hover:border-slate-900 rounded-lg transition-all active:scale-95 text-slate-600 hover:text-slate-900 w-fit"
        title="Bấm để sao chép"
      >
        <div className="flex items-center gap-2 font-mono text-sm font-bold">
          <Hash
            size={16}
            className="text-slate-400 group-hover:text-slate-900 transition-colors"
          />
          {id}
        </div>

        <div className="pl-3 border-l-2 border-slate-200 group-hover:border-slate-300">
          {copied ? (
            <Check size={16} className="text-emerald-600 animate-in zoom-in" />
          ) : (
            <Copy
              size={16}
              className="text-slate-400 group-hover:text-slate-900 transition-colors"
            />
          )}
        </div>
      </button>
    </div>
  );
}
