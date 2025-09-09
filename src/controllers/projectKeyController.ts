import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const createProjectKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const title = req.query.title as string | undefined;
    let newProjectKey = "";
    if (!title) {
      res.status(400).json({ message: "Project key is required." });
      return;
    }
    const chars = title.split(" ") ?? ["Undefined"];
    if (chars.length === 1) {
      newProjectKey = (
        (chars?.[0]?.[0] ?? "") +
        (chars?.[0]?.[1] ?? "") +
        (chars?.[0]?.[2] ?? "")
      ).toUpperCase();
    } else {
      let newKey = "";
      let i = 0;
      while (i < chars.length) {
        newKey = newKey + chars[i][0];
        i++;
      }
      newProjectKey = newKey.toUpperCase();
    }
    let isKeyUnique = false;
    let uniqueKey = newProjectKey;
    let suffix = 1;
    while (!isKeyUnique) {
      const existingProject = await prisma.project.findFirst({
        where: {
          Key: uniqueKey,
        },
      });
      if (!existingProject) {
        isKeyUnique = true;
      } else {
        uniqueKey = `${newProjectKey}${suffix}`;
        suffix++;
      }
    }
    res.json(uniqueKey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error creating card Key" });
  }
};
