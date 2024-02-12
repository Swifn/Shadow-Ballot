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
  getSocietyById,
  getSocietyPicture,
} from "../controller/society.controller.js";

export const societyRouter = Router();

societyRouter.post("/create", createSociety);
societyRouter.post("/upload-society-picture/:societyId", uploadSocietyPicture);
societyRouter.get("/get-society-picture/:societyId", getSocietyPicture);
societyRouter.post("/join", joinSociety);
societyRouter.post("/leave/:societyId/:voterId", leaveSociety);
societyRouter.get("/get-all", getAllSocieties);
societyRouter.get("/get-owned/:voterId", getOwnedSocieties);
societyRouter.get("/get-joined/:voterId", getJoinedSocieties);
societyRouter.post("/delete/:societyId", deleteSociety);
societyRouter.get("/get-society-by-id/:societyId", getSocietyById);
