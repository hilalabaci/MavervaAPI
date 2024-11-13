import { Request } from "express";
import { WebSocket } from "ws";
import { projectService } from "../services/projectService";

export const handleProjectKey = (ws: WebSocket, req: Request): void => {
  ws.on("message", async (message: string) => {
    const data = JSON.parse(message);
    let projectKey = "";
    const chars = data.title.split(" ") ?? ["Undefined"];
    if (chars.length === 1) {
      projectKey = (
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
      projectKey = newKey.toUpperCase();
    }

    let isKeyUnique = false;
    let uniqueKey = projectKey;
    let suffix = 1;
    while (!isKeyUnique) {
      const existingProject = projectService.findByProjectKey(uniqueKey);
      if (!existingProject) {
        isKeyUnique = true;
      } else {
        // Eğer aynı key varsa, sonuna bir sayı ekleyerek benzersiz yap
        uniqueKey = `${projectKey}${suffix}`;
        suffix++;
      }
    }
    ws.send(JSON.stringify({ projectKey: uniqueKey }));
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
};
