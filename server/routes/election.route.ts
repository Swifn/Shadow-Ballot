import { Router } from "express";

import {
  castVote,
  createElection,
  getElectionWithCandidates,
  getElectionResults,
  addCandidate,
  openElection,
  closeElection,
  getOwnedElections,
  getAllElections,
} from "../controller/election.controller.js";

export const electionRouter = Router();

electionRouter.post("/create", createElection);
electionRouter.post("/:electionId/add-candidate", addCandidate);
electionRouter.get("/:id", getElectionWithCandidates);
electionRouter.get("/get-all", getAllElections);
electionRouter.get("/get-owned/:voterId", getOwnedElections);
electionRouter.patch("/:electionId/election-status/open", openElection);
electionRouter.patch("/:electionId/election-status/close", closeElection);
electionRouter.post("/:id/vote", castVote);
electionRouter.get("/results/:id", getElectionResults);
