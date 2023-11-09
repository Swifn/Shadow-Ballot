import { Helmet } from "react-helmet";
import { Config } from "../../config";
import { Link } from "react-router-dom";
import { Routes } from "../index";
import { PortInput } from "@carbon/icons-react";
import { Button, InlineNotification, TextInput } from "@carbon/react";
import { FormEvent, useRef, useState } from "react";
import styles from "./style.module.scss";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import "@solana/wallet-adapter-react-ui/styles.css";

type FormError = "password-mismatch" | "duplicate-email" | null;

export const SignUp = () => {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

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
      setError("password-mismatch");
      setFormEnabled(true);
      return;
    }

    //TODO Construct JSON payload from form data and send to server
  };
  return (
    <>
      <Helmet>
        <title>Get started with {Config.APP.NAME}</title>
      </Helmet>
      <h2>Sign up</h2>
      <p className={"styles logInHint"}>
        Already have an account?{" "}
        <Link to={Routes.AUTH_SIGN_IN()}>Sign in instead</Link>
      </p>
      <form className={styles.form} onSubmit={submit} ref={form}>
        <div>
          <WalletMultiButton />
        </div>
        <TextInput
          id="sign-up__email"
          type="text"
          pattern={Config.ORG.EMAIL_REGEX.source}
          labelText="Email"
          placeholder={Config.ORG.EMAIL_PLACEHOLDER}
          name="email"
          invalid={error === "duplicate-email"}
          required
        />
        <TextInput.PasswordInput
          id="sign-up__password1"
          labelText="Password"
          name="password1"
          ref={passwords[0]}
          invalid={error === "password-mismatch"}
          required
        />
        <TextInput.PasswordInput
          id="sign-up__password2"
          labelText="Confirm password"
          name="password2"
          ref={passwords[1]}
          invalid={error === "password-mismatch"}
          required
        />
        <Button renderIcon={PortInput} type="submit" disabled={!formEnabled}>
          Sign up
        </Button>
        {error && (
          <InlineNotification
            title={
              error == "duplicate-email"
                ? "An account with this email already exists. Try signing in instead"
                : "Password fields do not match"
            }
            hideCloseButton
          />
        )}
      </form>
    </>
  );
};
