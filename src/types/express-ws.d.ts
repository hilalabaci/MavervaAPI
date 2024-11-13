import express from "express";
import expressWs from "express-ws";

declare global {
  namespace Express {
    interface Application {
      ws: expressWs.Instance;
    }
  }
}
