import { Router } from "express";

import {
  castVote,
  createElection,
  getElectionWithCandidates,
  getElectionResults,
  addCandidate,
  openElection,
  closeElection,
} from "../controller/election.controller.js";

export const electionRouter = Router();

electionRouter.post("/create", createElection);

electionRouter.post("/create/add", addCandidate);

electionRouter.get("/:id", getElectionWithCandidates);

electionRouter.patch("/:id", openElection);

electionRouter.patch("/:id", closeElection);

electionRouter.post("/:id/vote", castVote);

electionRouter.get("/results/:id", getElectionResults);
