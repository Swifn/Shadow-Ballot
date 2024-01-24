import { Router } from "express";

import {
  createSociety,
  joinSociety,
  leaveSociety,
  getAllSocieties,
  deleteSociety,
  uploadSocietyPicture,
  getOwnedSocieties,
  getJoinedSocieties,
} from "../controller/society.controller.js";

export const societyRouter = Router();

societyRouter.post("/create/:id", createSociety);
societyRouter.post("/create/upload-picture", uploadSocietyPicture);
societyRouter.post("/join", joinSociety);
societyRouter.post("/leave/:societyId/:voterId", leaveSociety);
societyRouter.get("/get-all", getAllSocieties);
societyRouter.get("/get-owned/:voterId", getOwnedSocieties);
societyRouter.get("/get-joined/:voterId", getJoinedSocieties);
societyRouter.post("/delete/:societyId", deleteSociety);
