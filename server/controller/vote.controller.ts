import {
  doesElectionExist,
  isCandidateInElection,
  isElectionOpen,
  isNewVote,
} from "../utils/utils.js";
import { Vote } from "../models/index.js";
import * as HTTP from "../utils/magicNumbers.js";

import { Request, Response } from "express";

export const castVote = async (req: Request, res: Response) => {
  const { voterId, candidateId, electionId } = req.body;
  try {
    if (await doesElectionExist(electionId)) {
      if (await isElectionOpen(electionId)) {
        if (await isCandidateInElection(electionId, candidateId)) {
          if (await isNewVote(voterId, electionId)) {
            await Vote.create({ voterId, candidateId, electionId });
            return res
              .status(HTTP.STATUS_CREATED)
              .send({ message: "You have successfully casted your vote" });
          }
          return res
            .status(HTTP.STATUS_BAD_REQUEST)
            .send({ message: "You can not vote more than once per election" });
        }
        return res.status(HTTP.STATUS_BAD_REQUEST).send({
          message: "The candidate you are voting for is not in this election",
        });
      }
      return res
        .status(HTTP.STATUS_BAD_REQUEST)
        .send({ message: "This election is not open voting" });
    }
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "This election does not exist" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ message: "Unable to cast vote" });
  }
};
