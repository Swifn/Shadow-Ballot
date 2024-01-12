import { Request, Response } from "express";
import { Society } from "../models/society.model.js";
import { VoterSociety } from "../models/voter-society.model.js";
import { isInSociety, doesSocietyExist, isNameUnique } from "../utils/utils.js";

//TODO: Create a check to see if a society has already been created
export const createSociety = async (req: Request, res: Response) => {
  try {
    const { societyId, voterId, name, description } = req.body;

    if (!name || !description) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    if (await isNameUnique(name)) {
      await Society.create({
        societyId: societyId,
        societyOwnerId: voterId,
        name: name,
        description: description,
      });
      return res.status(201).send({ message: `${name} has been created` });
    }
    return res
      .status(400)
      .send({ error: "A society with this name has already been created" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to create society" });
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
        return res.status(201).send({ message: "Society has been deleted" });
      }
    }
    return res.status(404).send({ error: "This society does not exist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to delete society" });
  }
};

export const joinSociety = async (req: Request, res: Response) => {
  const { voterId, societyId } = req.body;
  try {
    if (await doesSocietyExist(societyId)) {
      if (await isInSociety(societyId, voterId)) {
        return res
          .status(400)
          .send({ error: "You are already apart of this society" });
      }
      await VoterSociety.create({ societyId, voterId });
      const societyName = await Society.findOne({
        where: { societyId: societyId },
      });
      return res
        .status(201)
        .send({ message: `You have joined ${societyName}` });
    }
    return res.status(400).send({ error: "This society does not exist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to join society" });
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
            .status(200)
            .send({ message: "You have left this society" });
        }
      }
      return res
        .status(400)
        .send({ error: "You are not a part of this society" });
    }
    return res.status(400).send({ error: "This society does not exist" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: "Unable to leave society" });
  }
};

export const getSocieties = async (req: Request, res: Response) => {};

export const getSocietyById = async (req: Request, res: Response) => {};
