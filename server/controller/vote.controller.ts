import {
  doesElectionExist,
  isCandidateInElection,
  isElectionOpen,
  isNewVote,
} from "../utils/utils.js";
import {
  Vote,
  Election,
  Society,
  VoterSociety,
  ElectionCandidates,
  FileStorage,
} from "../models/index.js";
import * as HTTP from "../utils/magicNumbers.js";

import { Request, Response } from "express";
import { Op } from "sequelize";

interface Election {
  electionId: number;
  name: string;
  description: string;
  ElectionPicture?: {
    path: string;
  };
}

export const castVote = async (req: Request, res: Response) => {
  const voterId = parseInt(req.params.voterId);
  const candidateId = parseInt(req.params.candidateId);
  const electionId = parseInt(req.params.electionId);

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
  const societyId = req.params.societyId;
  try {
    const closedElections = await Society.findAll({
      where: { societyId: societyId },
      include: [
        {
          model: Election,
          where: {
            start: {
              [Op.gte]: new Date(),
            },
            electionStatus: false,
          },
          attributes: {
            exclude: ["societyOwnerId", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: FileStorage,
              attributes: ["path"],
              as: "ElectionPicture",
            },
          ],
        },
      ],
      attributes: { exclude: ["societyOwnerId", "createdAt", "updatedAt"] },
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
  const societyId = req.params.societyId;
  try {
    const openElections = await Society.findAll({
      where: { societyId: societyId },
      include: [
        {
          model: Election,
          where: { electionStatus: true },
          attributes: {
            exclude: ["societyOwnerId", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: FileStorage,
              attributes: ["path"],
              as: "ElectionPicture",
            },
          ],
        },
      ],
      attributes: { exclude: ["societyOwnerId", "createdAt", "updatedAt"] },
    });

    return res.status(HTTP.STATUS_OK).send({ openElections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch open elections" });
  }
};

export const getFinishedElections = async (req: Request, res: Response) => {
  const societyId = req.params.societyId;
  try {
    const elections = await Election.findAll({
      where: {
        societyId: societyId,
        end: {
          [Op.lte]: new Date(),
        },
        electionStatus: false,
      },
      include: [
        { model: FileStorage, attributes: ["path"], as: "ElectionPicture" },
      ],
      attributes: { exclude: ["societyOwnerId", "createdAt", "updatedAt"] },
    });

    console.log(elections);

    return res.status(HTTP.STATUS_OK).send({ elections });
  } catch (error) {
    console.error("Error closing elections:", error);
  }
};

export const getElectionResults = async (req: Request, res: Response) => {
  const electionId = req.params.electionId;
  try {
    console.log(electionId);
    const election = await Election.findOne({
      where: {
        electionId: electionId,
      },
      attributes: ["kValue"],
    });

    if (!election) {
      return res.status(404).send({ message: "Election not found" });
    }

    const kValue = election!.kValue;

    const candidates = await ElectionCandidates.findAll({
      where: { electionId: electionId },
      attributes: [
        "candidateId",
        "candidateName",
        "candidateAlias",
        "description",
      ],
    });

    // Fetch vote counts for candidates
    const votes = await Vote.findAll({
      where: { electionId },
      order: [["createdAt", "ASC"]], // Sort the votes in ascending order
      attributes: ["candidateId"],
    });

    const totalVotes = votes.length;
    const votesToCount = totalVotes - (totalVotes % kValue); // Ensure that the last few votes are not counted

    // Count the votes for each candidate and store in a map
    const voteCounts = {};
    for (let i = 0; i < votesToCount; i++) {
      const vote = votes[i];
      if (!voteCounts[vote.candidateId]) {
        voteCounts[vote.candidateId] = 0;
      }
      voteCounts[vote.candidateId]++;
    }

    //Merge the results so that all candidates are included even if they have no votes to their name
    const results = candidates.map(candidate => {
      return {
        candidateId: candidate.candidateId,
        candidateName: candidate.candidateName,
        candidateAlias: candidate.candidateAlias,
        description: candidate.description,
        totalVotes: voteCounts[candidate.candidateId] || 0, // Assign 0 if no votes found
      };
    });

    return res.status(HTTP.STATUS_OK).send(results);
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch election results" });
  }
};

export const getVotedInElections = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  try {
    const votedElections = await Vote.findAll({
      where: { voterId: voterId },
      attributes: {
        exclude: [
          "voterId",
          "candidateId",
          "voteId",
          "electionId",
          "createdAt",
          "updatedAt",
        ],
      },
      include: [
        {
          model: Election,
          attributes: {
            exclude: ["societyId", "societyOwnerId", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: FileStorage,
              attributes: ["path"],
              as: "ElectionPicture",
            },
          ],
        },
      ],
    });

    return res.status(HTTP.STATUS_OK).send({ votedElections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch voted elections" });
  }
};
