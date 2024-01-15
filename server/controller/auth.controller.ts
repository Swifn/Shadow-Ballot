import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthConfig } from "../configs/auth.config.js";
import { Voter } from "../models/index.js";
import * as HTTP from "../utils/magicNumbers.js";

//TODO: hash or encrypt voter email addresses in the database to prevent identities being dereferenced
// remove the REGEX?
export const signUp = async (req, res) => {
  const { email, password1, password2 } = req.body;
  if (password1 != password2) {
    return res
      .status(HTTP.STATUS_BAD_REQUEST)
      .send({ message: "Password mismatch" });
  }
  const hash = await bcrypt.hash(password1, AuthConfig.SALT);

  try {
    const newVoter = {
      email: email,
      password: hash,
    };
    await Voter.create(newVoter);
    return res
      .status(HTTP.STATUS_OK)
      .send({ message: "Sign up was successful" });
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP.STATUS_INTERNAL_SERVER_ERROR)
      .send({ error: "unable to create account" });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;
  const voter = await Voter.findOne({
    where: {
      email: email,
    },
  });

  const auth = await bcrypt.compare(password, voter?.password ?? "");
  if (!auth || !voter) {
    return res
      .status(HTTP.STATUS_UNAUTHORIZED)
      .send({ message: "Credentials do not match" });
  }

  const token = jwt.sign(
    { id: voter.voterId, admin: voter.admin },
    AuthConfig.JWT_SECRET_KEY,
    {
      expiresIn: AuthConfig.JWT_TOKEN_EXPIRY,
    }
  );

  return res.status(HTTP.STATUS_OK).send({
    id: voter.voterId,
    token,
  });
};
