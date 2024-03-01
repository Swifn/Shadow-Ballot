import { Request, Response } from "express";
import {
  Election,
  ElectionCandidates,
  FileStorage,
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
  combineDateTime,
} from "../utils/utils.js";
import * as HTTP from "../utils/magicNumbers.js";
import cron from "node-cron";
import { Op } from "sequelize";
import { isPast, isFuture } from "date-fns";
import { FileRequest } from "../middleware/jwt.middleware.js";
import { v4 as uuid } from "uuid";
import { broadcastMessage } from "../main.js";

interface Election {
  electionId: number;
  name: string;
  description: string;
  ElectionPicture?: {
    path: string;
  };
}

cron.schedule("* * * * *", async () => {
  try {
    console.log("Checking for elections to close...");

    const elections = await Election.findAll({
      where: {
        end: {
          [Op.lte]: new Date(), // Find elections that should have ended by now.
        },

        electionStatus: true,
      },
    });

    // Loop through the elections and close them if they have ended.
    for (const election of elections) {
      // Check if the election has ended and is still open.
      if (isPast(election.end) && election.electionStatus) {
        // Use date-fns to check if the endTime is in the past.
        await election.update({ electionStatus: false });
        broadcastMessage(`Election ${election.name} has ended`);
      }
    }
  } catch (error) {
    console.error("Error closing elections:", error);
  }

  try {
    console.log("Checking for elections to open...");

    const elections = await Election.findAll({
      where: {
        start: {
          [Op.lte]: new Date(),
        },
        electionStatus: false,
      },
    });

    for (const election of elections) {
      if (
        isPast(election.start) &&
        isFuture(election.end) &&
        !election.electionStatus
      ) {
        await election.update({ electionStatus: true });
        broadcastMessage(`Election ${election.name} has opened`);
      }
    }
  } catch (error) {
    console.error("Error closing elections:", error);
  }
});
export const createElection = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      societyId,
      voterId,
      kValue,
      endDate,
      endTime,
      startDate,
      startTime,
    } = req.body;

    const end = combineDateTime(endDate, endTime);
    const start = combineDateTime(startDate, startTime);

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
      electionStatus: false,
      kValue: kValue,
      start: start,
      end: end,
    });

    return res.status(HTTP.STATUS_CREATED).send({
      message: `${name} election has been created`,
      newElection: newElection.electionId,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to create election" });
  }
};

export const addCandidate = async (req: Request, res: Response) => {
  const electionId = parseInt(req.params.electionId);
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

    const newCandidate = await ElectionCandidates.create({
      electionId: electionId,
      candidateName: candidateName,
      candidateAlias: candidateAlias,
      description: description,
    });
    return res.status(HTTP.STATUS_CREATED).send({
      message: "You have successfully added this candidate to this election",
      candidate: newCandidate.candidateId,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to add candidate to election" });
  }
};

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

//TODO: Add a feature where the election can only be opened once to stop changes?
export const openElection = async (req: Request, res: Response) => {
  const electionId = parseInt(req.params.electionId);

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
  const electionId = parseInt(req.params.electionId);

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

// export const getFinishedElections = async (req: Request, res: Response) => {
//   try {
//     const elections = await Election.findAll({
//       where: {
//         end: {
//           [Op.lte]: new Date(),
//         },
//         electionStatus: false,
//       },
//       attributes: {
//         exclude: [
//           "electionStatus",
//           "societyOwnerId",
//           "kValue",
//           "start",
//           "createdAt",
//           "updatedAt",
//         ],
//       },
//     });
//
//     return res.status(HTTP.STATUS_OK).send({ elections });
//   } catch (error) {
//     console.error("Error closing elections:", error);
//   }
// };

export const getFinishedVotes = async (req: Request, res: Response) => {
  const electionId = parseInt(req.params.electionId);
  try {
    const candidates = await ElectionCandidates.findAll({
      where: {
        electionId: electionId,
      },
      attributes: ["candidateId", "candidateName", "candidateAlias"],
    });

    const votes = await Vote.findAll({
      where: { electionId },
      attributes: ["candidateId"],
    });

    const totalVotes = votes.length;
    const voteCounts = {};

    for (let i = 0; i < totalVotes; i++) {
      const vote = votes[i];
      if (!voteCounts[vote.candidateId]) {
        voteCounts[vote.candidateId] = 0;
      }
      voteCounts[vote.candidateId]++;
    }

    const results = candidates.map(candidate => {
      return {
        candidateId: candidate.candidateId,
        candidateName: candidate.candidateName,
        candidateAlias: candidate.candidateAlias,
        votes: voteCounts[candidate.candidateId] || 0,
      };
    });

    const sortedResults = results.sort((a, b) => b.votes - a.votes);
    const winner = sortedResults[0];

    return res.status(HTTP.STATUS_OK).send({ winner });
  } catch (error) {
    console.log(error);
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
    const unmodifiedElections = await Election.findAll({
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
    });

    const elections = unmodifiedElections.map(election => {
      const typedElection = election as Election & {
        ElectionPicture?: { path: string };
      };

      return {
        electionId: typedElection.electionId,
        name: typedElection.name,
        description: typedElection.description,
        electionPicture: typedElection.ElectionPicture?.path,
      };
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

export const uploadElectionPicture = async (
  req: FileRequest,
  res: Response
) => {
  const electionId = req.params.electionId;
  try {
    if (!req.files?.file) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Please upload a file" });
    }

    const election = await Election.findOne({
      where: {
        electionId: electionId,
      },
    });
    if (!election) {
      return res
        .status(HTTP.STATUS_NOT_FOUND)
        .send({ message: "This election does not exist" });
    }

    const electionPicture = await election.getElectionPicture();
    if (electionPicture) {
      electionPicture.destroy();
    }

    const originalName = req.files.file.name;
    const originalExtension = originalName.substring(
      originalName.lastIndexOf(".")
    );

    const path = `client/assets/uploaded/${uuid()}${originalExtension}`;
    await req.files.file.mv(path);

    const fileToStore = {
      name: "election_picture",
      path: path,
    };
    await election.createElectionPicture(fileToStore as any);

    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "Election picture uploaded" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to upload Election picture" });
  }
};

export const getElectionPicture = async (req: Request, res: Response) => {
  const electionId = req.params.electionId;
  try {
    const election = await Election.findByPk(electionId);
    if (!election) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This society does not exist" });
    }

    const electionPicture = await election.getElectionPicture();
    let path;
    if (electionPicture) {
      path = electionPicture.path;
    } else {
      path = "client/assets/bg.jpg";
    }

    return res.status(HTTP.STATUS_OK).send({ electionPicture: path });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get election picture" });
  }
};

export const uploadElectionCandidatePicture = async (
  req: FileRequest,
  res: Response
) => {
  const candidateId = req.params.candidateId;
  try {
    if (!req.files?.file) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Please upload a file" });
    }

    const election = await ElectionCandidates.findOne({
      where: {
        candidateId: candidateId,
      },
    });
    if (!election) {
      return res
        .status(HTTP.STATUS_NOT_FOUND)
        .send({ message: "This election does not exist" });
    }

    const electionPicture = await election.getElectionCandidatePicture();
    if (electionPicture) {
      electionPicture.destroy();
    }

    const originalName = req.files.file.name;
    const originalExtension = originalName.substring(
      originalName.lastIndexOf(".")
    );

    const path = `client/assets/uploaded/${uuid()}${originalExtension}`;
    await req.files.file.mv(path);

    const fileToStore = {
      name: "candidate_picture",
      path: path,
    };
    await election.createElectionCandidatePicture(fileToStore as any);

    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "Candidate picture uploaded" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to upload candidate picture" });
  }
};

// export const getElectionPicture = async (req: Request, res: Response) => {
//   const electionId = req.params.electionId;
//   try {
//     const election = await Election.findByPk(electionId);
//     if (!election) {
//       return res
//         .status(HTTP.STATUS_BAD_REQUEST)
//         .send({ message: "This society does not exist" });
//     }
//
//     const electionPicture = await election.getElectionPicture();
//     let path;
//     if (electionPicture) {
//       path = electionPicture.path;
//     } else {
//       path = "client/assets/bg.jpg";
//     }
//
//     return res.status(HTTP.STATUS_OK).send({ electionPicture: path });
//   } catch (error) {
//     console.log(error);
//     return res
//       .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
//       .send({ message: "Unable to get election picture" });
//   }
// };
