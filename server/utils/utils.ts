import { Society } from "../models/society.model.js";
import { VoterSociety } from "../models/voter-society.model.js";

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

export const isSocietyOwner = async (societyId, voterId): Promise<boolean> => {
  const isOwner = await Society.findOne({
    where: {
      societyId: societyId,
      societyOwnerId: voterId,
    },
  });

  return isOwner !== null;
};
