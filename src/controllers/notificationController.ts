import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      res.status(400).json({ message: "Invalid user ID" });
      return;
    }
    const notifications = await prisma.notification.findMany({
      where: { ToUserId: userId },
      include: {
        FromUser: {
          select: {
            Id: true,
            FullName: true,
            Email: true,
          },
        },
      },
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markReadNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { unReadNotificationIds, userId } = req.body;
    if (!unReadNotificationIds?.length) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }
    const readNoti = await prisma.notification.updateMany({
      where: { Id: { in: unReadNotificationIds } },
      data: { IsRead: true },
    });
    const allNotifications = await prisma.notification.findMany({
      where: {
        ToUserId: userId,
      },
      select: { Id: true, IsRead: true },
    });
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
