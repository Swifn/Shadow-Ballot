import { Router } from "express";

import {
  castVote,
  createElection,
  getElectionWithCandidates,
  getElectionResults,
} from "../controller/election.controller.js";

export const electionRouter = Router();

electionRouter.post("/create", createElection);

electionRouter.get("/:id", getElectionWithCandidates);

electionRouter.post("/vote", castVote);

electionRouter.get("/results/:id", getElectionResults);
