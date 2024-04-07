import { Router } from "express";
import { getVoter } from "../controller/voter.controller.js";

export const voterRouter = Router();

voterRouter.get("/:id", getVoter);
