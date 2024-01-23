import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Button, ComboBox, InlineNotification, Stack } from "@carbon/react";
import { PortInput, SendFilled } from "@carbon/icons-react";
import { get, post } from "../../utils/fetch";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { Routes } from "../index";
import { useNavigate } from "react-router-dom";
import { Cards } from "../../components/cards/index";
import styles from "./style.module.scss";

interface Society {
  societyId: number;
  name: string;
  description: string;
}

export const Join = () => {
  const navigate = useNavigate();
  const [getAllResult, setGetAllResult] = useState<Society[] | null>([]);
  const [societies, setSocieties] = useState<string[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const joinSocietyHandler = async (societyId: number) => {
    setSelectedSociety(societyId);
    console.log(selectedSociety);
  };

  useEffect(() => {
    const joinSociety = async () => {
      if (selectedSociety != null) {
        try {
          const formData = new FormData();

          const voterId = localStorage.getItem("USER_ID");
          if (voterId) {
            formData.append("voterId", voterId);
          }
          formData.append("societyId", selectedSociety);

          const body = Object.fromEntries(formData.entries());
          const response = await post(`society/join`, body);

          const responseMessage = (await response.json()).message;

          if (response.ok) {
            setSuccess(responseMessage);
            setError(null);
            navigate(Routes.SOCIETY());
          } else {
            setSuccess(null);
            setError(responseMessage);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    joinSociety();
  }, [selectedSociety]);

  useEffect(() => {
    const fetchAllSocieties = async () => {
      try {
        const response = await get("society/getall").then(res => res.json());
        setGetAllResult(response.societies);
        const sortedSocieties = response.societies.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setGetAllResult(sortedSocieties);
      } catch (error) {
        console.log(`Error when retrieving all society data: ${error}`);
      }
    };

    fetchAllSocieties();
  }, []);

  useEffect(() => {
    if (getAllResult) {
      const societyNames = getAllResult.map(society => society.name);
      setSocieties(societyNames);
    }
  }, [getAllResult]);

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Join a society</title>
        </Helmet>
        <div className={styles.cardContainer}>
          {getAllResult &&
            getAllResult.map(society => (
              <Cards
                key={society.societyId}
                name={society.name}
                description={society.description}
                button={"Join"}
                icon={PortInput}
                eventHandler={() => joinSocietyHandler(society.societyId)}
              />
            ))}
          {error && <InlineNotification title={error} hideCloseButton />}
          {success && (
            <InlineNotification
              title={success}
              hideCloseButton
              kind="success"
            />
          )}
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
