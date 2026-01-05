import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  LayoutTemplate,
  ChevronRight,
  Shield,
  CheckCircle,
  Clock,
} from "lucide-react";

// Components
import ProjectTabs from "./_components/ProjectTabs";
import { finishProject } from "@/actions/project-actions";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await params;
  const projectId = resolvedParams.projectId;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: { include: { objectives: true } },
      majorItems: true,
      objectives: true,
      costs: true,
    },
  });

  if (!project) redirect("/");

  // --- Lấy thông tin Team ---
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress || "";
  const safeSupervisors: string[] = (project as any).supervisors || [];
  const safeMembers: string[] = project.members || [];

  let fullTeam: any[] = [];
  try {
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({ limit: 100 });
    fullTeam = clerkUsers.data
      .filter((u) => {
        const uEmail = u.emailAddresses[0]?.emailAddress;
        return (
          u.id === project.ownerId ||
          safeMembers.includes(uEmail) ||
          safeSupervisors.includes(uEmail)
        );
      })
      .map((u) => {
        const uEmail = u.emailAddresses[0]?.emailAddress;
        let role = "MEMBER";
        if (u.id === project.ownerId) role = "LEADER";
        else if (safeSupervisors.includes(uEmail)) role = "SUPERVISOR";
        return {
          id: u.id,
          name: u.fullName || u.firstName || "Thành viên",
          email: uEmail,
          imageUrl: u.imageUrl,
          role: role,
        };
      });
  } catch (error) {
    // Fallback
  }

  const isLeader = project.ownerId === userId;
  const isSupervisor = safeSupervisors.includes(userEmail);
  const isCompleted = (project as any).status === "COMPLETED";

  // Tính tiến độ
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const progress =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  async function onFinishProject() {
    "use server";
    await finishProject(projectId);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-900">
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Nav & Info */}
            <div className="flex items-start gap-4">
              <Link
                href="/"
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
              >
                <LayoutTemplate size={20} strokeWidth={2} />
              </Link>

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                    {project.name}
                  </h1>
                  {isLeader && (
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-sm tracking-wider">
                      Leader
                    </span>
                  )}
                  {isCompleted && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-sm tracking-wider border border-emerald-200">
                      <CheckCircle size={10} /> Đã xong
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {progress}% Hoàn thành
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 pt-1">
              {isCompleted ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="text-emerald-600" size={20} />
                  <span className="text-sm font-bold text-emerald-700 uppercase">
                    Dự án đã đóng
                  </span>
                </div>
              ) : isLeader && progress === 100 ? (
                <form action={onFinishProject}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-black shadow-lg font-bold text-sm uppercase animate-pulse"
                  >
                    <CheckCircle size={18} /> Hoàn tất dự án
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm font-bold uppercase">
                  <Clock size={16} /> Đang thực hiện
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectTabs
          projectId={project.id}
          project={project}
          tasks={project.tasks}
          majorItems={project.majorItems}
          objectives={project.objectives}
          isLeader={isLeader}
          isSupervisor={isSupervisor}
          fullTeam={fullTeam}
          isCompleted={isCompleted}
        />
      </div>
    </div>
  );
}
