import { Election, Society, Voter } from "../models/index.js";
import { ValidatedRequest } from "../middleware/jwt.middleware.js";
import { Response, Request } from "express";
import * as HTTP from "../utils/magicNumbers.js";
export const getVoter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const voter = await Voter.findByPk(id, {
    attributes: {
      exclude: ["email", "password", "createdAt", "updatedAt"],
    },
    include: [
      {
        model: Society,
        attributes: { exclude: ["societyOwnerId", "createdAt", "updatedAt"] },
      },
      {
        model: Election,
        attributes: {
          exclude: ["societyId", "societyOwnerId", "createdAt", "updatedAt"],
        },
      },
    ],
  });
  if (!voter) {
    return res.status(HTTP.STATUS_NOT_FOUND).send({ error: "No voter found" });
  }

  return res
    .status(HTTP.STATUS_OK)
    .send({ ...voter.dataValues, admin: req.admin });
};
