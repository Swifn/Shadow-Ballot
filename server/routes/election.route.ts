import { Router } from "express";

import {
  createElection,
  getElectionWithCandidates,
  addCandidate,
  openElection,
  closeElection,
  getOwnedElections,
  getAllElections,
  getSocietyElections,
  getFinishedVotes,
  uploadElectionPicture,
  getElectionPicture,
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
electionRouter.get("/winner/:electionId", getFinishedVotes);
electionRouter.post(
  "/upload-election-picture/:electionId",
  uploadElectionPicture
);
electionRouter.get("/get-election-picture/:electionId", getElectionPicture);
