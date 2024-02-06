import { Request, Response } from "express";
import { FileStorage, Society, VoterSociety } from "../models/index.js";
import {
  isInSociety,
  doesSocietyExist,
  notInSociety,
  notNameUnique,
  notSocietyExist,
} from "../utils/utils.js";
import * as HTTP from "../utils/magicNumbers.js";
import { v4 as uuid } from "uuid";

export const createSociety = async (req: Request, res: Response) => {
  try {
    const { societyId, voterId, name, description } = req.body;

    if (!name || !description) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Missing required fields" });
    }

    if (await notNameUnique(name)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "A society with this name has already been created" });
    }

    await Society.create({
      societyId: societyId,
      societyOwnerId: voterId,
      name: name,
      description: description,
      societyPicture: req?.societyPicture,
    });

    return res.status(HTTP.STATUS_CREATED).send({
      message: `${name} has been created`,
    });
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
    const societyId = req.params.societyId;
    if (await doesSocietyExist(societyId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This society does not exist" });
    }
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
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to delete society" });
  }
};

export const joinSociety = async (req: Request, res: Response) => {
  const { voterId, societyId } = req.body;

  const societyName = await Society.findOne({
    where: { societyId: societyId },
  });

  try {
    if (await (societyId === null)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Please select a society" });
    }
    if (await notSocietyExist(societyId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This society does not exist" });
    }
    if (await notInSociety(societyId, voterId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: `You are already a part of ${societyName?.name}` });
    }
    await VoterSociety.create({ societyId, voterId });

    return res
      .status(HTTP.STATUS_OK)
      .send({ message: `You have joined ${societyName?.name}` });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to join society" });
  }
};

export const leaveSociety = async (req: Request, res: Response) => {
  const societyId = req.params.societyId;
  const voterId = req.params.voterId;
  try {
    if (await doesSocietyExist(societyId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This society does not exist" });
    }

    if (await isInSociety(societyId, voterId)) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "You are not a part of this society" });
    }

    const societies =
      (await VoterSociety.destroy({
        where: {
          societyId: societyId,
          voterId: voterId,
        },
      })) === 1;
    return res.status(HTTP.STATUS_OK).send({
      message: "You have left this society",
      societies,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to leave society" });
  }
};

export const getAllSocieties = async (req: Request, res: Response) => {
  try {
    const societies = await Society.findAll({
      attributes: {
        exclude: ["societyOwnerId", "createdAt", "updatedAt"],
      },
    });
    return res.status(HTTP.STATUS_OK).send({ societies });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get societies" });
  }
};
export const getOwnedSocieties = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  try {
    const societies = await Society.findAll({
      attributes: {
        exclude: ["societyOwnerId", "createdAt", "updatedAt"],
      },
      where: {
        societyOwnerId: voterId,
      },
    });
    return res.status(HTTP.STATUS_OK).send({ societies });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get societies" });
  }
};

export const getJoinedSocieties = async (req: Request, res: Response) => {
  const voterId = req.params.voterId;
  try {
    const societies = await Society.findAll({
      include: [
        {
          model: VoterSociety,
          attributes: [],
          where: {
            voterId: voterId,
          },
        },
      ],

      attributes: {
        exclude: ["societyOwnerId", "createdAt", "updatedAt"],
      },
    });
    return res.status(HTTP.STATUS_OK).send({ societies });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get societies" });
  }
};

export const getSocietyById = async (req: Request, res: Response) => {};
export const getSocietyPicture = async (req, res) => {
  // const societyId = parseInt(req.params.uid, 10);
  // if (!societyId) {
  //   return res.status(HTTP.STATUS_BAD_REQUEST).send();
  // }
  //
  // const society = await Society.findByPk(societyId);
  // if (!society) {
  //   return res.status(HTTP.STATUS_NOT_FOUND).send();
  // }
  // const societyPicture = await society.getSocietyPicture();
  // let path;
  // if (societyPicture) {
  //   path = societyPicture.path;
  // } else {
  //   path = "assets/default/society_picture.png";
  // }
  // res.status(200).sendFile(path, {
  //   root: process.cwd(),
  //   headers: { "Content-Disposition": "inline", "Content-Type": "image/png" },
  // });
};

// TOOD: Change the front end so that the file upload for pictures is done from an edit society page rather than the
// creation of the society-get the societyId as a param.
export const uploadSocietyPicture = async (req: Request, res: Response) => {
  // to be sent from frontend: file, societyId
  if (!req?.file) {
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "No file is being uploaded" });
  }

  const society = await Society.findByPk(req.societyId);
  if (!society) {
    return res
      .status(HTTP.STATUS_NOT_FOUND)
      .send({ message: "No society found" });
  }

  const path = `assets/uploaded/${uuid()}`;

  // TODO: test
  const file = await FileStorage.create({
    fileId: 0,
    name: "societyPicture",
    path: path,
  });
  if (!file) {
    return res
      .status(HTTP.STATUS_NOT_FOUND)
      .send({ message: "File not found" });
  }

  await Society.update(
    { societyPicture: file.fileId },
    {
      where: {
        societyId: req.societyId,
      },
    }
  );

  // const picture = await society.getSocietyPicture();
  // if (picture) {
  //   picture.destroy();
  // }

  return res
    .status(HTTP.STATUS_OK)
    .send({ message: "File has been uploaded", path: path });
};
