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

  return existingSociety !== null;
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

  return isOwner !== null;
};

export const doesElectionExist = async (
  electionId: number
): Promise<boolean> => {
  const existingElection = await Election.findOne({
    where: {
      electionId: electionId,
    },
  });

  return existingElection !== null;
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

  return newCandidate === null;
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
      voteId: voterId,
      electionId: electionId,
    },
  });

  return newVote === null;
};

export const kAnonymity = async electionId => {
  const anonymous = await Vote.findAll({
    where: {
      electionId: electionId,
    },
    include: {},
  });
};
