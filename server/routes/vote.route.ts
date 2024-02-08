import { Router } from "express";
import {
  castVote,
  getOpenElections,
  getClosedElections,
  getElectionResults,
} from "../controller/vote.controller.js";

export const voteRouter = Router();

voteRouter.post(
  "/election/:electionId/voter/:voterId/candidate/:candidateId",
  castVote
);

voteRouter.get("/get-open-elections/:voterId", getOpenElections);
voteRouter.get("/get-closed-elections/:voterId", getClosedElections);
voteRouter.get("/results/:electionId", getElectionResults);
