"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

// 1. Lấy danh sách thông báo của user đang đăng nhập
export async function getNotifications() {
  const user = await currentUser();
  const { userId } = await auth();

  if (!userId) return [];

  try {
    const notifications = await db.notification.findMany({
      where: { userId: userId }, // Chỉ lấy thông báo của mình
      orderBy: { createdAt: "desc" }, // Cái mới nhất lên đầu
      take: 20, // Lấy tối đa 20 cái
    });
    return notifications;
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    return [];
  }
}

// 2. Đánh dấu đã đọc (khi user bấm vào)
export async function markAsRead(notificationId: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  revalidatePath("/");

  try {
    const requesterName = user.firstName || userEmail;

    // 👇 LOG KIỂM TRA ID LEADER
    console.log(
      "🚀 [JoinProject] Đang tạo thông báo cho Leader ID:",
      project.ownerId
    );

    await db.notification.create({
      data: {
        userId: project.ownerId, // 👈 Đảm bảo gửi đúng ID này
        content: `${requesterName} muốn tham gia dự án "${project.name}"`,
        link: `/projects/${projectId}`,
        isRead: false,
        type: "JOIN_REQUEST",
        requestId: request.id,
        projectId: project.id,
      },
    });
    console.log("✅ [JoinProject] Đã tạo thông báo thành công!");
  } catch (error) {
    console.error("❌ [JoinProject] Lỗi tạo thông báo:", error);
  }
}

// 3. Đánh dấu tất cả là đã đọc
export async function markAllAsRead() {
  const { userId } = await auth();
  if (!userId) return;

  await db.notification.updateMany({
    where: { userId: userId, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/");
}
