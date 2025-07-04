import { Society } from "../models/society.model.js";
import { VoterSociety } from "../models/voter-society.model.js";
import { Op } from "sequelize";
import { Election } from "../models/election.model.js";
import { ElectionCandidates } from "../models/election-candidates.model.js";
import { Vote } from "../models/vote.model.js";

export const doesSocietyExist = async (societyId: number): Promise<boolean> => {
  const existingSociety = await Society.findOne({
    where: {
      societyId: societyId,
    },
  });

  return existingSociety === null;
};
export const notSocietyExist = async (societyId: number): Promise<boolean> => {
  const existingSociety = await Society.findOne({
    where: {
      societyId: societyId,
    },
  });

  return existingSociety === null;
};

export const isInSociety = async (
  societyId: number,
  voterId: number
): Promise<boolean> => {
  const inSociety = await VoterSociety.findOne({
    where: {
      societyId: societyId,
      voterId: voterId,
    },
  });

  return inSociety === null;
};

export const notInSociety = async (
  societyId: number,
  voterId: number
): Promise<boolean> => {
  const inSociety = await VoterSociety.findOne({
    where: {
      societyId: societyId,
      voterId: voterId,
    },
  });

  return inSociety !== null;
};

export const isNameUnique = async (name: string): Promise<boolean> => {
  const uniqueName = await Society.findOne({
    where: {
      name: {
        [Op.like]: name,
      },
    },
  });

  return uniqueName === null;
};

export const notNameUnique = async (name: string): Promise<boolean> => {
  const uniqueName = await Society.findOne({
    where: {
      name: {
        [Op.like]: name,
      },
    },
  });

  return uniqueName !== null;
};

export const isSocietyOwner = async (
  societyId: number,
  voterId: number
): Promise<boolean> => {
  const isOwner = await Society.findOne({
    where: {
      societyId: societyId,
      societyOwnerId: voterId,
    },
  });

  return isOwner === null;
};

export const doesElectionExist = async (
  electionId: number
): Promise<boolean> => {
  const existingElection = await Election.findOne({
    where: {
      electionId: electionId,
    },
  });

  return existingElection === null;
};

export const isElectionOpen = async (electionId: number): Promise<boolean> => {
  const open = await Election.findOne({
    where: {
      electionId: electionId,
      electionStatus: 1,
    },
  });

  return open === null;
};
export const isElectionClose = async (electionId: number): Promise<boolean> => {
  const open = await Election.findOne({
    where: {
      electionId: electionId,
      electionStatus: 1,
    },
  });

  return open !== null;
};

export const isNewCandidate = async (
  electionId: number,
  candidateName: string,
  candidateAlias: string
): Promise<boolean> => {
  const newCandidate = await ElectionCandidates.findOne({
    where: {
      electionId: electionId,
      candidateName: {
        [Op.like]: candidateName,
      },
      candidateAlias: {
        [Op.like]: candidateAlias,
      },
    },
  });

  return newCandidate !== null;
};

export const isCandidateInElection = async (
  electionId: number,
  candidateId: number
): Promise<boolean> => {
  const validCandidate = await ElectionCandidates.findOne({
    where: {
      electionId: electionId,
      candidateId: candidateId,
    },
  });

  return validCandidate === null;
};

export const isNewVote = async (
  voterId: number,
  electionId: number
): Promise<boolean> => {
  const newVote = await Vote.findOne({
    where: {
      voterId: voterId,
      electionId: electionId,
    },
  });

  return newVote !== null;
};

export function combineDateTime(dateString: string, timeString: string): Date {
  // Parse the date string to get a Date object
  const date = new Date(dateString);

  // Extract hours and minutes from the time string
  const timeParts = timeString.split(":");
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  // Set hours and minutes on the date object
  date.setHours(hours, minutes);

  return date;
}
