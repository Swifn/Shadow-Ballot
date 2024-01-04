import { Router } from "express";
import { signIn, signUp } from "../controller/auth.controller.js";
import { ensurePayload } from "../middleware/payload.middleware.js";

export const authRouter = Router();

authRouter.post(
  "/sign-up",
  [ensurePayload(["email", "password1", "password2"])],
  signUp
);

authRouter.post("/sign-in", [ensurePayload(["email", "password"])], signIn);
