import { Request, Response } from "express";
import {
  Society,
  VoterSociety,
  SocietySubject,
  FileStorage,
  Election,
  SocietyTeamMembers,
} from "../models/index.js";
import {
  isInSociety,
  doesSocietyExist,
  notInSociety,
  notNameUnique,
  notSocietyExist,
  isSocietyOwner,
} from "../utils/utils.js";
import * as HTTP from "../utils/magicNumbers.js";
import { v4 as uuid } from "uuid";
import { FileRequest } from "../middleware/jwt.middleware.js";
import { Sequelize } from "sequelize";

interface Society {
  societyId: number;
  name: string;
  description: string;

  societySubject?: {
    name: string;
  };
  subjectId?: number;
  SocietyPicture?: {
    path: string;
  };
}

export const createSociety = async (req: Request, res: Response) => {
  try {
    const { societyId, voterId, name, description, subjectId } = req.body;

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

    const newSociety = await Society.create({
      societyId: societyId,
      societyOwnerId: voterId,
      name: name,
      description: description,
      subjectId: subjectId,
    } as any);

    return res.status(HTTP.STATUS_CREATED).send({
      message: `${name} has been created`,
      newSociety: newSociety.societyId,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to create society" });
  }
};

export const editSociety = async (req: Request, res: Response) => {
  const id = parseInt(req.params.societyId);
  try {
    await Society.update(
      {
        name: req.body?.name,
        description: req.body?.description,
        subjectId: parseInt(req.body?.subjectId),
      },
      {
        where: {
          societyId: id,
        },
      }
    );
    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "Society has been edited" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to edit society" });
  }
};

//TODO: implement a society owner so only they can delete their create society
export const deleteSociety = async (req: Request, res: Response) => {
  try {
    const societyId = parseInt(req.params.societyId);
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
  const societyId = parseInt(req.params.societyId);
  const voterId = parseInt(req.params.voterId);

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
  const societyId = parseInt(req.params.societyId);
  const voterId = parseInt(req.params.voterId);
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
    const unmodifiedSocieties = await Society.findAll({
      attributes: {
        exclude: [
          "subjectId",
          "societyPicture",
          "societyOwnerId",
          "createdAt",
          "updatedAt",
        ],
      },
      include: [
        {
          model: FileStorage,
          attributes: ["path"],
          as: "SocietyPicture",
        },
        {
          model: SocietySubject,
          attributes: ["name"],
          where: {
            subjectId: Sequelize.col("society.subjectId"),
          },
        },
      ],
    });

    const societies = unmodifiedSocieties.map(society => {
      const typedSociety = society as Society & {
        SocietyPicture?: { path: string };
        SocietySubject?: { name: string };
      };
      return {
        societyId: typedSociety.societyId,
        name: typedSociety.name,
        description: typedSociety.description,
        societyPicture: typedSociety.SocietyPicture?.path,
        societySubject: typedSociety.SocietySubject?.name,
      };
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
    const unmodifiedSocieties = await Society.findAll({
      attributes: {
        exclude: ["societyOwnerId", "createdAt", "updatedAt"],
      },
      where: {
        societyOwnerId: voterId,
      },
      include: [
        {
          model: FileStorage,
          attributes: ["path"],
          as: "SocietyPicture",
        },
        {
          model: SocietySubject,
          attributes: ["name"],
          where: {
            subjectId: Sequelize.col("society.subjectId"),
          },
        },
      ],
    });

    const societies = unmodifiedSocieties.map(society => {
      const typedSociety = society as Society & {
        SocietyPicture?: { path: string };
        SocietySubject?: { name: string };
      };

      return {
        societyId: typedSociety.societyId,
        name: typedSociety.name,
        description: typedSociety.description,
        subjectId: typedSociety.subjectId,
        societyPicture: typedSociety.SocietyPicture?.path,
        societySubject: typedSociety.SocietySubject?.name,
      };
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
    const societies = await VoterSociety.findAll({
      where: { voterId: voterId },
      attributes: {
        exclude: [
          "societyId",
          "voterSocietyId",
          "voterId",
          "createdAt",
          "updatedAt",
        ],
      },
      include: [
        {
          model: Society,
          attributes: {
            exclude: [
              "societyOwnerId",
              "societyPictureId",
              "subjectId",
              "createdAt",
              "updatedAt",
            ],
          },
          include: [
            {
              model: SocietySubject,
              attributes: ["name"],
              where: {
                subjectId: Sequelize.col("society.subjectId"),
              },
            },
            {
              model: FileStorage,
              attributes: ["path"],
              as: "SocietyPicture",
            },
          ],
        },
      ],
    });

    return res.status(HTTP.STATUS_OK).send({ societies });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get societies" });
  }
};

export const getSocietyById = async (req: Request, res: Response) => {
  const id = req.params.societyId;
  try {
    const society = await Society.findOne({
      where: {
        societyId: id,
      },
      attributes: {
        exclude: ["societyOwnerId", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: SocietySubject,
          attributes: ["name"],
          where: {
            subjectId: Sequelize.col("society.subjectId"),
          },
        },
      ],
    });

    const totalMembers = await VoterSociety.count({
      where: {
        societyId: id,
      },
    });

    const totalElections = await Election.count({
      where: {
        societyId: id,
      },
    });

    const totalTeamMembers = await SocietyTeamMembers.count({
      where: {
        societyId: id,
      },
    });

    const response = {
      society,
      totalMembers,
      totalElections,
      totalTeamMembers,
    };

    return res.status(HTTP.STATUS_OK).send({ response });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get society" });
  }
};

export const getSocietySubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await SocietySubject.findAll({
      attributes: ["subjectId", "name"],
    });
    return res.status(HTTP.STATUS_OK).send({ subjects });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get society subjects" });
  }
};

export const getSocietyPicture = async (req: Request, res: Response) => {
  const societyId = parseInt(req.params.societyId);
  try {
    const society = await Society.findByPk(societyId);
    if (!society) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This society does not exist" });
    }

    const societyPicture = await society.getSocietyPicture();
    let path;
    if (societyPicture) {
      path = societyPicture.path;
    } else {
      path = "client/assets/bg.jpg";
    }

    return res.status(HTTP.STATUS_OK).send({ societyPicture: path });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get society picture" });
  }
};

export const uploadSocietyPicture = async (req: FileRequest, res: Response) => {
  const societyId = req.params.societyId;
  try {
    if (!req.files?.file) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Please upload a file" });
    }

    const society = await Society.findOne({
      where: {
        societyId: societyId,
      },
    });
    if (!society) {
      return res
        .status(HTTP.STATUS_NOT_FOUND)
        .send({ message: "This society does not exist" });
    }

    const societyPicture = await society.getSocietyPicture();
    if (societyPicture) {
      societyPicture.destroy();
    }

    const originalName = req.files.file.name;
    const originalExtension = originalName.substring(
      originalName.lastIndexOf(".")
    );

    const path = `client/assets/uploaded/${uuid()}${originalExtension}`;
    await req.files.file.mv(path);

    const fileToStore = {
      name: "society_picture",
      path: path,
    };
    await society.createSocietyPicture(fileToStore as any);

    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "Society picture uploaded" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to upload society picture" });
  }
};

export const societyOwner = async (req: Request, res: Response) => {
  try {
    const societyId = parseInt(req.params.societyId);
    const voterId = parseInt(req.params.voterId);

    const owner = await isSocietyOwner(societyId, voterId);

    if (!owner) {
      return res.status(HTTP.STATUS_OK).send(true);
    } else {
      return res.status(HTTP.STATUS_BAD_REQUEST).send(false);
    }
  } catch (error) {
    console.log(error);
  }
};

export const societyMember = async (req: Request, res: Response) => {
  try {
    const societyId = parseInt(req.params.societyId);
    const voterId = parseInt(req.params.voterId);

    const inSociety = await isInSociety(societyId, voterId);

    if (!inSociety) {
      return res.status(HTTP.STATUS_OK).send(true);
    } else {
      return res.status(HTTP.STATUS_BAD_REQUEST).send(false);
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to check if in society" });
  }
};

export const createSocietyTeamMember = async (req: Request, res: Response) => {
  const societyId = parseInt(req.params.societyId);
  try {
    const member = await SocietyTeamMembers.create({
      societyId: societyId,
      name: req.body.name,
      alias: req.body.alias,
      role: req.body.role,
    });

    return res
      .status(HTTP.STATUS_CREATED)
      .send({ message: "Member created", member: member.memberId });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to create society member" });
  }
};

export const getSocietyMembers = async (req: Request, res: Response) => {
  const societyId = parseInt(req.params.societyId);
  try {
    const members = await SocietyTeamMembers.findAll({
      where: {
        societyId: societyId,
      },
      attributes: {
        exclude: ["societyId", "createdAt", "updatedAt"],
      },
      include: [
        {
          model: FileStorage,
          attributes: ["path"],
          as: "MemberPicture",
        },
      ],
    });

    return res.status(HTTP.STATUS_OK).send({ members });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get society members" });
  }
};

export const getSocietyMemberPicture = async (req: Request, res: Response) => {
  const memberId = parseInt(req.params.memberId);
  try {
    const members = await SocietyTeamMembers.findByPk(memberId);
    if (!members) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This member does not exist" });
    }

    const memberPicture = await members.getMemberPicture();
    let path;
    if (memberPicture) {
      path = memberPicture.path;
    } else {
      path = "client/assets/defaultMemberImage.jpeg";
    }

    return res.status(HTTP.STATUS_OK).send({ memberPicture: path });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to get member picture" });
  }
};

export const uploadSocietyMemberPicture = async (
  req: FileRequest,
  res: Response
) => {
  const memberId = parseInt(req.params.memberId);
  try {
    if (!req.files?.file) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "Please upload a file" });
    }

    const member = await SocietyTeamMembers.findOne({
      where: {
        memberId: memberId,
      },
    });
    if (!member) {
      return res
        .status(HTTP.STATUS_NOT_FOUND)
        .send({ message: "This member does not exist" });
    }

    const memberPicture = await member.getMemberPicture();
    if (memberPicture) {
      memberPicture.destroy();
    }

    const originalName = req.files.file.name;
    const originalExtension = originalName.substring(
      originalName.lastIndexOf(".")
    );

    const path = `client/assets/uploaded/${uuid()}${originalExtension}`;
    await req.files.file.mv(path);

    const fileToStore = {
      name: "member_picture",
      path: path,
    };
    await member.createMemberPicture(fileToStore as any);

    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "Member picture uploaded" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to upload member picture" });
  }
};

export const deleteSocietyMember = async (req: Request, res: Response) => {
  const memberId = parseInt(req.params.memberId);
  try {
    const member = await SocietyTeamMembers.findByPk(memberId);
    if (!member) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This member does not exist" });
    }

    const hasMemberBeenDeleted =
      (await SocietyTeamMembers.destroy({
        where: {
          memberId: memberId,
        },
      })) === 1;
    if (hasMemberBeenDeleted) {
      return res
        .status(HTTP.STATUS_OK)
        .send({ message: "Member has been deleted" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to delete member" });
  }
};

export const updateSocietyMember = async (req: Request, res: Response) => {
  const memberId = parseInt(req.params.memberId);
  try {
    const member = await SocietyTeamMembers.findByPk(memberId);
    if (!member) {
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This member does not exist" });
    }

    await SocietyTeamMembers.update(
      {
        name: req.body?.name,
        alias: req.body?.alias,
        role: req.body?.role,
      },
      {
        where: {
          memberId: memberId,
        },
      }
    );
    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "Member has been updated" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to update member" });
  }
};
