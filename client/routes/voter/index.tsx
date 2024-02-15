import { Helmet } from "react-helmet";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { get, patch, post } from "../../utils/fetch";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { Cards } from "../../components/cards";
import { Button, InlineNotification, TextInput } from "@carbon/react";
import styles from "./style.module.scss";
import {
  PortInput,
  Close,
  Locked,
  Unlocked,
  UserFollow,
} from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { TabComponent } from "../../components/tabs";
import { Routes } from "../index";
import { useNavigate } from "react-router-dom";

interface Society {
  societyId: number;
  name: string;
  description: string;
  societyPicture?: string;
  path?: string;
}

interface Election {
  electionId: number;
  name: string;
  societyId: number;
  description: string;
}

export const Voter = () => {
  const navigate = useNavigate();
  const [ownedSocieties, setOwnedSocieties] = useState<Society[] | null>([]);
  const [ownedElections, setOwnedElections] = useState<Election[] | null>([]);
  const [createElectionForSociety, setCreateElectionForSociety] = useState<
    number | null
  >(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [closeElection, setCloseElection] = useState<number | null>(null);
  const [openElection, setOpenElection] = useState<number | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<number | null>(null);
  const candidateForm = useRef<HTMLFormElement>(null);
  const candidateStatusForm = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const voterId = localStorage.getItem("USER_ID");

  const addElectionCandidateSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData(candidateForm.current ?? undefined);

    const body = Object.fromEntries(formData.entries());

    const response = await post(
      `election/${selectedElection}/add-candidate`,
      body
    );
    await setStateBasedOnResponse(response);
    setModal(!modal);
  };
  const openElectionHandler = async (electionId: number, societyId: number) => {
    setError(null);
    setSuccess(null);
    setSelectedElection(electionId);
    setOpenElection(electionId);
    setSelectedSociety(societyId);
  };
  const closeElectionHandler = async (
    electionId: number,
    societyId: number
  ) => {
    setError(null);
    setSuccess(null);
    setSelectedElection(electionId);
    setCloseElection(electionId);
    setSelectedSociety(societyId);
  };
  const addCandidateHandler = async (electionId: number, societyId: number) => {
    setModal(!modal);
    setSelectedElection(electionId);
    setSelectedSociety(societyId);
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
  const electionStatusUpdateOpen = async () => {
    if (openElection !== null) {
      try {
        const formData = new FormData(candidateStatusForm.current ?? undefined);

        formData.append("societyId", selectedSociety!.toString());
        formData.append("voterId", voterId ?? "");
        formData.append("electionStatus", "1");

        const body = Object.fromEntries(formData.entries());

        const response = await patch(
          `election/${openElection}/election-status/open`,
          body
        );
        await setStateBasedOnResponse(response);
        setSelectedElection(null);
        setCloseElection(null);
        setOpenElection(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await electionStatusUpdateOpen();
      } catch (error) {
        console.log(error);
      }
    })();
  }, [
    openElection,
    selectedSociety,
    voterId,
    setOpenElection,
    setSelectedElection,
  ]);

  const getElectionData = async voterId => {
    try {
      const response = await get(`election/get-owned/${voterId}`).then(res =>
        res.json()
      );
      const sortedElections = response.elections.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setOwnedElections(sortedElections);
    } catch (error) {
      console.log(error);
    }
  };

  const electionStatusUpdateClose = async () => {
    if (closeElection !== null) {
      try {
        const formData = new FormData(candidateStatusForm.current ?? undefined);

        formData.append("societyId", selectedSociety!.toString());
        formData.append("voterId", voterId!.toString());
        formData.append("electionStatus", "0");

        const body = Object.fromEntries(formData.entries());

        const response = await patch(
          `election/${closeElection}/election-status/close`,
          body
        );
        await setStateBasedOnResponse(response);
        setSelectedElection(null);
        setCloseElection(null);
        setOpenElection(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await electionStatusUpdateClose();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [
    closeElection,
    selectedSociety,
    voterId,
    setCloseElection,
    setOpenElection,
  ]);

  const fetchData = async () => {
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
      console.log(error);
    }
    await getElectionData(voterId);
  };
  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.log(error);
      }
    })();
  }, [createElectionForSociety, voterId]);

  const toggleModal = () => {
    setModal(!modal);
    setCreateElectionForSociety(0);
    setSelectedElection(0);
  };

  return (
    <AuthenticatedRoute>
      <div className={styles.pageContainer}>
        <Helmet>
          <title>My Societies</title>
        </Helmet>
        <div className={styles.notification}>
          {success && (
            <InlineNotification
              onClose={() => setSuccess(null)}
              title={success}
              kind="success"
            />
          )}
          {error && (
            <InlineNotification onClose={() => setError(null)} title={error} />
          )}
        </div>
        <TabComponent
          tabListNames={[
            {
              name: "Owned",
            },
            {
              name: "Election",
            },
          ]}
          tabContents={[
            <>
              <div className={styles.cardContainer}>
                <h1>Owned societies</h1>
                {ownedSocieties &&
                  ownedSocieties.map(society => (
                    <Cards
                      name={society.name}
                      key={society.societyId}
                      profilePicture={society.societyPicture}
                    >
                      <Button
                        onClick={() =>
                          navigate(
                            Routes.SOCIETY_PAGE(society.societyId.toString())
                          )
                        }
                        renderIcon={PortInput}
                      >
                        Go to Society
                      </Button>
                    </Cards>
                  ))}
              </div>
            </>,
            <>
              <div className={styles.cardContainer}>
                <h1>Created Elections</h1>
                {ownedElections &&
                  ownedElections.map(election => (
                    <Cards
                      name={election.name}
                      key={election.electionId}
                      description={election.description}
                    >
                      <Button
                        onClick={() =>
                          addCandidateHandler(
                            election.electionId,
                            election.societyId
                          )
                        }
                        renderIcon={UserFollow}
                        kind={"tertiary"}
                      >
                        Add candidate
                      </Button>
                      <Button
                        onClick={() =>
                          openElectionHandler(
                            election.electionId,
                            election.societyId
                          )
                        }
                        renderIcon={Unlocked}
                        kind={"primary"}
                      >
                        Open election
                      </Button>
                      <Button
                        onClick={() =>
                          closeElectionHandler(
                            election.electionId,
                            election.societyId
                          )
                        }
                        renderIcon={Locked}
                        kind={"danger"}
                      >
                        Close election
                      </Button>
                    </Cards>
                  ))}
                <ElectionModal modal={modal}>
                  <h3>Add candidate to election</h3>
                  <form
                    ref={candidateForm}
                    onSubmit={addElectionCandidateSubmit}
                  >
                    <TextInput
                      id={"candidateName"}
                      labelText={"Candidate Name"}
                      type={"text"}
                      name={"candidateName"}
                      required={true}
                    />
                    <TextInput
                      id={"candidateName"}
                      labelText={"Alias"}
                      type={"text"}
                      name={"candidateAlias"}
                      required={true}
                    />
                    <TextInput
                      id={"Description"}
                      labelText={"Description"}
                      type={"text"}
                      name={"description"}
                      required={true}
                    />
                    <Button
                      onClick={() => toggleModal()}
                      renderIcon={Close}
                      kind={"danger"}
                    >
                      Cancel
                    </Button>
                    <Button
                      renderIcon={PortInput}
                      kind={"primary"}
                      type={"submit"}
                    >
                      Add
                    </Button>
                  </form>
                </ElectionModal>
              </div>
            </>,
          ]}
        />
      </div>
    </AuthenticatedRoute>
  );
};
