import { Helmet } from "react-helmet";
import { Config } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { Routes } from "../index";
import { PortInput } from "@carbon/icons-react";
import { Button, InlineNotification, Stack, TextInput } from "@carbon/react";
import React from "@carbon/react";
import { post } from "../../utils/fetch";
import styles from "./style.module.scss";
import { FormEvent, useRef, useState } from "react";

export const SignUp = () => {
  const navigate = useNavigate();
  const form = useRef<HTMLFormElement>(null);
  const passwords = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formEnabled, setFormEnabled] = useState(true);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormEnabled(false);

    const body = Object.fromEntries(
      new FormData(form.current ?? undefined).entries()
    );
    const response = await post("auth/sign-up", body);

    await setStateBasedOnResponse(response);
  };

  const setStateBasedOnResponse = async response => {
    const responseMessage = (await response.json()).message;
    if (response.ok) {
      setSuccess(responseMessage);
      console.log(success);
      setError(null);
      navigate(Routes.AUTH_SIGN_IN());
    } else {
      setSuccess(null);
      setError(responseMessage);
      console.log(error);
      setFormEnabled(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>Get started with {Config.APP.NAME}</title>
      </Helmet>
      <div className={styles.notification}>
        {success && <InlineNotification title={success} kind="success" />}
        {error && <InlineNotification title={error} />}
      </div>
      <h2>Sign up</h2>
      <p className={styles.logInHint}>
        Already have an account?{" "}
        <Link to={Routes.AUTH_SIGN_IN()}>Sign in instead</Link>
      </p>
      <form
        aria-label="Sign in form"
        ref={form}
        className={styles.form}
        onSubmit={submit}
      >
        <TextInput
          id="sign-in__email"
          type="text"
          labelText="Email"
          name="email"
          placeholder={Config.ORG.EMAIL_PLACEHOLDER}
          pattern={Config.ORG.EMAIL_REGEX.source}
          invalid={error !== null}
        />
        <TextInput
          id="sign-in__password1"
          labelText="Password"
          type={"password"}
          name="password1"
          ref={passwords[0]}
          invalid={error !== null}
        />
        <TextInput
          id="sign-in__password2"
          labelText="Re-enter password"
          type={"password"}
          name="password2"
          ref={passwords[1]}
          invalid={error !== null}
        />

        <div className="submit">
          <Button
            renderIcon={PortInput}
            type="submit"
            disabled={!formEnabled}
            className={styles.button}
          >
            Submit
          </Button>
        </div>
      </form>
    </>
  );
};
