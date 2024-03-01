import { Router } from "express";
import { signIn, signUp } from "../controller/auth.controller.js";

export const authRouter = Router();

authRouter.post("/sign-up", signUp);

authRouter.post("/sign-in", signIn);
