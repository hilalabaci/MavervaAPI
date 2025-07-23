import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
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
        UserProjects: {
          create: [{ UserId: leadUser.Id, Role: "Admin" }],
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
        UserBoards: {
          create: [
            {
              UserId: leadUser.Id,
              ProjectId: newProject.Id,
              Role: "Admin",
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

    //connect project to board
    await prisma.project.update({
      where: { Id: newProject.Id },
      data: {
        Boards: {
          connect: { Id: board.Id },
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
        UserProjects: {
          include: {
            User: {
              select: {
                Id: true,
                Email: true,
                FullName: true,
                ProfilePicture: true,
              },
            },
          },
        },
        LeadUser: true,
      },
    });
    res.status(201).json({
      message: "Project created successfully",
      project: {
        ...projectToReturn,
        Users: projectToReturn?.UserProjects.map(
          (userProject) => userProject.User,
        ),
      },
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
        UserProjects: {
          some: { UserId: userId },
        },
      },
      include: {
        UserProjects: {
          include: {
            User: {
              select: {
                Id: true,
                Email: true,
                FullName: true,
                ProfilePicture: true,
              },
            },
          },
        },
        Boards: {
          select: {
            Id: true,
            Sprints: {
              where: { IsActive: true },
              select: {
                Id: true,
              },
            },
          },
        },
        LeadUser: {
          select: {
            Id: true,
            Email: true,
            FullName: true,
            Password: false,
            ProfilePicture: true,
          },
        },
      },
    });
    const favouriteProjects = await prisma.userFavouriteProject.findMany({
      where: { UserId: userId },
      select: { ProjectId: true },
    });

    const projectsWithFavourite = projects.map((project) => ({
      ...project,
      IsFavourite: favouriteProjects.some(
        (fav) => fav.ProjectId === project.Id,
      ),
      Users: project.UserProjects.map((userProject) => userProject.User),
    }));

    res.json(projectsWithFavourite);
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
        UserProjects: {
          include: {
            User: {
              select: {
                Id: true,
                Email: true,
                FullName: true,
                ProfilePicture: true,
              },
            },
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
export const updateProjectToFavorite = async (req: Request, res: Response) => {
  const { projectId, userId, isFavourite } = req.query;
  try {
    if (!projectId || !userId || isFavourite === undefined) {
      res.status(400).json({
        message: "Project ID, User ID and isFavorite are required",
      });
      return;
    }

    const userProject = await prisma.userProject.findFirst({
      where: {
        ProjectId: projectId as string,
        UserId: userId as string,
      },
    });
    if (!userProject) {
      res.status(404).json({ message: "User project not found" });
      return;
    }
    if (isFavourite === "true") {
      const UserFavoriteProject = await prisma.userFavouriteProject.findFirst({
        where: {
          ProjectId: projectId as string,
          UserId: userId as string,
        },
      });
      if (UserFavoriteProject) {
        res.status(400).json({ message: "Project already favorite" });
        return;
      }
      await prisma.userFavouriteProject.create({
        data: {
          ProjectId: projectId as string,
          UserId: userId as string,
        },
      });
    } else {
      await prisma.userFavouriteProject.deleteMany({
        where: {
          ProjectId: projectId as string,
          UserId: userId as string,
        },
      });
    }
    const project = await prisma.project.findUnique({
      where: { Id: projectId as string },
      include: {
        UserProjects: {
          include: {
            User: {
              select: {
                Id: true,
                Email: true,
                FullName: true,
                ProfilePicture: true,
              },
            },
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
    res.json(project);
  } catch (err) {
    res.status(500).json({
      message: "Error updating project favorite",
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
    const userProject = await prisma.userProject.findFirst({
      where: { ProjectId: projectId as string, UserId: userId as string },
      include: { Project: true, User: true },
    });
    const user = await prisma.user.findUnique({
      where: { Id: userId as string },
      select: {
        Id: true,
        FullName: true,
        Email: true,
        ProfilePicture: true,
      },
    });
    const project = await prisma.project.findUnique({
      where: { Id: projectId as string },
      include: {
        UserProjects: {
          include: {
            User: {
              select: {
                Id: true,
                Email: true,
                FullName: true,
                ProfilePicture: true,
              },
            },
          },
        },
      },
    });

    if (!userProject || !userProject.Project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (userProject.Role.toLowerCase() !== "admin") {
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
      prisma.userFavouriteProject.deleteMany({
        where: { ProjectId: projectId as string },
      }),
      prisma.project.delete({ where: { Id: projectId as string } }),
    ]);

    if (project?.UserProjects && user) {
      await Promise.all(
        project.UserProjects.map((up) =>
          prisma.notification.create({
            data: {
              ToUserId: up.User.Id,
              FromUserId: user.Id,
              Message: `${user.FullName} has deleted the ${project.Name} project you were a member of.`,
              IsRead: false,
              CreatedAt: new Date(),
            },
          }),
        ),
      );
    }
    res.status(200).json({
      message: "Successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting project",
      error: (err as Error).message,
    });
  }
};
