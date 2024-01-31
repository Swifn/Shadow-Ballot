import { Helmet } from "react-helmet";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { get, patch, post } from "../../utils/fetch";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { Cards } from "../../components/cards";
import { Button, InlineNotification, TextInput } from "@carbon/react";
import styles from "./style.module.scss";
import {
  Delete,
  PortInput,
  ResultNew,
  Edit,
  Close,
  Locked,
  Unlocked,
  FaceActivatedAdd,
  Exit,
  UserFollow,
} from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { TabComponent } from "../../components/tabs";

interface Society {
  societyId: number;
  name: string;
  description: string;
}

interface Election {
  electionId: number;
  name: string;
  societyId: number;
  description: string;
}

export const Voter = () => {
  //const navigate = useNavigate();
  const [ownedSocieties, setOwnedSocieties] = useState<Society[] | null>([]);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[] | null>([]);
  const [deleteSocieties, setDeleteSocieties] = useState<number | null>(null);
  const [editSocieties, setEditSocieties] = useState<number | null>(null);
  const [leaveSocieties, setLeaveSocieties] = useState<number | null>(null);
  const [ownedElections, setOwnedElections] = useState<Election[] | null>([]);
  const [createElectionForSociety, setCreateElectionForSociety] = useState<
    number | null
  >(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [closeElection, setCloseElection] = useState<number | null>(null);
  const [openElection, setOpenElection] = useState<number | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<number | null>(null);
  const electionForm = useRef<HTMLFormElement>(null);
  const candidateForm = useRef<HTMLFormElement>(null);
  const candidateStatusForm = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const voterId = localStorage.getItem("USER_ID");
  const createElectionSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData(electionForm.current ?? undefined);
    formData.append("voterId", voterId);

    formData.append("societyId", createElectionForSociety);

    const body = Object.fromEntries(formData.entries());
    const response = await post("election/create", body);
    await setStateBasedOnResponse(response);
    setModal(!modal);
  };

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
  const leaveSocietyHandler = async (societyId: number) => {
    setLeaveSocieties(societyId);
  };
  const deleteSocietyHandler = async (societyId: number) => {
    setDeleteSocieties(societyId);
  };
  const editSocietyHandler = async (societyId: number) => {
    setEditSocieties(societyId);
  };
  const createElectionHandler = async (societyId: number) => {
    setModal(!modal);
    setCreateElectionForSociety(societyId);
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
  useEffect(() => {
    const electionStatusUpdateOpen = async () => {
      if (openElection !== null) {
        try {
          const formData = new FormData(
            candidateStatusForm.current ?? undefined
          );

          formData.append("societyId", selectedSociety);
          formData.append("voterId", voterId);
          formData.append("electionStatus", 1);

          const body = Object.fromEntries(formData.entries());

          const response = await patch(
            `election/${openElection}/election-status/open`,
            body
          );
          await setStateBasedOnResponse(response);
          setSelectedElection(null);
          setCloseElection(null);
          setOpenElection(null);
          console.log("IN USE EFFECT");
        } catch (error) {
          console.log(error);
        }
      }
    };
    electionStatusUpdateOpen();
  }, [
    openElection,
    selectedSociety,
    voterId,
    setOpenElection,
    setSelectedElection,
  ]);

  // useEffect(() => {
  //   const createElectionSubmit = async (event: FormEvent) => {
  //     try {
  //       event.preventDefault();
  //
  //       const formData = new FormData(electionForm.current ?? undefined);
  //       formData.append("voterId", voterId);
  //
  //       formData.append("societyId", createElectionForSociety);
  //
  //       const body = Object.fromEntries(formData.entries());
  //       const response = await post("election/create", body);
  //       await setStateBasedOnResponse(response);
  //       setModal(!modal);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   createElectionSubmit();
  // }, [voterId, createElectionForSociety, modal]);

  useEffect(() => {
    const electionStatusUpdateClose = async () => {
      if (closeElection !== null) {
        try {
          const formData = new FormData(
            candidateStatusForm.current ?? undefined
          );

          formData.append("societyId", selectedSociety);
          formData.append("voterId", voterId);
          formData.append("electionStatus", 0);

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
    electionStatusUpdateClose();
  }, [
    closeElection,
    selectedSociety,
    voterId,
    setCloseElection,
    setOpenElection,
  ]);

  useEffect(() => {
    const deleteSociety = async () => {
      if (deleteSocieties !== null) {
        try {
          const response = await post(`society/delete/${deleteSocieties}`);
          await setStateBasedOnResponse(response);
          const updatedSocieties = ownedSocieties.filter(
            society => society.societyId !== deleteSocieties
          );
          setOwnedSocieties(updatedSocieties);
          setDeleteSocieties(null);
        } catch (error) {
          console.log(error);
        }
      }
    };
    deleteSociety();
  }, [deleteSocieties, ownedSocieties]);

  useEffect(() => {
    const leaveSociety = async () => {
      if (leaveSocieties !== null) {
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
      setLeaveSocieties(null);
    };
    leaveSociety();
  }, [leaveSocieties, voterId, joinedSocieties]);

  useEffect(() => {
    const fetchData = async () => {
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
      try {
        const response = await get(`election/get-owned/${voterId}`).then(res =>
          res.json()
        );
        const sortedElections = response.elections.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setOwnedElections(sortedElections);
      } catch (error) {
        console.log(`Error when retrieving owned Election data: ${error}`);
      }
    };

    fetchData();
  }, [voterId]);

  useEffect(() => {}, []);

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
          {success && <InlineNotification title={success} kind="success" />}
          {error && <InlineNotification title={error} />}
        </div>
        <TabComponent
          tabListNames={[
            {
              name: "Owned",
            },
            {
              name: "Joined",
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
                      description={society.description}
                    >
                      <Button
                        onClick={() => createElectionHandler(society.societyId)}
                        renderIcon={ResultNew}
                        kind={"tertiary"}
                      >
                        Create Election
                      </Button>
                      <Button
                        onClick={() => editSocietyHandler(society.societyId)}
                        renderIcon={Edit}
                        kind={"primary"}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteSocietyHandler(society.societyId)}
                        renderIcon={Delete}
                        kind={"danger"}
                      >
                        Delete
                      </Button>
                    </Cards>
                  ))}
                <ElectionModal modal={modal}>
                  <form ref={electionForm} onSubmit={createElectionSubmit}>
                    <h3>Create Election</h3>
                    <TextInput
                      id={"election_name"}
                      labelText={"Election Name"}
                      type={"text"}
                      name={"name"}
                      required={true}
                    />
                    <TextInput
                      id={"description"}
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
                      onClick={() => createElectionSubmit}
                      renderIcon={PortInput}
                      kind={"primary"}
                      type={"submit"}
                    >
                      Create
                    </Button>
                  </form>
                </ElectionModal>
              </div>
            </>,
            <>
              <div className={styles.cardContainer}>
                <h1>Joined Societies</h1>
                {joinedSocieties &&
                  joinedSocieties.map(society => (
                    <Cards
                      name={society.name}
                      key={society.societyId}
                      description={society.description}
                    >
                      <Button
                        onClick={() => leaveSocietyHandler(society.societyId)}
                        renderIcon={Exit}
                        kind={"danger"}
                      >
                        Leave
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
                      onClick={() => addElectionCandidateSubmit}
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
