import { Request, Response } from "express";
import { Society } from "../models/index.js";
import { VoterSociety } from "../models/index.js";
import { isInSociety, doesSocietyExist, isNameUnique } from "../utils/utils.js";
import * as HTTP from "../utils/magicNumbers.js";

//TODO: Create a check to see if a society has already been created
export const createSociety = async (req: Request, res: Response) => {
  try {
    const { societyId, voterId, name, description } = req.body;

    if (!name || !description) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Missing required fields" });
    }

    if (await isNameUnique(name)) {
      await Society.create({
        societyId: societyId,
        societyOwnerId: voterId,
        name: name,
        description: description,
      });
      return res
        .status(HTTP.STATUS_CREATED)
        .send({ message: `${name} has been created` });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "A society with this name has already been created" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to create society" });
  }
};

//TODO: implement a society owner so only they can delete their create society
export const deleteSociety = async (req: Request, res: Response) => {
  try {
    const { societyId } = req.body;
    if (await doesSocietyExist(societyId)) {
      const hasSocietyBeenDeleted =
        (await Society.destroy({
          where: {
            societyId: societyId,
          },
        })) === 1;
      if (hasSocietyBeenDeleted) {
        return res
          .status(HTTP.STATUS_OK)
          .send({ message: "Society has been deleted" });
      }
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "This society does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to delete society" });
  }
};

export const joinSociety = async (req: Request, res: Response) => {
  const { voterId, societyId } = req.body;
  try {
    if (await doesSocietyExist(societyId)) {
      if (await isInSociety(societyId, voterId)) {
        return res
          .status(HTTP.STATUS_BAD_REQUEST)
          .send({ message: "You are already apart of this society" });
      }
      await VoterSociety.create({ societyId, voterId });
      const societyName = await Society.findOne({
        where: { societyId: societyId },
      });
      return res
        .status(HTTP.STATUS_OK)
        .send({ message: `You have joined ${societyName}` });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "This society does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to join society" });
  }
};

export const leaveSociety = async (req: Request, res: Response) => {
  const { voterId, societyId } = req.body;
  try {
    if (await doesSocietyExist(societyId)) {
      if (await isInSociety(societyId, voterId)) {
        const leave =
          (await VoterSociety.destroy({
            where: {
              societyId: societyId,
              voterId: voterId,
            },
          })) === 1;
        if (leave) {
          return res
            .status(HTTP.STATUS_OK)
            .send({ message: "You have left this society" });
        }
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "You are not a part of this society" });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "This society does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to leave society" });
  }
};

export const getSocieties = async (req: Request, res: Response) => {};

export const getSocietyById = async (req: Request, res: Response) => {};
