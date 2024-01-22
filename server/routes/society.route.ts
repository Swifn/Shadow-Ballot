import { Router } from "express";

import {
  createSociety,
  joinSociety,
  leaveSociety,
  getAllSocieties,
  deleteSociety,
} from "../controller/society.controller.js";

export const societyRouter = Router();

societyRouter.post("/create", createSociety);
societyRouter.post("/join", joinSociety);
societyRouter.delete("/:id/leave", leaveSociety);
societyRouter.get("/getall", getAllSocieties);
societyRouter.delete("/:id/delete", deleteSociety);
