import { Request, Response } from "express";
import { Election } from "../models/election.model.js";
import { ElectionCandidates } from "../models/election-candidates.model.js";
import { Vote } from "../models/vote.model.js";

//TODO: make it so that the time inputed automatically closes the election
// once the time is met
export const createElection = async (req: Request, res: Response) => {
  try {
    const { name, description, societyId, time } = req.body;

    if (!name || !societyId || !time) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const election = await Election.create({
      name,
      description,
      societyId,
      time,
    });

    return res.status(201).send(election);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Unable to create election" });
  }
};

export const addCandidate = async (req: Request, res: Response) => {
  const { electionId, voterId, candidateName, description } = req.body;
  try {
    const existingCandidate = await ElectionCandidates.findOne({
      where: {
        electionId: electionId,
        voterId: voterId,
      },
    });

    if (existingCandidate) {
      return res
        .status(400)
        .send({ error: "This candidate is already apart of this election" });
    }

    const newCandidate = await ElectionCandidates.create({
      electionId,
      voterId,
      candidateName,
      description,
    });
    return res.status(201).send(newCandidate);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error: "Unable to add candidate to election" });
  }
};

//TODO: Only pass required information, not entire data from ElectionCandidates table.
export const getElectionWithCandidates = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const election = await Election.findByPk(id, {
      include: [
        {
          model: ElectionCandidates,
          attributes: [
            "candidateId",
            "electionId",
            "candidateName",
            "description",
          ],
        },
      ],
    });
    if (!election) {
      return res.status(500).send({ error: "Election not found" });
    }
    return res.status(200).send(election);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to fetch election" });
  }
};

export const castVote = async (req: Request, res: Response) => {
  const { voterId, candidateId, electionId } = req.body;
  try {
    const existingVote = await Vote.findOne({
      where: {
        voteId: voterId,
        electionId: electionId,
      },
    });
    if (existingVote) {
      return res
        .status(400)
        .send({ error: "You has already voted in this election" });
    }

    const validCandidate = await ElectionCandidates.findOne({
      where: {
        candidateId: candidateId,
        electionId: electionId,
      },
    });

    if (!validCandidate) {
      return res
        .status(400)
        .send({ error: "This candidate is not a part of this election" });
    }

    const vote = await Vote.create({ voterId, candidateId, electionId });
    return res.status(201).send(vote);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to cast vote" });
  }
};

export const getElectionResults = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to fetch election results" });
  }
};

//TODO: finish open and close election funcitons and modify the data model so
// that it holds a bool value of whether an election is still open or now closed

export const openElection = async (req: Request, res: Response) => {};

export const closeElection = async (req: Request, res: Response) => {};
