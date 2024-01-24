import { Helmet } from "react-helmet";
import React, { useEffect, useState } from "react";
import { get, post } from "../../utils/fetch";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { Cards } from "../../components/cards";
import { InlineNotification } from "@carbon/react";
import styles from "./style.module.scss";
import { Delete, PortInput, ResultNew, Edit } from "@carbon/icons-react";
// import { useNavigate } from "react-router-dom";

interface Society {
  societyId: number;
  name: string;
  description: string;
}

export const Voter = () => {
  //const navigate = useNavigate();
  const [ownedSocieties, setOwnedSocieties] = useState<Society[] | null>([]);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[] | null>([]);
  const [deleteSocieties, setDeleteSocieties] = useState<number | null>(null);
  // const [editSocieties, setEditSocieties] = useState<number | null>(null);
  const [leaveSocieties, setLeaveSocieties] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const voterId = localStorage.getItem("USER_ID");

  const leaveSocietyHandler = async (societyId: number) => {
    setLeaveSocieties(societyId);
  };

  const deleteSocietyHandler = async (societyId: number) => {
    setDeleteSocieties(societyId);
  };
  // const editSocietyHandler = async (societyId: number) => {
  //   setEditSocieties(societyId);
  // };
  const createElectionHandler = async (societyId: number) => {};

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

  useEffect(() => {
    const deleteSociety = async () => {
      if (deleteSocieties !== null) {
        try {
          const response = await post(`society/delete/${deleteSocieties}`);
          await setStateBasedOnResponse(response);
          if (response.ok) {
          }
          const updatedSocieties = ownedSocieties.filter(
            society => society.societyId !== deleteSocieties
          );
          setOwnedSocieties(updatedSocieties);
        } catch (error) {
          console.log(error);
        }
      }
    };
    deleteSociety();
  }, [deleteSocieties, ownedSocieties]);

  useEffect(() => {
    const leaveSociety = async () => {
      if (leaveSocieties != null) {
        try {
          const response = await post(
            `society/leave/${leaveSocieties}/${voterId}`
          );
          await setStateBasedOnResponse(response);
          const updatedSocieties = joinedSocieties.filter(
            society => society.societyId !== leaveSocieties
          );
          setJoinedSocieties(updatedSocieties);

          await setStateBasedOnResponse(response);
        } catch (error) {
          console.log(error);
        }
      }
    };
    leaveSociety();
  }, [leaveSocieties, voterId, joinedSocieties]);

  useEffect(() => {
    const fetchJoinedSocieties = async () => {
      try {
        const response = await get(`society/get-joined/${voterId}`).then(res =>
          res.json()
        );
        setJoinedSocieties(response.societies);
        const sortedSocieties = response.societies.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setJoinedSocieties(sortedSocieties);
      } catch (error) {
        console.log(`Error when retrieving owned society data: ${error}`);
      }
    };

    fetchJoinedSocieties();
  }, [voterId]);

  useEffect(() => {
    const fetchOwnedSocieties = async () => {
      try {
        const response = await get(`society/get-owned/${voterId}`).then(res =>
          res.json()
        );
        setOwnedSocieties(response.societies);
        const sortedSocieties = response.societies.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setOwnedSocieties(sortedSocieties);
      } catch (error) {
        console.log(`Error when retrieving owned society data: ${error}`);
      }
    };

    fetchOwnedSocieties();
  }, [voterId]);

  // useEffect(() => {
  //   if (ownedSocieties) {
  //     const societyNames = ownedSocieties.map(society => society.name);
  //     setSocieties(societyNames);
  //   }
  // }, [ownedSocieties]);
  //
  // useEffect(() => {
  //   if (joinedSocieties) {
  //     const societyNames = joinedSocieties.map(society => society.name);
  //     setSocieties(societyNames);
  //   }
  // }, [joinedSocieties]);

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>My Societies</title>
        </Helmet>
        <div className={styles.notification}>
          {error && <InlineNotification title={error} />}
          {success && <InlineNotification title={success} kind="success" />}
        </div>
        <div className={styles.cardContainer}>
          <h1>Owned societies</h1>
          {ownedSocieties &&
            ownedSocieties.map(society => (
              <Cards
                name={society.name}
                key={society.societyId}
                description={society.description}
                buttons={[
                  {
                    label: "Create election",
                    eventHandler: () =>
                      createElectionHandler(society.societyId),
                    icon: ResultNew,
                    kind: "tertiary",
                  },
                  {
                    label: "Edit",
                    eventHandler: () => editSocietyHandler(society.societyId),
                    icon: Edit,
                    kind: "primary",
                  },

                  {
                    label: "Delete",
                    eventHandler: () => deleteSocietyHandler(society.societyId),
                    icon: Delete,
                    kind: "danger",
                  },
                ]}
              />
            ))}
          <h1>Joined Societies</h1>
          {joinedSocieties &&
            joinedSocieties.map(society => (
              <Cards
                name={society.name}
                key={society.societyId}
                description={society.description}
                buttons={[
                  {
                    label: "Leave",
                    eventHandler: () => leaveSocietyHandler(society.societyId),
                    icon: PortInput,
                    kind: "danger",
                  },
                ]}
              />
            ))}
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
