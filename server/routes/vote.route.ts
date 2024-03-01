import { Router } from "express";
import {
  castVote,
  getOpenElections,
  getClosedElections,
  getElectionResults,
  getFinishedElections,
  getVotedInElections,
} from "../controller/vote.controller.js";

export const voteRouter = Router();

voteRouter.post(
  "/election/:electionId/voter/:voterId/candidate/:candidateId",
  castVote
);

voteRouter.get("/get-open-elections/:societyId", getOpenElections);
voteRouter.get("/get-closed-elections/:societyId", getClosedElections);
voteRouter.get("/results/:electionId", getElectionResults);
voteRouter.get("/get-finished-elections/:societyId", getFinishedElections);
voteRouter.get("/get-voted-in-elections/:voterId", getVotedInElections);
