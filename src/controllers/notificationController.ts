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
    const { notificationIds } = req.body;
    if (!notificationIds?.length) {
      res.status(400).json({ message: "Invalid request" });
      return;
    }

    await prisma.notification.updateMany({
      where: { Id: { in: notificationIds } },
      data: { IsRead: true },
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
