import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
//CREATE PROJECT OR PROJECT WITH BOARD
export const createProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { title, leadUser, projectKey, boardTitle, description } = req.body;

  if (!leadUser || !leadUser.Id) {
    res.status(400).json({
      message: "Lead user is required and should have a valid ID",
    });
    return;
  }

  try {
    //creating new project
    const newProject = await prisma.project.create({
      data: {
        Name: title,
        Key: projectKey,
        Description: description || "",
        Users: { connect: { Id: leadUser.Id } },
        UserProjects: {
          create: [{ UserId: leadUser.Id }],
        },
        LeadUser: {
          connect: { Id: leadUser.Id },
        },
      },
    });

    //creating new board
    const board = await prisma.board.create({
      data: {
        Name: boardTitle || `${projectKey} board`,
        Key: `${projectKey}_board`,
        LeadUserId: leadUser.Id,
        ProjectId: newProject.Id,
        Users: { connect: { Id: leadUser.Id } },
        UserBoards: {
          create: [
            {
              UserId: leadUser.Id,
              ProjectId: newProject.Id, // Assuming you want to link the user to the board in UserBoard
            },
          ],
        },
      },
    });
    await prisma.sprint.create({
      data: {
        Name: `${projectKey} Sprint 1`,
        BoardId: board.Id,
        IsActive: true,
        StartDate: new Date(),
        EndDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Sprint ends in 2 weeks
      },
    });
    await prisma.column.createMany({
      data: [
        {
          Name: "To Do",
          Status: 1,
          BoardId: board.Id,
        },
        {
          Name: "In Progress",
          Status: 2,
          BoardId: board.Id,
        },
        {
          Name: "Done",
          Status: 99,
          BoardId: board.Id,
        },
      ],
    });
    await prisma.backlog.create({
      data: {
        BoardId: board.Id,
      },
    });

    await prisma.user.update({
      where: { Id: leadUser.Id },
      data: { Role: "Admin" },
    });
    //connect project to board
    await prisma.project.update({
      where: { Id: newProject.Id },
      data: {
        Boards: {
          connect: { Id: board.Id },
        },
      },
    });
    //add user to project
    await prisma.user.update({
      where: { Id: leadUser.Id },
      data: {
        Projects: {
          connect: { Id: newProject.Id },
        },
      },
    });
    // return data in Proje and board
    const projectToReturn = await prisma.project.findUnique({
      where: { Id: newProject.Id },
      include: {
        Boards: {
          include: {
            Sprints: true,
          },
        },
        Users: true,
        LeadUser: true,
      },
    });
    res.status(201).json({
      message: "Project created successfully",
      project: projectToReturn,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating project",
      error: (err as Error).message,
    });
  }
};
//GET PROJECT
export const getProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }
  try {
    const projects = await prisma.project.findMany({
      where: {
        Users: {
          some: { Id: userId },
        },
      },
      include: {
        Users: {
          select: { Id: true, Email: true, FullName: true, Role: true },
        },
        Boards: true,
        LeadUser: {
          select: {
            Id: true,
            Email: true,
            FullName: true,
            Password: false,
            Boards: true,
            Projects: true,
            ProfilePicture: true,
          },
        },
      },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching projects",
      error: (err as Error).message,
    });
  }
};

// const projects = await Project.find({ users: userId })
//   .populate({
//     path: "users",
//     select: "-password", // Exclude the password field
//   })
//   .populate("boards")
//   .populate({ path: "leadUser", select: "-password -boards -projects" });
// res.json(projects);

//UPDATE PROJECT TITLE
export const updateProjectTitle = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id, title } = req.body;
  try {
    const projectTitle = await prisma.project.update({
      where: { Id: id },
      data: { Name: title },
    });
    res.json(projectTitle);
  } catch (err) {
    res.status(500).json({
      message: "Error updating project title",
      error: (err as Error).message,
    });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectId, userId } = req.query;
  try {
    const project = await prisma.project.findUnique({
      where: { Id: projectId as string },
      include: { LeadUser: true },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.LeadUserId !== userId) {
      res
        .status(403)
        .json({ message: "Only project lead can delete the project" });
      return;
    }

    await prisma.$transaction([
      prisma.issue.deleteMany({ where: { ProjectId: projectId as string } }),
      prisma.backlog.deleteMany({
        where: { Board: { ProjectId: projectId as string } },
      }),
      prisma.userBoard.deleteMany({
        where: { Board: { ProjectId: projectId as string } },
      }),
      prisma.sprint.deleteMany({
        where: { Board: { ProjectId: projectId as string } },
      }),
      prisma.column.deleteMany({
        where: { Board: { ProjectId: projectId as string } },
      }),
      prisma.board.deleteMany({ where: { ProjectId: projectId as string } }), // Delete board after related records
      prisma.userProject.deleteMany({
        where: { ProjectId: projectId as string },
      }),
      prisma.project.delete({ where: { Id: projectId as string } }),
    ]);

    res.sendStatus(200).json({
      message: "Successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting project",
      error: (err as Error).message,
    });
  }
};

//FIND PROJECT
export const getSelectedProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectKey } = req.params;
  const userId = req.query.userId as string;

  try {
    const project = await prisma.project.findUnique({
      where: { Key: projectKey },
      include: {
        Users: {
          select: {
            Id: true,
            Email: true,
            FullName: true,
            ProfilePicture: true,
          },
        },
        Boards: {
          select: {
            Id: true,
            Name: true,
            UserBoards: {
              where: {
                UserId: userId as string,
                Role: { in: ["Admin", "Member", "Viewer"] },
              },
              select: {
                Role: true,
              },
            },
          },
        },
      },
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Kullanıcının erişebildiği boardları filtrele
    const accessibleBoards = project.Boards.filter(
      (board) => board.UserBoards.length > 0, // Eğer kullanıcının boardda yetkisi varsa
    ).map((board) => ({
      Id: board.Id,
      Name: board.Name,
    }));

    res.json({
      ...project,
      Boards: accessibleBoards, // Sadece erişebildiği boardlar
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project",
      error: (error as Error).message,
    });
  }
};

