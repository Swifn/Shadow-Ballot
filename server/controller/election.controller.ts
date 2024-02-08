import { Request, Response } from "express";
import {
  Election,
  ElectionCandidates,
  Society,
  Vote,
  VoterSociety,
} from "../models/index.js";

import {
  doesElectionExist,
  doesSocietyExist,
  isElectionClose,
  isElectionOpen,
  isNewCandidate,
  isSocietyOwner,
} from "../utils/utils.js";
import * as HTTP from "../utils/magicNumbers.js";
import { Config } from "../configs/config.js";

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

    const newElection = await Election.create({
      name: name,
      description: description,
      societyId: societyId,
      societyOwnerId: voterId,
      electionStatus: true,
    });

    return res
      .status(HTTP.STATUS_CREATED)
      .send({ message: `${name} election has been created`, newElection });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to create election" });
  }
};

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
  const electionId = req.params.electionId;
  try {
    const election = await Election.findByPk(electionId, {
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
      attributes: {
        exclude: [
          "societyId",
          "electionStatus",
          "electionPicture",
          "societyOwnerId",
          "createdAt",
          "updatedAt",
        ],
      },
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

// export const getElectionResults = async (req: Request, res: Response) => {
//   const electionId = req.params.electionId;
//   try {
//     //Fetch all candidates for the election
//     const candidates = await ElectionCandidates.findAll({
//       where: { electionId: electionId },
//       attributes: [
//         "candidateId",
//         "candidateName",
//         "candidateAlias",
//         "description",
//       ],
//     });
//
//     // Fetch vote counts for candidates
//     const votes = await Vote.findAll({
//       where: { electionId },
//       order: [["createdAt", "ASC"]], // Sort the votes in ascending order
//       attributes: ["candidateId"],
//     });
//
//     // Create a map to count votes for each candidate
//     const voteCounts = {};
//     votes.forEach(vote => {
//       voteCounts[vote.candidateId] = (voteCounts[vote.candidateId] || 0) + 1;
//     });
//
//     let totalElectionVotes = votes.length;
//
//     // Exclude the latest vote if totalElectionVotes is odd
//     if (totalElectionVotes % 2 !== 0) {
//       const latestVote = votes[votes.length - 1]; // Get the latest vote
//       voteCounts[latestVote.candidateId] -= 1; // Remove the latest vote from the count
//       totalElectionVotes -= 1; // adjust the totalElectionVotes
//       console.log(`Total votes: ${totalElectionVotes}`);
//     }
//
//     //Merge the results so that all candidates are included even if they have no votes to their name
//     const results = candidates.map(candidate => {
//       return {
//         candidateId: candidate.candidateId,
//         candidateName: candidate.candidateName,
//         candidateAlias: candidate.candidateAlias,
//         description: candidate.description,
//         totalVotes: voteCounts[candidate.candidateId] || 0, // Assign 0 if no votes found
//       };
//     });
//     return res.status(HTTP.STATUS_OK).send(results);
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
//       .send({ message: "Unable to fetch election results" });
//   }
// };

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
      .send({ message: "Unable to get owned elections" });
  }
};
export const getAllElections = async (req: Request, res: Response) => {
  try {
    const elections = await Election.findAll({
      attributes: {
        exclude: ["societyOwnerId", "createdAt", "updatedAt"],
      },
    });
    return res.status(HTTP.STATUS_OK).send({ elections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch elections" });
  }
};

export const getSocietyElections = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  try {
    const societyElections = await VoterSociety.findAll({
      where: { voterId: voterId },
      include: [
        {
          model: Society,
          include: [
            {
              model: Election,
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

    return res.status(HTTP.STATUS_OK).send({ societyElections });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to fetch society elections" });
  }
};
