// lib/auth-check.ts
// --- SỬA DÒNG IMPORT DƯỚI ĐÂY ---
import { auth, currentUser } from "@clerk/nextjs/server";
// --------------------------------
import { db } from "@/lib/db";

export async function getProjectPermissions(projectId: string) {
  // Trong bản mới, auth() trả về Promise nên cần await
  const { userId } = await auth();
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  // Nếu chưa đăng nhập
  if (!userId || !userEmail) {
    return { isLeader: false, isMember: false, project: null };
  }

  // Tìm dự án trong DB
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, members: true, name: true },
  });

  if (!project) return { isLeader: false, isMember: false, project: null };

  const isLeader = project.ownerId === userId;

  // Kiểm tra: Là thành viên nếu email nằm trong danh sách HOẶC là Leader
  const isMember = project.members.includes(userEmail) || isLeader;

  return { isLeader, isMember, project };
}
