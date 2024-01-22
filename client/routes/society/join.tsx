import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Button, ComboBox, InlineNotification, Stack } from "@carbon/react";
import { SendFilled } from "@carbon/icons-react";
import { get, post } from "../../utils/fetch";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { Routes } from "../index";
import { useNavigate } from "react-router-dom";

interface Society {
  societyId: number;
  name: string;
  description: string;
}

export const Join = () => {
  const navigate = useNavigate();
  const [getAllResult, setGetAllResult] = useState<Society[] | null>([]);
  const [society, setSociety] = useState<string[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<number | null>(null);
  const [societyDescription, setSocietyDescription] = useState<string | null>(
    null
  );
  const form = useRef<HTMLFormElement>(null);
  const joinSociety = useRef<HTMLInputElement>(null);
  const [formEnabled, setFormEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormEnabled(false);

    const formData = new FormData(form.current ?? undefined);

    const voterId = localStorage.getItem("USER_ID");
    if (voterId) {
      formData.append("voterId", voterId);
    }

    formData.append("societyId", selectedSociety);

    const body = Object.fromEntries(formData.entries());

    console.log(body);

    const response = await post("society/join", body);

    const responseMessage = (await response.json()).message;
    console.log(response);
    if (!response.ok) {
      console.log(responseMessage);
      setError(responseMessage);
      setSuccess(null);
      setFormEnabled(true);
    } else {
      setSuccess(responseMessage);
      setError(null);
      return;
    }
  };

  const handleSocietySelection = selectedItem => {
    const selectedSociety = getAllResult.find(
      society => society.name === selectedItem.selectedItem
    );
    console.log(selectedSociety.societyId);

    if (selectedSociety) {
      setSocietyDescription(selectedSociety.description);
      setSelectedSociety(selectedSociety.societyId);
    } else {
      console.error("Selected society is not found");
    }
  };

  useEffect(() => {
    const fetchAllSocietiesAsync = async () => {
      try {
        const response = await get("society/getall").then(res => res.json());
        setGetAllResult(response.societies);
        // .then(json => json.societies);
      } catch (e) {
        console.log(`Error when retrieving all society data: ${e}`);
      }
    };

    fetchAllSocietiesAsync();
  }, []);

  useEffect(() => {
    if (getAllResult) {
      const societyNames = getAllResult.map(society => society.name);
      setSociety(societyNames);
    }
  }, [getAllResult]);

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Join a society</title>
        </Helmet>
        <Stack gap={7}>
          <form
            aria-label="Join Society Form"
            className={"meow"}
            ref={form}
            onSubmit={submit}
          >
            <ComboBox
              allowCustomValue={false}
              className="combo_box"
              id="society-combobox"
              items={society}
              onChange={handleSocietySelection}
              placeholder="Select a society"
              titleText="Societies"
            />
            <p>{societyDescription}</p>
            <Button type="submit" renderIcon={SendFilled}>
              Join Society
            </Button>
            {error && <InlineNotification title={error} hideCloseButton />}
            {success && (
              <InlineNotification
                title={success}
                hideCloseButton
                kind="success"
              />
            )}
          </form>
        </Stack>
      </div>
    </AuthenticatedRoute>
  );
};
