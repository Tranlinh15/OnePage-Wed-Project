import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

// Components
import ProjectList from "@/app/_components/ProjectList";
import CreateProjectBtn from "@/app/_components/CreateProjectBtn";
import NotificationBtn from "@/app/_components/NotificationBtn";
import JoinProjectBtn from "@/app/_components/JoinProjectBtn";
import SearchInput from "@/app/_components/SearchInput";
import Image from "next/image";
import { Sparkles, Search, LayoutGrid } from "lucide-react";

export default async function Home() {
  // --- GIỮ NGUYÊN LOGIC CŨ ---
  const { userId } = await auth();
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !userEmail) {
    redirect("/sign-in");
  }

  // Lấy dữ liệu dự án
  const projects = await db.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { has: userEmail } },
        { supervisors: { has: userEmail } },
      ],
    },
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });

  // Lấy tên hiển thị
  const displayName = user?.firstName || "Bạn";
  const projectCount = projects.length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* --- BACKGROUND DECORATION (Hiệu ứng nền mờ nhẹ) --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-pink-200/20 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-4">
            {/* Logo có đổ bóng nhẹ */}
            <Image
              src="/img/logo.png"
              alt="OPPM Manager Logo"
              width={60}
              height={60}
              priority
              className="object-contain drop-shadow-sm"
            />

            <div className="flex flex-col">
              {/* Dòng 1: Tên dự án + Version */}
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
                  OPPM{" "}
                  <span className="font-semibold text-slate-600">
                    - Quản lý dự án
                  </span>
                </h1>
                {/* Badge Version nhỏ xinh */}
                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  v1.0.0
                </span>
              </div>

              {/* Dòng 2: Tên tác giả (Credits) */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Dev by
                </span>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Văn Lĩnh - Duy Thắng
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar*/}
            <SearchInput />
            <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>

            {/* Notification */}
            <div className="relative">
              <NotificationBtn />
            </div>

            {/* User Avatar */}
            <div className="pl-1">
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox:
                      "w-9 h-9 border-2 border-white shadow-sm hover:scale-105 transition-transform",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* HERO SECTION (Chào mừng) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-2">
              <Sparkles size={12} className="text-pink-500" />
              Dashboard Overview
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Xin chào,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600">
                {displayName}
              </span>
            </h1>
            <p className="text-slate-500 text-lg max-w-xl">
              Bạn đang tham gia{" "}
              <span className="font-bold text-slate-800">{projectCount}</span>{" "}
              dự án. Hãy quản lý công việc thật hiệu quả hôm nay!
            </p>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-3 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm"></div>
        </div>

        {/* --- PROJECT LIST AREA --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid size={20} className="text-blue-500" />
              Dự án của bạn
            </h2>
            {/* Có thể thêm bộ lọc ở đây nếu muốn sau này */}
          </div>

          {/* List Component */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ProjectList
              initialProjects={projects}
              currentUserId={userId}
              currentUserEmail={userEmail}
            />
          </div>
        </div>
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4">
          {/* Nút Tham gia nhỏ hơn nằm trên */}
          <div className="scale-90 origin-right hover:scale-100 transition-all">
            <JoinProjectBtn />
          </div>
          {/* Nút Tạo to nằm dưới */}
          <CreateProjectBtn />
        </div>
      </main>
    </div>
  );
}
