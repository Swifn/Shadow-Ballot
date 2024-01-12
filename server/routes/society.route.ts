import { Router } from "express";

import {
  createSociety,
  joinSociety,
  leaveSociety,
  getSocieties,
  deleteSociety,
} from "../controller/society.controller.js";

export const societyRouter = Router();

societyRouter.post("/create", createSociety);
societyRouter.post("/:id/join/", joinSociety);
societyRouter.delete("/:id/leave/", leaveSociety);
societyRouter.get("/societies", getSocieties);
societyRouter.delete("/:id/delete", deleteSociety);
