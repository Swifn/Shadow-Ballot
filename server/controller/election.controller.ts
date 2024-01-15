import { Request, Response } from "express";
import { Election } from "../models/index.js";
import { ElectionCandidates } from "../models/index.js";
import { Vote } from "../models/index.js";
import {
  doesElectionExist,
  doesSocietyExist,
  isCandidateInElection,
  isElectionOpen,
  isNewVote,
  isSocietyOwner,
  isNewCandidate,
} from "../utils/utils.js";
import * as HTTP from "../utils/magicNumbers.js";
import { Sequelize } from "sequelize";

//TODO: have a time /  date option for when the vote should open and close.

export const createElection = async (req: Request, res: Response) => {
  try {
    const { name, description, societyId, voterId } = req.body;

    if (!name || !societyId || voterId) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ error: "Missing required fields" });
    }

    if (await doesSocietyExist(societyId)) {
      if (await isSocietyOwner(societyId, voterId)) {
        await Election.create({
          name: name,
          description: description,
          societyId: societyId,
          societyOwnerId: voterId,
          electionStatus: true,
        });
        return res
          .status(HTTP.STATUS_CREATED)
          .send({ message: `${name} election has been created` });
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ error: "You are not the owner of this society" });
    }
    return res.status(HTTP.STATUS_BAD_REQUEST).send({
      error: "The society you are creating an election for does not exist",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ error: "Unable to create election" });
  }
};

//TODO: Add a check so that candidates cannot be added once an election
export const addCandidate = async (req: Request, res: Response) => {
  const { electionId, candidateAlias, candidateName, description } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      if (await isNewCandidate(electionId, candidateName, candidateAlias)) {
        await ElectionCandidates.create({
          electionId: electionId,
          candidateName: candidateName,
          candidateAlias: candidateAlias,
          description: description,
        });
        return res.status(HTTP.STATUS_CREATED).send({
          message:
            "You have successfully added this candidate to this election",
        });
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ error: "This candidate is already a part of this election" });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ error: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
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
            "candidateAlias",
            "description",
          ],
        },
      ],
    });
    if (!election) {
      return res
        .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
        .send({ error: "Election not found" });
    }
    return res.status(HTTP.STATUS_OK).send(election);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ error: "Unable to fetch election" });
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
              .status(HTTP.STATUS_CREATED)
              .send({ message: "You have successfully casted your vote" });
          }
          return res
            .status(HTTP.STATUS_BAD_REQUEST)
            .send({ error: "You can not vote more than once per election" });
        }
        return res.status(HTTP.STATUS_BAD_REQUEST).send({
          error: "The candidate you are voting for is not in this election",
        });
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ error: "This election is not open voting" });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ error: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ error: "Unable to cast vote" });
  }
};

export const getElectionResults = async (req: Request, res: Response) => {
  const { electionId } = req.params;
  try {
    const results = await Vote.findAll({
      where: {
        electionId: electionId,
      },
      attributes: [
        "candidateId",
        [Sequelize.fn("COUNT", Sequelize.col("voteId")), "totalVotes"],
      ],
      include: [
        {
          model: ElectionCandidates,
          attributes: ["name"],
        },
      ],
      group: ["candidateId", ElectionCandidates.tableName + ".name"],
      order: [[Sequelize.col("totalVotes"), "DESC"]],
      raw: true,
    });

    return res.status(HTTP.STATUS_OK).send(results);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ error: "Unable to fetch election results" });
  }
};

//TODO: Add a feature where the election can only be opened once to stop changes?
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
          return res
            .status(HTTP.STATUS_OK)
            .send({ message: "Election is now open" });
        }
        return res
          .status(HTTP.STATUS_BAD_REQUEST)
          .send({ error: "This election is already open" });
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ error: "You are not the owner of this society" });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ error: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ error: "Unable to open vote" });
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
            .status(HTTP.STATUS_OK)
            .send({ message: "This election is now closed" });
        }
        return res
          .status(HTTP.STATUS_BAD_REQUEST)
          .send({ error: "This election is already closed" });
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ error: "You are not the owner of this society" });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ error: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ error: "Unable to close vote" });
  }
};
