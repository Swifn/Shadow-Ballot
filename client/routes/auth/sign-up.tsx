import { Helmet } from "react-helmet";
import { Config } from "../../config";
import { Link } from "react-router-dom";
import { Routes } from "../index";
import { Button, TextInput } from "@carbon/react";

export const SignUp = () => {
  return (
    <>
      <Helmet>
        <title>Get started with {Config.APP.NAME}</title>
      </Helmet>
      <h2>Sign up</h2>
      <p className={"styles logInHint"}>
        Already have an account?
        <Link to={Routes.AUTH_SIGN_IN()}>Sign in instead</Link>
      </p>
      <form>
        <TextInput id="" labelText="" />
        <TextInput id="" labelText="" />
        <TextInput.PasswordInput />
        <TextInput.PasswordInput />
        <Button></Button>
      </form>
    </>
  );
};
