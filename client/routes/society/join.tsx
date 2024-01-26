import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { InlineNotification } from "@carbon/react";
import { Delete, PortInput } from "@carbon/icons-react";
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
          } else {
            setSuccess(null);
            setError(responseMessage);
          }
          setSelectedSociety(null);
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
        const response = await get("society/get-all").then(res => res.json());
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

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Join a society</title>
        </Helmet>
        <div className={styles.notification}>
          {error && <InlineNotification title={error} hideCloseButton />}
          {success && (
            <InlineNotification
              title={success}
              hideCloseButton
              kind="success"
            />
          )}
        </div>
        <div className={styles.cardContainer}>
          {getAllResult &&
            getAllResult.map(society => (
              <Cards
                name={society.name}
                key={society.societyId}
                description={society.description}
                buttons={[
                  {
                    label: "Join",
                    eventHandler: () => joinSocietyHandler(society.societyId),
                    icon: PortInput,
                  },
                ]}
              />
            ))}
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
