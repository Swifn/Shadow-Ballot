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
} from "../models/index.js";
import * as HTTP from "../utils/magicNumbers.js";

import { Request, Response } from "express";
import { Sequelize, Op } from "sequelize";

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
    console.log(openElections);
    return res.status(HTTP.STATUS_OK).send({ openElections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch open elections" });
  }
};

export const getElectionResults = async (req: Request, res: Response) => {
  const electionId = req.params.electionId;
  try {
    //Fetch all candidates for the election
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

    // Create a map to count votes for each candidate
    const voteCounts = {};
    votes.forEach(vote => {
      voteCounts[vote.candidateId] = (voteCounts[vote.candidateId] || 0) + 1;
    });

    let totalElectionVotes = votes.length;

    // Exclude the latest vote if totalElectionVotes is odd
    if (totalElectionVotes % 2 !== 0) {
      const latestVote = votes[votes.length - 1]; // Get the latest vote
      voteCounts[latestVote.candidateId] -= 1; // Remove the latest vote from the count
      totalElectionVotes -= 1; // adjust the totalElectionVotes
      console.log(`Total votes: ${totalElectionVotes}`);
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
