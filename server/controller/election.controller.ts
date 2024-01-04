import { Request, Response } from "express";
import { Election } from "../models/election.model.js";
import { ElectionCandidates } from "../models/electrion-candidate.model.js";
import { Vote } from "../models/vote.model.js";

export const createElection = async (req: Request, res: Response) => {
  try {
    const vote = await Election.create({
      name: req.body.string,
      description: req.body.string,
      societyId: req.body.number,
      time: req.body.time,
    });
    return res.status(201).send({ vote });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to create election" });
  }
};

//TODO: Implement k-anonymity
export const getElectionWithCandidates = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const election = await Election.findByPk(id, {
      include: [ElectionCandidates],
    });
    if (!election) {
      return res.status(500).send({ error: "Election not found" });
    }
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
        .send({ error: "Voter has already voted in this election" });
    }
    const vote = await Vote.create({ voterId, candidateId, electionId });
    return res.status(201).send(vote);
  } catch (error) {
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
