import { Request, Response } from "express";

export const getNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  //   const filter = { toUserId: req.query.userId };
  //   const all = await Notification.find(filter).populate({
  //     path: "fromUserId",
  //     select: "-password", // Exclude the password field
  //   });
  //   res.json(all);
  // };
  // export const markReadNotification = async (
  //   req: Request,
  //   res: Response,
  // ): Promise<void> => {
  //   const notificationIds = req.body.notificationIds;
  //   if (!notificationIds?.length) {
  //     res.status(400).json({
  //       message: "invalid request",
  //     });
  //     return;
  //   }
  //   const filter = { _id: { $in: notificationIds } };
  //   const update = { isRead: true };
  //   await Notification.updateMany(filter, update);
  //   res.sendStatus(200);
  //   return;
};
