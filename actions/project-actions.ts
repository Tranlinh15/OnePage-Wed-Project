"use server";

import { db } from "@/lib/db";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// =========================================================
// 1. QUẢN LÝ DỰ ÁN (PROJECT)
// =========================================================

export async function createProjectCustom(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!name) throw new Error("Tên dự án là bắt buộc");

  await db.project.create({
    data: {
      name,
      description,
      startDate: startDateStr ? new Date(startDateStr) : new Date(),
      endDate: endDateStr
        ? new Date(endDateStr)
        : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      ownerId: userId,
      members: [],
      status: "ONGOING",
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateProjectInfo(projectId: string, data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== userId) {
    throw new Error("Bạn không có quyền chỉnh sửa dự án này");
  }

  await db.project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== userId)
    throw new Error("Bạn không có quyền xóa dự án này.");

  await db.project.delete({ where: { id: projectId } });
  revalidatePath("/");
}

export async function finishProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { tasks: true },
  });

  if (!project) throw new Error("Dự án không tồn tại");
  if (project.ownerId !== userId)
    throw new Error("Chỉ Leader mới được hoàn tất dự án");

  // Kiểm tra 100% Task
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(
    (t) => t.status === "DONE"
  ).length;

  if (totalTasks > 0 && completedTasks < totalTasks) {
    throw new Error("Dự án chưa hoàn thành 100% các công việc.");
  }

  await db.project.update({
    where: { id: projectId },
    data: { status: "COMPLETED" },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

// =========================================================
// 2. QUẢN LÝ THÀNH PHẦN CON (Objective, MajorItem, Cost)
// =========================================================

export async function createObjective(projectId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.objective.create({ data: { content, projectId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteObjective(id: string, projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.objective.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}

export async function createMajorItem(projectId: string, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.majorItem.create({ data: { name, projectId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteMajorItem(id: string, projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.majorItem.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}

export async function createCost(
  projectId: string,
  description: string,
  amount: number,
  type: "INCOME" | "EXPENSE"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.cost.create({ data: { description, amount, type, projectId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteCost(id: string, projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  await db.cost.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}

// =========================================================
// 3. QUẢN LÝ CÔNG VIỆC (TASKS)
// =========================================================

export async function createTask(data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Tạo Task
  const task = await db.task.create({
    data: {
      majorItemId: data.majorItemId,
      minorItem: data.minorItem,
      deadline: new Date(data.deadline),
      mainResp: data.mainResp,
      subResp: data.subResp,
      projectId: data.projectId,
      objectives: {
        connect: data.objectiveIds.map((id: string) => ({ id })),
      },
    },
    include: { project: true },
  });

  // 2. Gửi thông báo cho người được giao việc (nếu có)
  if (data.mainResp) {
    try {
      const client = await clerkClient();
      const users = await client.users.getUserList({
        emailAddress: [data.mainResp],
      });

      if (users.data.length > 0) {
        const receiverId = users.data[0].id;
        await db.notification.create({
          data: {
            userId: receiverId,
            content: `Bạn được giao công việc: "${data.minorItem}" trong dự án "${task.project.name}"`,
            link: `/projects/${data.projectId}`,
            isRead: false,
          },
        });
      }
    } catch (error) {
      console.error("⚠️ Lỗi tạo thông báo Task:", error);
    }
  }
  revalidatePath(`/projects/${data.projectId}`);
}

export async function updateTask(data: any) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!data.taskId) throw new Error("Thiếu Task ID");

  const existingTask = await db.task.findUnique({
    where: { id: data.taskId },
    include: { project: true },
  });

  if (!existingTask) throw new Error("Công việc không tồn tại");

  const objectiveConnect = (data.objectiveIds || []).map((id: string) => ({
    id,
  }));

  await db.task.update({
    where: { id: data.taskId },
    data: {
      minorItem: data.minorItem || data.content,
      deadline: new Date(data.deadline),
      majorItemId: data.majorItemId,
      mainResp: data.mainResp || data.assignee || null,
      subResp: data.subResp || null,
      objectives: {
        set: [],
        connect: objectiveConnect,
      },
    },
  });

  revalidatePath(`/projects/${existingTask.projectId}`);
  return { success: true };
}

export async function deleteTask(id: string, projectId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  try {
    await db.task.delete({ where: { id } });
  } catch (error) {
    console.log("Task có thể đã bị xóa trước đó:", error);
  }
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function toggleTaskStatus(
  taskId: string,
  currentStatus: string,
  projectId: string
) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized");
  const userEmail = user.emailAddresses[0]?.emailAddress;

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task) return { error: "Công việc không tồn tại" };

  const isLeader = task.project.ownerId === userId;
  const isAssignee = task.mainResp === userEmail;

  if (!isLeader && !isAssignee) {
    return {
      error: "Bạn chỉ có thể cập nhật trạng thái công việc của chính mình!",
    };
  }

  const newStatus = currentStatus === "DONE" ? "PENDING" : "DONE";
  await db.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  // Tự động cập nhật trạng thái Dự án
  const allTasks = await db.task.findMany({
    where: { projectId: task.projectId },
    select: { status: true },
  });

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "DONE").length;
  let newProjectStatus = "ONGOING";
  if (totalTasks > 0 && totalTasks === completedTasks) {
    newProjectStatus = "COMPLETED";
  }

  await db.project.update({
    where: { id: task.projectId },
    data: { status: newProjectStatus },
  });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/");
  return { success: true };
}

// =========================================================
// 4. QUẢN LÝ THÀNH VIÊN & JOIN REQUEST (CÓ NOTIFICATION)
// =========================================================

// A. Gửi Yêu cầu tham gia (Kèm Actionable Notification)

export async function joinProject(projectIdInput: string) {
  const { userId } = await auth();
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !userEmail) throw new Error("Vui lòng đăng nhập.");

  const projectId = projectIdInput.trim().replace(/\n/g, "").replace(/\r/g, "");

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Không tìm thấy dự án.");
  if (project.ownerId === userId) throw new Error("Bạn là chủ dự án này rồi.");
  if (project.members.includes(userEmail))
    throw new Error("Bạn đã là thành viên rồi.");

  const existingRequest = await db.joinRequest.findUnique({
    where: { projectId_userEmail: { projectId, userEmail } },
  });

  if (existingRequest)
    throw new Error("Bạn đã gửi yêu cầu rồi, vui lòng chờ duyệt.");

  // 1. Tạo bản ghi JoinRequest
  const request = await db.joinRequest.create({
    data: { projectId, userEmail },
  });

  // 2. TẠO THÔNG BÁO CHO LEADER (Kiểm tra kỹ đoạn này)
  try {
    const requesterName = user.firstName || userEmail;

    await db.notification.create({
      data: {
        userId: project.ownerId, // Gửi cho Leader
        content: `${requesterName} muốn tham gia dự án "${project.name}"`,
        link: `/projects/${projectId}`,
        isRead: false,

        // 👇 QUAN TRỌNG: Phải có 3 dòng này thì nút Duyệt mới hiện
        type: "JOIN_REQUEST",
        requestId: request.id,
        projectId: project.id,
      },
    });
  } catch (error) {
    console.error("Lỗi tạo thông báo Leader:", error);
  }

  return {
    success: true,
    message: "Đã gửi yêu cầu! Vui lòng chờ Leader phê duyệt.",
  };
}

// B. Xử lý yêu cầu tham gia (Duyệt/Từ chối)
export async function handleJoinRequest(
  requestId: string,
  projectId: string,
  action: "ACCEPT" | "REJECT"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== userId)
    throw new Error("Bạn không có quyền.");

  const request = await db.joinRequest.findUnique({ where: { id: requestId } });
  if (!request) return; // Request có thể đã bị xóa hoặc xử lý rồi

  if (action === "ACCEPT") {
    // 1. Thêm member
    const newMembers = [...project.members, request.userEmail];
    await db.project.update({
      where: { id: projectId },
      data: { members: newMembers },
    });

    // 2. Báo tin vui cho Member
    try {
      const client = await clerkClient();
      const users = await client.users.getUserList({
        emailAddress: [request.userEmail],
      });

      if (users.data.length > 0) {
        const memberId = users.data[0].id;
        await db.notification.create({
          data: {
            userId: memberId,
            content: `Yêu cầu tham gia dự án "${project.name}" của bạn đã được CHẤP NHẬN! 🎉`,
            link: `/projects/${projectId}`,
            isRead: false,
            type: "INFO",
          },
        });
      }
    } catch (error) {
      console.error("Lỗi gửi thông báo Member:", error);
    }
  }

  // Xóa request dù Accept hay Reject
  await db.joinRequest.delete({ where: { id: requestId } });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

// C. Mời Supervisor (Đã sửa lỗi biến data)
export async function inviteSupervisor(projectId: string, email: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({ where: { id: projectId } });

  if (!project || project.ownerId !== userId) {
    throw new Error("Chỉ Leader mới được mời Người hướng dẫn");
  }

  const safeSupervisors = project.supervisors || [];
  const safeMembers = project.members || [];

  if (safeSupervisors.includes(email))
    throw new Error("Email này đã là Người hướng dẫn");
  if (safeMembers.includes(email))
    throw new Error("Email này đang là Thành viên.");

  // 1. Cập nhật DB
  await db.project.update({
    where: { id: projectId },
    data: { supervisors: { push: email } },
  });

  // 2. Gửi thông báo (Tìm ID từ Email)
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({ emailAddress: [email] });

    if (users.data.length > 0) {
      const receiverId = users.data[0].id;
      await db.notification.create({
        data: {
          userId: receiverId,
          content: `Bạn đã được mời làm Người hướng dẫn (Supervisor) cho dự án: "${project.name}"`,
          link: `/projects/${projectId}`,
          isRead: false,
          type: "INFO",
        },
      });
    }
  } catch (error) {
    console.error("Lỗi mời Supervisor:", error);
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function removeSupervisor(projectId: string, email: string) {
  const { userId } = await auth();
  const project = await db.project.findUnique({ where: { id: projectId } });

  if (!project || project.ownerId !== userId) {
    throw new Error("Chỉ Leader mới được xóa Người hướng dẫn");
  }

  const newSupervisors = project.supervisors.filter((e) => e !== email);

  await db.project.update({
    where: { id: projectId },
    data: { supervisors: newSupervisors },
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export async function removeMember(projectId: string, emailToRemove: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== userId)
    throw new Error("Không có quyền.");

  const newMembers = project.members.filter((email) => email !== emailToRemove);
  await db.project.update({
    where: { id: projectId },
    data: { members: newMembers },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function inviteMember(projectId: string, email: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const project = await db.project.findUnique({ where: { id: projectId } });

  if (!project || project.ownerId !== userId) {
    throw new Error("Chỉ Leader mới được mời thành viên.");
  }

  // Kiểm tra xem đã tồn tại chưa
  if (project.members.includes(email)) {
    throw new Error("Email này đã là thành viên của dự án.");
  }
  if (
    project.ownerId === userId &&
    (await currentUser())?.emailAddresses[0].emailAddress === email
  ) {
    throw new Error("Bạn là chủ dự án rồi.");
  }

  // 1. Cập nhật DB
  await db.project.update({
    where: { id: projectId },
    data: { members: { push: email } },
  });

  // 2. Gửi thông báo cho người được mời (Tương tự các hàm khác)
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({ emailAddress: [email] });

    if (users.data.length > 0) {
      const receiverId = users.data[0].id;
      await db.notification.create({
        data: {
          userId: receiverId,
          content: `Bạn đã được mời tham gia dự án: "${project.name}"`,
          link: `/projects/${projectId}`,
          isRead: false,
          type: "INFO",
        },
      });
    }
  } catch (error) {
    console.error("Lỗi gửi thông báo mời thành viên:", error);
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
