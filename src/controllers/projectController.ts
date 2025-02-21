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
        Boards: true,
        Users: true,
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
  //const filter = { _id: req.body.id };
  //const update = { title: req.body.title };
  // const projectTitle = await Project.findOneAndUpdate(filter, update, {
  //   new: true,
  // });
  // res.json(projectTitle?.toJSON());
};

//DELETE PROJECT
export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // Do: only project lead must be delete!
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

    await prisma.issue.deleteMany({
      where: { ProjectId: projectId as string },
    });
    await prisma.board.deleteMany({
      where: { ProjectId: projectId as string },
    });
    await prisma.userProject.deleteMany({
      where: { ProjectId: projectId as string },
    });
    await prisma.project.delete({
      where: { Id: projectId as string },
    });
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
export const findProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectKey } = req.params;
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
            Password: false,
          },
        },
      },
    });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project",
      error: (error as Error).message,
    });
  }
};
