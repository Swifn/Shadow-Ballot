import { Helmet } from "react-helmet";
import React, { FormEvent, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import { Config } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import { Routes } from "../index";
import styles from "./style.module.scss";
import { userState } from "../../state/user-state";
import { Button, InlineNotification, TextInput, Stack } from "@carbon/react";
import { get, post } from "../../utils/fetch";
import { PortInput } from "@carbon/icons-react";

export const SignIn = () => {
  const navigate = useNavigate();
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formEnabled, setFormEnabled] = useState(true);
  const setUser = useSetRecoilState(userState);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormEnabled(false);

    const body = Object.fromEntries(
      new FormData(form.current ?? undefined).entries()
    );
    const response = await post("auth/sign-in", body);
    if (!response.ok) {
      const errorMessage = (await response.json()).message;
      setError(errorMessage);
      setFormEnabled(true);
      return;
    }

    const json = await response.json();
    localStorage.setItem(Config.STORAGE.USER_ID_KEY, json.id);
    localStorage.setItem(Config.STORAGE.JWT_TOKEN_KEY, json.token);

    const userResponse = await get(`voter/${json.id}`);
    if (!userResponse.ok) {
      setError("Could not sign you in. Please try again later");
    }
    setUser(await userResponse.json());
  };

  return (
    <>
      <div>
        <Helmet>
          <title>Sign In to {Config.APP.NAME}</title>
        </Helmet>
        <div className={styles.notification}>
          {success && <InlineNotification title={success} kind="success" />}
          {error && <InlineNotification title={error} />}
        </div>
        <h2>Sign In</h2>
        <p className="logInHint">
          Dont have an account yet? {""}
          <Link to={Routes.AUTH_SIGN_UP()}>Sign up instead</Link>
        </p>
        <form
          aria-label="Sign in form"
          className={styles.form}
          ref={form}
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
            name="password"
            type="password"
            invalid={error !== null}
            className={styles.inputs}
          />
          <div className="submit">
            <Button
              renderIcon={PortInput}
              type="submit"
              disabled={!formEnabled}
              className={styles.button}
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
