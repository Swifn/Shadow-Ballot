import {
  doesElectionExist,
  isCandidateInElection,
  isElectionOpen,
  isNewVote,
} from "../utils/utils.js";
import { Vote, Election, Society, VoterSociety } from "../models/index.js";
import * as HTTP from "../utils/magicNumbers.js";

import { Request, Response } from "express";

export const castVote = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  const candidateId = req.params.candidateId;
  const electionId = req.params.electionId;
  console.log(voterId);
  console.log(candidateId);
  console.log(electionId);
  try {
    if (await doesElectionExist(electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This election does not exist" });
    }
    if (await isElectionOpen(electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This election is not open for voting" });
    }
    if (await isCandidateInElection(electionId, candidateId)) {
      return res.status(HTTP.STATUS_BAD_REQUEST).send({
        message: "The candidate you're voting for isn't in this election",
      });
    }

    if (await isNewVote(voterId, electionId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "You can only vote once per election" });
    }

    await Vote.create({ voterId, electionId, candidateId });
    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "You have successfully casted your vote" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to cast vote" });
  }
};

export const getClosedElections = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  try {
    const closedElections = await VoterSociety.findAll({
      where: { voterId: voterId },
      include: [
        {
          model: Society,
          include: [
            {
              model: Election,
              where: { electionStatus: false },
              attributes: {
                exclude: ["societyOwnerId", "createdAt", "updatedAt"],
              },
            },
          ],
          attributes: { exclude: ["societyOwnerId", "createdAt", "updatedAt"] },
        },
      ],
      attributes: [],
    });
    return res.status(HTTP.STATUS_OK).send({ closedElections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch closed elections" });
  }
};
export const getOpenElections = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  try {
    const openElections = await VoterSociety.findAll({
      where: { voterId: voterId },
      include: [
        {
          model: Society,
          include: [
            {
              model: Election,
              where: { electionStatus: true },
              attributes: {
                exclude: ["societyOwnerId", "createdAt", "updatedAt"],
              },
            },
          ],
          attributes: { exclude: ["societyOwnerId", "createdAt", "updatedAt"] },
        },
      ],
      attributes: [],
    });
    return res.status(HTTP.STATUS_OK).send({ openElections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch open elections" });
  }
};
