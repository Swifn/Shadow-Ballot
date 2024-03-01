import { Helmet } from "react-helmet";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { get, patch, post, postFile } from "../../utils/fetch";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { Cards } from "../../components/cards";
import {
  Button,
  FileUploader,
  InlineNotification,
  TextInput,
} from "@carbon/react";
import styles from "./style.module.scss";
import {
  PortInput,
  Close,
  Locked,
  Unlocked,
  UserFollow,
  View,
} from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { TabComponent } from "../../components/tabs";
import { Routes } from "../index";
import { useNavigate } from "react-router-dom";
import { parseISO, format } from "date-fns";
import { ElectionModalCards } from "../../components/modal-cards";
import { Simulate } from "react-dom/test-utils";
import toggle = Simulate.toggle;

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
  electionStatus: boolean;
  start: string;
  end: string;
  ElectionPicture?: {
    path: string;
  };
}

interface electionCandidates {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  description: string;
  CandidatePicture: { path: string };
}

export const Voter = () => {
  const navigate = useNavigate();
  const [ownedSocieties, setOwnedSocieties] = useState<Society[] | null>([]);
  const [ownedElections, setOwnedElections] = useState<Election[] | null>([]);
  const [createElectionForSociety, setCreateElectionForSociety] = useState<
    number | null
  >(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [selectedCandidateElection, setSelectedCandidateElection] = useState<
    number | null
  >(null);
  const [closeElection, setCloseElection] = useState<number | null>(null);
  const [openElection, setOpenElection] = useState<number | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<number | null>(null);
  const candidateForm = useRef<HTMLFormElement>(null);
  const candidateStatusForm = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [candidatePicture, setCandidatePicture] = useState(null);
  const [getElectionCandidates, setGetElectionCandidates] = useState<
    electionCandidates[] | null
  >([]);
  const [modalContent, setModalContent] = useState<string | null>("");

  const voterId = localStorage.getItem("USER_ID");

  const addElectionCandidateSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData(candidateForm.current ?? undefined);

    const body = Object.fromEntries(formData.entries());

    const response = await post(
      `election/${selectedCandidateElection}/add-candidate`,
      body
    );

    const responseData = await response.json();

    if (response.ok) {
      if (candidatePicture !== null) {
        const fileResponse = await postFile(
          `election/upload-election-candidate-picture/${responseData.candidate}`,
          candidatePicture
        );
        await setStateBasedOnResponse(fileResponse);
      } else {
        await setStateBasedOnResponse(response);
      }
    } else {
      await setStateBasedOnResponse(response);
    }

    setSelectedElection(null);
    await fetchData();
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
    setSelectedCandidateElection(electionId);
    setSelectedSociety(societyId);
    toggleModal();
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
        await fetchData();
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
      console.log(response.elections);
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
        await fetchData();
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

    if (selectedElection != null) {
      try {
        const response = await get(
          `election/getElectionCandidates/${selectedElection}`
        ).then(res => res.json());

        if (response.ElectionCandidates.length === 0) {
          setSelectedElection(null);
          setError("No candidates found for this election, check back later.");
        } else {
          setGetElectionCandidates(response.ElectionCandidates);
          toggleModal();
        }

        setGetElectionCandidates(response.ElectionCandidates);
      } catch (error) {
        console.log(error);
      }
    }
  };
  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.log(error);
      }
    })();
  }, [
    createElectionForSociety,
    voterId,
    selectedElection,
    selectedCandidateElection,
  ]);

  const toggleModal = () => {
    setModal(!modal);
    setCreateElectionForSociety(0);
    setSelectedElection(0);
  };

  const handleCandidateFileChange = event => {
    const file = event.target.files[0];
    setCandidatePicture(file);
  };

  const viewCandidateHandler = async (electionId: number | null) => {
    setSelectedElection(electionId);
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
                      profilePicture={election.ElectionPicture?.path}
                    >
                      <p>
                        This election start: {""}
                        {format(parseISO(election?.start), "PPPP, p")}
                      </p>
                      <br />
                      <p>
                        This election ends: {""}
                        {format(parseISO(election?.end), "PPPP, p")}
                      </p>
                      <Button
                        renderIcon={View}
                        kind={"ghost"}
                        onClick={() => {
                          viewCandidateHandler(election.electionId);
                          setModalContent("electionModalCards");
                        }}
                      >
                        View Candidates
                      </Button>
                      <Button
                        onClick={() => {
                          addCandidateHandler(
                            election.electionId,
                            election.societyId
                          );
                          setModalContent("addCandidate");
                        }}
                        renderIcon={UserFollow}
                        kind={"tertiary"}
                        disabled={election.electionStatus}
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
                        disabled={election.electionStatus}
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
                        disabled={!election.electionStatus}
                      >
                        Close election
                      </Button>
                    </Cards>
                  ))}
                {modalContent === "addCandidate" && (
                  <ElectionModal modal={modal}>
                    <h3>Add candidate to election</h3>
                    <form
                      ref={candidateForm}
                      onSubmit={addElectionCandidateSubmit}
                    >
                      <div className={styles.addCandidateContainer}>
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
                        <FileUploader
                          buttonLabel={"Upload a picture"}
                          filenameStatus={"complete"}
                          onChange={handleCandidateFileChange}
                          className={styles.fileUploader}
                          accept={[".jpg", ".png", ".jpeg"]}
                        >
                          Upload Profile Picture
                        </FileUploader>
                      </div>
                      <Button
                        onClick={() => {
                          toggleModal();
                          setSelectedElection(null);
                        }}
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
                )}
                <ElectionModalCards
                  modal={modal}
                  modalContents={modalContent}
                  cardContents={getElectionCandidates}
                >
                  <Button
                    onClick={() => {
                      toggleModal();
                      setSelectedElection(null);
                    }}
                    renderIcon={Close}
                    kind={"danger"}
                  >
                    Close
                  </Button>
                </ElectionModalCards>
              </div>
            </>,
          ]}
        />
      </div>
    </AuthenticatedRoute>
  );
};
