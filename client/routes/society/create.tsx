import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import { Button, InlineNotification, Stack, TextInput } from "@carbon/react";
import { PortInput } from "@carbon/icons-react";
import React, { FormEvent, useRef, useState } from "react";
import { post } from "../../utils/fetch";

export const Create = () => {
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formEnabled, setFormEnabled] = useState(true);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormEnabled(false);

    const formData = new FormData(form.current ?? undefined);

    const voterId = localStorage.getItem("USER_ID");
    if (voterId) {
      formData.append("voterId", voterId);
    }

    const body = Object.fromEntries(formData.entries());

    const response = await post("society/create", body);
    await setStateBasedOnResponse(response);
    setFormEnabled(true);
  };

  const setStateBasedOnResponse = async response => {
    const responseMessage = (await response.json()).message;
    if (response.ok) {
      setSuccess(responseMessage);
      setError(null);
    } else {
      setSuccess(null);
      setError(responseMessage);
    }
  };

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Society</title>
        </Helmet>
        <div className={styles.notification}>
          {success && <InlineNotification title={success} kind="success" />}
          {error && <InlineNotification title={error} />}
        </div>
        <div>
          <h1>Society</h1>
        </div>
        <form
          aria-label="Create Society Form"
          className={styles.form}
          ref={form}
          onSubmit={submit}
        >
          <Stack gap={7}>
            <TextInput
              id="name"
              type="text"
              labelText="Society Name"
              name="name"
              invalid={error !== null}
            />
            <TextInput
              id="description"
              labelText="Description"
              name="description"
              type="text"
              invalid={error !== null}
            />
            <div className="submit">
              <Button
                renderIcon={PortInput}
                type="submit"
                disabled={!formEnabled}
              >
                Create Society
              </Button>
            </div>
          </Stack>
        </form>
      </div>
    </AuthenticatedRoute>
  );
};
