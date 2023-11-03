import { Helmet } from "react-helmet";
import { Config } from "../../config";
import { Link } from "react-router-dom";
import { Routes } from "../index";
import styles from "./style.module.scss";
import { FormEvent, useRef, useState } from "react";
import { Button, TextInput } from "@carbon/react";

export const SignIn = () => {
  const submit = async (event: FormEvent) => {
    event.preventDefault();
  };

  return (
    <>
      <Helmet>
        <title>Sign In {Config.APP.NAME}</title>
      </Helmet>
      <h2>Sign In</h2>
      <p className="logInHint">
        Dont have an account yet? {""}
        <Link to={Routes.AUTH_SIGN_UP()}>Sign up instead</Link>
      </p>
      <form className={styles.form} onSubmit={submit} /**ref={form}**/>
        <TextInput
          id="sign-in__email"
          labelText="Email"
          pattern={Config.ORG.EMAIL_REGEX.source}
          placeholder={Config.ORG.EMAIL_PLACEHOLDER}
          name="email"
          required
        />
        <TextInput.PasswordInput
          id="sign-in__password1"
          labelText="Password"
          name="password"
          required
        />
        <Button>Sign In</Button>
      </form>
    </>
  );
};
