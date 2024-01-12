import { Request, Response } from "express";
import { Election } from "../models/election.model.js";
import { ElectionCandidates } from "../models/election-candidates.model.js";
import { Vote } from "../models/vote.model.js";
import {
  doesElectionExist,
  doesSocietyExist,
  isCandidateInElection,
  isElectionOpen,
  isNewVote,
  isSocietyOwner,
} from "../utils/utils.js";

//TODO: make it so that the time inputted automatically closes the election
// once the time is met.

export const createElection = async (req: Request, res: Response) => {
  try {
    const { name, description, societyId, voterId, time } = req.body;

    if (!name || !societyId || !time) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    if (await doesSocietyExist(societyId)) {
      if (await isSocietyOwner(societyId, voterId)) {
        await Election.create({
          name: name,
          description: description,
          societyId: societyId,
          societyOwnerId: voterId,
          electionStatus: true,
          time: time,
        });
        return res
          .status(201)
          .send({ message: `${name} election has been created` });
      }
      return res
        .status(400)
        .send({ error: "You are not the owner of this society" });
    }
    return res.status(400).send({
      error: "The society you are creating an election for does not exist",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Unable to create election" });
  }
};

export const addCandidate = async (req: Request, res: Response) => {
  const { electionId, voterId, candidateName, description } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      if (await isCandidateInElection(electionId, voterId)) {
        await ElectionCandidates.create({
          electionId,
          voterId,
          candidateName,
          description,
        });
        return res.status(201).send({
          message:
            "You have successfully added this candidate to this election",
        });
      }
      return res
        .status(400)
        .send({ error: "This candidate is already a part of this election" });
    }
    return res.status(400).send({ error: "This election does not exist" });
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
    if (await doesElectionExist(electionId)) {
      if (await isElectionOpen(electionId)) {
        if (await isCandidateInElection(electionId, candidateId)) {
          if (await isNewVote(voterId, electionId)) {
            await Vote.create({ voterId, candidateId, electionId });
            return res
              .status(201)
              .send({ message: "You have successfully casted your vote" });
          }
          return res
            .status(400)
            .send({ error: "You can not vote more than once per election" });
        }
        return res.status(400).send({
          error: "The candidate you are voting for is not in this election",
        });
      }
      return res
        .status(400)
        .send({ error: "This election is not open voting" });
    }
    return res.status(400).send({ error: "This election does not exist" });
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

export const openElection = async (req: Request, res: Response) => {
  const { electionId, voterId, societyId, electionStatus } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      if (await isSocietyOwner(societyId, voterId)) {
        if (await isElectionOpen(electionId)) {
          await Election.update(
            { electionStatus: electionStatus },
            {
              where: {
                electionId: electionId,
              },
            }
          );
          return res.status(201).send({ message: "Election is now open" });
        }
        return res.status(400).send({ error: "This election is already open" });
      }
      return res
        .status(400)
        .send({ error: "You are not the owner of this society" });
    }
    return res.status(400).send({ error: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to open vote" });
  }
};

export const closeElection = async (req: Request, res: Response) => {
  const { electionId, voterId, societyId, electionStatus } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      if (await isSocietyOwner(societyId, voterId)) {
        if (!(await isElectionOpen(electionId))) {
          await Election.update(
            { electionStatus: electionStatus },
            {
              where: {
                electionId: electionId,
              },
            }
          );
          return res
            .status(201)
            .send({ message: "This election is now closed" });
        }
        return res
          .status(400)
          .send({ error: "This election is already closed" });
      }
      return res
        .status(400)
        .send({ error: "You are not the owner of this society" });
    }
    return res.status(400).send({ error: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to close vote" });
  }
};
