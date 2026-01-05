"use server";

import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// =========================================================
// 1. LẤY DANH SÁCH THÔNG BÁO
// =========================================================
export async function getNotifications() {
  const { userId } = await auth();

  if (!userId) return [];

  try {
    const notifications = await db.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return notifications;
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    return [];
  }
}

// =========================================================
// 2. ĐÁNH DẤU ĐÃ ĐỌC (Một cái)
// =========================================================
export async function markAsRead(notificationId: string) {
  const { userId } = await auth();
  if (!userId) return;

  try {
    await db.notification.update({
      where: { 
        id: notificationId,
        userId: userId // Bảo mật: Chỉ update nếu đúng là thông báo của mình
      },
      data: { isRead: true },
    });

    revalidatePath("/"); // Cập nhật lại giao diện
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc:", error);
  }
}

// =========================================================
// 3. ĐÁNH DẤU TẤT CẢ LÀ ĐÃ ĐỌC
// =========================================================
export async function markAllAsRead() {
  const { userId } = await auth();
  if (!userId) return;

  try {
    await db.notification.updateMany({
      where: { userId: userId, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/");
  } catch (error) {
    console.error("Lỗi đánh dấu tất cả:", error);
  }
}

// =========================================================
// 4. TẠO THÔNG BÁO YÊU CẦU THAM GIA (Hàm riêng biệt)
// Gọi hàm này từ file project-actions.ts sau khi gửi yêu cầu
// =========================================================
export async function createJoinRequestNotification(projectId: string) {
  // 1. Lấy thông tin người gửi (User hiện tại đang đăng nhập)
  const user = await currentUser();
  if (!user) return; // Nếu chưa đăng nhập thì thôi

  const userEmail = user.emailAddresses[0].emailAddress;
  const requesterName = user.firstName || userEmail;

  try {
    // 2. Lấy thông tin dự án để biết Leader là ai (ownerId)
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, ownerId: true } // Chỉ lấy các trường cần thiết
    });

    if (!project) {
      console.error("Không tìm thấy dự án để gửi thông báo");
      return;
    }

    // 3. Gửi thông báo cho Leader
    console.log("🚀 Đang gửi thông báo cho Leader ID:", project.ownerId);

    await db.notification.create({
      data: {
        userId: project.ownerId, // 👈 Đảm bảo gửi đúng ID này
        content: `${requesterName} muốn tham gia dự án "${project.name}"`,
        link: `/projects/${projectId}`,
        isRead: false,
        type: "JOIN_REQUEST",
        //requestId: request.id,
        projectId: project.id,
      },
    });

    console.log("✅ Đã tạo thông báo thành công!");
    
  } catch (error) {
    console.error("❌ Lỗi tạo thông báo:", error);
  }
}
