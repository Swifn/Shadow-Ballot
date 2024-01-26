import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import {
  Button,
  FileUploader,
  InlineNotification,
  Stack,
  TextInput,
} from "@carbon/react";
import { PortInput } from "@carbon/icons-react";
import React, { FormEvent, useRef, useState } from "react";
import { get, post, postFile } from "../../utils/fetch";
import { Routes } from "../index";
import { useNavigate } from "react-router-dom";

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

    console.log(body);

    const bodyResponse = await post("society/create", body);
    console.log(bodyResponse.json());

    const bodyResponseMessage = (await bodyResponse.json()).message;
    const socId = (await bodyResponse.json()).societyId;
    console.log(bodyResponseMessage);
    console.log(socId);
    if (!bodyResponse.ok) {
      console.log(bodyResponseMessage);
      setError(bodyResponseMessage);
      setSuccess(null);
      setFormEnabled(true);
    }
    return;
  };

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Society</title>
        </Helmet>
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
              {error && <InlineNotification title={error} hideCloseButton />}
              {success && (
                <InlineNotification
                  title={success}
                  hideCloseButton
                  kind="success"
                />
              )}
            </div>
          </Stack>
        </form>
      </div>
    </AuthenticatedRoute>
  );
};
