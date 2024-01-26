import { Request, Response } from "express";
import { Election, Society } from "../models/index.js";
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
  isElectionClose,
} from "../utils/utils.js";
import * as HTTP from "../utils/magicNumbers.js";
import { Sequelize } from "sequelize";
import { v4 as uuid } from "uuid";

//TODO: have a time /  date option for when the vote should open and close.

export const createElection = async (req: Request, res: Response) => {
  try {
    const { name, description, societyId, voterId } = req.body;

    if (!name || !societyId || !voterId) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Missing required fields" });
    }

    if (await doesSocietyExist(societyId)) {
      return res.status(HTTP.STATUS_BAD_REQUEST).send({
        message: "The society you are creating an election for does not exist",
      });
    }

    if (await isSocietyOwner(societyId, voterId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "You are not the owner of this society" });
    }

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
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to create election" });
  }
};

//TODO: Add a check so that candidates cannot be added once an election
export const addCandidate = async (req: Request, res: Response) => {
  const electionId = req.params.electionId;
  const { candidateAlias, candidateName, description } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This election does not exist" });
    }

    if (await isNewCandidate(electionId, candidateName, candidateAlias)) {
      return res.status(HTTP.STATUS_BAD_REQUEST).send({
        message: "This candidate is already a part of this election",
      });
    }

    await ElectionCandidates.create({
      electionId: electionId,
      candidateName: candidateName,
      candidateAlias: candidateAlias,
      description: description,
    });
    return res.status(HTTP.STATUS_CREATED).send({
      message: "You have successfully added this candidate to this election",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to add candidate to election" });
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
        .send({ message: "Election not found" });
    }
    return res.status(HTTP.STATUS_OK).send(election);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch election" });
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
            .send({ message: "You can not vote more than once per election" });
        }
        return res.status(HTTP.STATUS_BAD_REQUEST).send({
          message: "The candidate you are voting for is not in this election",
        });
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This election is not open voting" });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to cast vote" });
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
      .send({ message: "Unable to fetch election results" });
  }
};

//TODO: Add a feature where the election can only be opened once to stop changes?
export const openElection = async (req: Request, res: Response) => {
  const electionId = req.params.electionId;

  const electionName = await Election.findOne({
    where: {
      electionId: electionId,
    },
  });

  const { voterId, societyId, electionStatus } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: `${electionName?.name} election does not exist` });
    }
    if (await isSocietyOwner(societyId, voterId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "You are not the owner of this society" });
    }
    if (await isElectionClose(electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: `${electionName?.name} election is already open` });
    }
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
      .send({ message: `${electionName?.name}  election is now open` });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: `Unable to open ${electionName?.name}` });
  }
};

export const closeElection = async (req: Request, res: Response) => {
  const electionId = req.params.electionId;

  const electionName = await Election.findOne({
    where: {
      electionId: electionId,
    },
  });

  const { voterId, societyId, electionStatus } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: `${electionName?.name} election does not exist` });
    }
    if (await isSocietyOwner(societyId, voterId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "You are not the owner of this society" });
    }
    if (await isElectionOpen(electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: `${electionName?.name} election is already closed` });
    }
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
      .send({ message: `${electionName?.name} is now closed` });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: `Unable to close ${electionName?.name} election` });
  }
};

export const getOwnedElections = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  try {
    const elections = await Election.findAll({
      attributes: {
        exclude: ["societyOwnerId", "createdAt", "updatedAt"],
      },
      where: {
        societyOwnerId: voterId,
      },
    });
    return res.status(HTTP.STATUS_OK).send({ elections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get societies" });
  }
};
export const getAllElections = async (req: Request, res: Response) => {};
