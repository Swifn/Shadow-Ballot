import { Helmet } from "react-helmet";
import { Config } from "../../config";
import { Link } from "react-router-dom";
import { Routes } from "../index";
import { PortInput } from "@carbon/icons-react";
import { Button, InlineNotification, Stack, TextInput } from "@carbon/react";
import React from "@carbon/react";
import { post } from "../../utils/fetch";
import styles from "./style.module.scss";
import { FormEvent, useRef, useState } from "react";

type FormError = "different-passwords" | "duplicate-email" | null;

export const SignUp = () => {
  const form = useRef<HTMLFormElement>(null);
  const passwords = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [error, setError] = useState<FormError>(null);
  const [formEnabled, setFormEnabled] = useState(true);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    // Lock form to prevent multiple submissions
    setFormEnabled(false);

    // Ensure password fields match
    if (passwords[0].current?.value !== passwords[1].current?.value) {
      setError("different-passwords");
      setFormEnabled(true);
      return;
    }

    // Construct JSON payload from form data and send to server
    const body = Object.fromEntries(
      new FormData(form.current ?? undefined).entries()
    );
    console.log(body);
    const response = await post("auth/sign-up", body);
    if (response.ok) {
      // Once signed up, ask user to sign in to start session
      window.location.href = Routes.AUTH_SIGN_IN();
      return;
    }
    setError("duplicate-email");
    // Unlock form to re-attempt signing up
    setFormEnabled(true);
  };

  // @ts-ignore
  return (
    <>
      <Helmet>
        <title>Get started with {Config.APP.NAME}</title>
      </Helmet>
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
        <Stack gap={7}>
          <TextInput
            id="sign-in__email"
            type="text"
            labelText="Email"
            name="email"
            pattern={Config.ORG.EMAIL_REGEX.source}
            placeholder={Config.ORG.EMAIL_PLACEHOLDER}
            invalid={error === "duplicate-email"}
            required
          />
          <TextInput.PasswordInput
            id="sign-in__password1"
            labelText="Password"
            name="password1"
            ref={passwords[0]}
            invalid={error === "different-passwords"}
            required
          />
          <TextInput.PasswordInput
            id="sign-in__password2"
            labelText="Re-enter password"
            name="password2"
            ref={passwords[1]}
            invalid={error === "different-passwords"}
            required
          />

          <div className="submit">
            <Button
              renderIcon={PortInput}
              type="submit"
              disabled={!formEnabled}
            >
              Submit
            </Button>
            {error && (
              <InlineNotification
                title={
                  error == "duplicate-email"
                    ? "An account with this email already exists"
                    : "passwords dont match"
                }
                hideCloseButton
              />
            )}
          </div>
        </Stack>
      </form>
    </>
  );
};
