import { Router } from "express";

import {
  createElection,
  getElectionWithCandidates,
  getElectionResults,
  addCandidate,
  openElection,
  closeElection,
  getOwnedElections,
  getAllElections,
  getSocietyElections,
} from "../controller/election.controller.js";

export const electionRouter = Router();

electionRouter.post("/create", createElection);
electionRouter.post("/:electionId/add-candidate/", addCandidate);
electionRouter.get(
  "/getElectionCandidates/:electionId",
  getElectionWithCandidates
);
electionRouter.get("/get-all", getAllElections);
electionRouter.get("/get-society-elections/:voterId", getSocietyElections);
electionRouter.get("/get-owned/:voterId", getOwnedElections);
electionRouter.patch("/:electionId/election-status/open", openElection);
electionRouter.patch("/:electionId/election-status/close", closeElection);
electionRouter.get("/results/:id", getElectionResults);
