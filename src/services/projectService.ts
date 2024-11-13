import Project, { IProject } from "../models/Project";

export const projectService = {
  findByProjectKey: async (projectKey: string): Promise<IProject | null> => {
    return await Project.findOne({ projectKey: projectKey });
  },
};
