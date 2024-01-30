import { Router } from "express";
import { castVote } from "../controller/vote.controller.js";

export const voteRouter = Router();

voteRouter.get("/:id", castVote);
