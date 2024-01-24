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
  const navigate = useNavigate();
  const form = useRef<HTMLFormElement>(null);
  const [picture, setPicture] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formEnabled, setFormEnabled] = useState(true);

  const handlePictureChange = event => {
    const file = event.target.files[0];
    setPicture(file);
    console.log(file);
  };

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

    const bodyResponse = await post("society/create/:id", body);
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

    console.log(picture);

    try {
      const pictureResponse = await postFile(
        `society/create/upload-picture`,
        picture
      );
      const pictureResponseMessage = (await pictureResponse.json()).message;
      console.log(pictureResponseMessage);
    } catch (error) {
      console.error("Error in postFile:", error);
    }
    console.log("test2");

    // setTimeout(() => {
    //   navigate(Routes.LANDING());
    // }, 2000);
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
            <div className="cds--file__container">
              <FileUploader
                onChange={handlePictureChange}
                labelTitle="Upload files"
                labelDescription="Max file size is 500mb. Only .jpg files are supported."
                buttonLabel="Add file"
                buttonKind="primary"
                size="md"
                filenameStatus="edit"
                accept={[".jpg", ".png"]}
                multiple={true}
                disabled={false}
                iconDescription="Delete file"
                name=""
              />
            </div>
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
