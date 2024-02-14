import { Helmet } from "react-helmet";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { get, patch, post, postFile } from "../../utils/fetch";
import { AuthenticatedRoute } from "../../components/conditional-route";
import { Cards } from "../../components/cards";
import {
  Button,
  FileUploader,
  InlineNotification,
  NumberInput,
  TextArea,
  TextInput,
} from "@carbon/react";
import styles from "./style.module.scss";
import {
  Delete,
  PortInput,
  ResultNew,
  Edit,
  Close,
  Locked,
  Unlocked,
  UserFollow,
} from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { TabComponent } from "../../components/tabs";

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
  //const navigate = useNavigate();
  const [ownedSocieties, setOwnedSocieties] = useState<Society[] | null>([]);
  const [deleteSocieties, setDeleteSocieties] = useState<number | null>(null);
  const [editSocieties, setEditSocieties] = useState<number | null>(null);
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
  const editSocietiesForm = useRef<HTMLFormElement>(null);
  const candidateStatusForm = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [modalContext, setModalContext] = useState<string | null>(null);
  const [picture, setPicture] = useState(null);
  const [kValue, setKValue] = useState<number>(2);

  const voterId = localStorage.getItem("USER_ID");
  const createElectionSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const formData = new FormData(electionForm.current ?? undefined);
    formData.append("voterId", voterId ?? "");

    formData.append("societyId", createElectionForSociety!.toString() ?? "");
    formData.append("kValue", kValue.toString() ?? "");

    const body = Object.fromEntries(formData.entries());
    console.log(body);
    const response = await post("election/create", body);
    await getElectionData(voterId);
    await setStateBasedOnResponse(response);
    setModal(!modal);
  };

  const editSocietySubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formData = new FormData(editSocietiesForm.current ?? undefined);
    formData.append("societyId", editSocieties!.toString());
    const body = Object.fromEntries(formData.entries());
    const response = await patch(`society/edit-society/${editSocieties}`, body);
    if (picture) {
      await uploadFile();
    }
    await fetchData();
    await setStateBasedOnResponse(response);
    setModal(false);
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
  const deleteSocietyHandler = async (societyId: number) => {
    setDeleteSocieties(societyId);
  };
  const editSocietyHandler = async (societyId: number) => {
    setEditSocieties(societyId);
  };
  const createElectionHandler = async (societyId: number) => {
    setCreateElectionForSociety(societyId);
  };

  const handleFileUpload = event => {
    const file = event.target.files[0];
    setPicture(file);
  };

  const kValueHandler = (event, newValue) => {
    setKValue(newValue.value);
    console.log(kValue);
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
        console.log("IN USE EFFECT");
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
        console.error("An error occurred:", error);
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
      console.log(`Error when retrieving owned Election data: ${error}`);
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

  const deleteSociety = async () => {
    if (deleteSocieties !== null) {
      try {
        const response = await post(`society/delete/${deleteSocieties}`);
        await setStateBasedOnResponse(response);
        const updatedSocieties = ownedSocieties!.filter(
          society => society.societyId !== deleteSocieties
        );
        setOwnedSocieties(updatedSocieties);
        setDeleteSocieties(null);
        setSelectedSociety(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await deleteSociety();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [deleteSocieties, ownedSocieties]);

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
      console.log(`Error when retrieving owned society data: ${error}`);
    }
    await getElectionData(voterId);
  };
  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })();
  }, [createElectionForSociety, voterId]);

  const toggleModal = () => {
    setModal(!modal);
    setCreateElectionForSociety(0);
    setSelectedElection(0);
  };

  const uploadFile = async () => {
    console.log(picture);
    console.log("HERE AGAIN");
    const response = await postFile(
      `society/upload-society-picture/${editSocieties}`,
      picture
    );
    if (!response.ok) {
      alert("Failed to upload file");
    }
  };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       await uploadFile();
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   })();
  // }, [picture]);

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
                      profilePicture={society.societyPicture}
                    >
                      <Button
                        onClick={() => {
                          setModalContext("createElection");
                          createElectionHandler(society.societyId);
                          setModal(!modal);
                        }}
                        renderIcon={ResultNew}
                        kind={"tertiary"}
                      >
                        Create Election
                      </Button>
                      <Button
                        onClick={() => {
                          editSocietyHandler(society.societyId);
                          setModalContext("editSociety");
                          setModal(!modal);
                        }}
                        renderIcon={Edit}
                        kind={"primary"}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          setModalContext("deleteSociety");
                          setSelectedSociety(society.societyId);
                          setModal(!modal);
                        }}
                        renderIcon={Delete}
                        kind={"danger"}
                      >
                        Delete
                      </Button>
                    </Cards>
                  ))}
                <ElectionModal modal={modal}>
                  {modalContext === "createElection" && (
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
                      <NumberInput
                        id={"kValue"}
                        label={"K-anonymity value"}
                        size={"lg"}
                        min={1}
                        max={10}
                        defaultValue={2}
                        required={true}
                        onChange={kValueHandler}
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
                        Create
                      </Button>
                    </form>
                  )}
                  {modalContext === "deleteSociety" && (
                    <div>
                      <p>
                        Are you sure you want to delete this society? This
                        action is irreversible. All candidates will be removed
                        and all elections will be deleted.
                      </p>
                      <Button
                        renderIcon={Close}
                        onClick={() => setModal(!modal)}
                      >
                        Close
                      </Button>
                      <Button
                        renderIcon={PortInput}
                        kind={"danger"}
                        onClick={() => deleteSocietyHandler(selectedSociety!)}
                      >
                        Confirm
                      </Button>
                    </div>
                  )}
                  {modalContext === "editSociety" && (
                    <div>
                      <form
                        aria-label={"Edit Society Form"}
                        ref={editSocietiesForm}
                        onSubmit={editSocietySubmit}
                      >
                        <h3>Editing society</h3>
                        <TextInput
                          id={"societyName"}
                          labelText={"Society Name"}
                          type={"text"}
                          name={"name"}
                          defaultValue={
                            ownedSocieties?.find(
                              society => society.societyId === editSocieties
                            )?.name
                          }
                        />
                        <TextArea
                          className={styles.textArea}
                          id={"societyDescription"}
                          labelText={"Society Description"}
                          type={"text"}
                          name={"description"}
                          defaultValue={
                            ownedSocieties?.find(
                              society => society.societyId === editSocieties
                            )?.description
                          }
                        />
                        <FileUploader
                          buttonLabel={"Upload a picture"}
                          filenameStatus={"complete"}
                          onChange={handleFileUpload}
                          className={styles.fileUploader}
                          accept={[".jpg", ".png", ".jpeg"]}
                        >
                          Upload Profile Picture
                        </FileUploader>
                        <p>JPG, PNG, JPEG files only</p>
                        <Button
                          renderIcon={Close}
                          kind={"danger"}
                          onClick={() => setModal(!modal)}
                        >
                          Close
                        </Button>
                        <Button
                          type="submit"
                          renderIcon={PortInput}
                          kind={"primary"}
                          onSubmit={() => editSocietyHandler(selectedSociety!)}
                        >
                          Confirm
                        </Button>
                      </form>
                    </div>
                  )}
                </ElectionModal>
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
