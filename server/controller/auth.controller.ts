import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthConfig } from "../configs/auth.config.js";
import { Voter } from "../models/index.js";

export const signUp = async (req, res) => {
  if (req.body.password1 != req.body.password2) {
    return res.status(400).send({ message: "Password mismatch" });
  }
  const hash = await bcrypt.hash(req.body.password1, AuthConfig.SALT);

  try {
    const newVoterInstance = {
      voterId: req.body.voterId,
      email: req.body.email,
      password: hash,
    };
    // await Voter.create({
    //   voterId: req.body.voterId,
    //   email: req.body.email,
    //   password: hash,
    // });
    return res.status(200).send(newVoterInstance);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const signIn = async (req, res) => {
  const voter = await Voter.findOne({
    where: {
      voterId: req.body.voterId,
      email: req.body.email,
    },
  });

  const auth = await bcrypt.compare(req.body.password, voter?.password ?? "");
  if (!auth || !voter) {
    return res.status(401).send({ message: "Credentials do not match" });
  }

  const token = jwt.sign(
    { id: voter.voterId, admin: voter.admin },
    AuthConfig.JWT_SECRET_KEY,
    {
      expiresIn: AuthConfig.JWT_TOKEN_EXPIRY,
    }
  );

  return res.status(200).send({
    id: voter.voterId,
    token,
  });
};
