import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import {
  Button,
  ComboBox,
  InlineNotification,
  Search,
  TextArea,
  TextInput,
} from "@carbon/react";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Add, PortInput, Close, Exit } from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { get, post } from "../../utils/fetch";
import { Cards } from "../../components/cards";
import { Routes } from "../index";

interface Society {
  societyId: number;
  name: string;
  description: string;
  societySubject: string;
  societyPicture?: string;
  path?: string;
}

interface SocietySubject {
  subjectId: number;
  name: string;
}

export const Society = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  // const [modalContext, setModalContext] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formEnabled, setFormEnabled] = useState(true);
  // const [selectedLeaveSociety, setSelectedLeaveSociety] = useState<
  //   number | null
  // >(null);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [getAllResult, setGetAllResult] = useState<Society[] | null>([]);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[] | null>([]);
  // const [leaveSocieties, setLeaveSocieties] = useState<number | null>(null);
  const [joinSearch, setJoinSearch] = useState("");
  // const [leaveSearch, setLeaveSearch] = useState("");
  // const [filteredLeaveSocieties, setFilteredLeaveSocieties] = useState<
  //   Society[]
  // >([]);
  const [filteredJoinSocieties, setFilteredJoinSocieties] = useState<Society[]>(
    []
  );
  const [getSocietySubject, setGetSocietySubject] = useState<SocietySubject[]>(
    []
  );
  const voterId = localStorage.getItem("USER_ID");

  // const leaveSocietyHandler = async (societyId: number) => {
  //   setLeaveSocieties(societyId);
  // };

  // const searchLeaveHandler = event => {
  //   setLeaveSearch(event.target.value);
  // };
  const searchJoinHandler = event => {
    setJoinSearch(event.target.value);
  };

  const viewSocietyPage = async (societyId: number) => {
    navigate(Routes.SOCIETY_PAGE(societyId.toString()));
  };
  const comboBoxHandler = event => {
    const subjectName = event.selectedItem;
    const subjectId = getSocietySubject.find(
      subject => subject.name === subjectName
    )?.subjectId;
    setSelectedSubject(subjectId!);
  };

  // useEffect(() => {
  //   const filterLeaveSocieties = () => {
  //     if (leaveSearch) {
  //       const filtered = joinedSocieties!.filter(society =>
  //         society.name.toLowerCase().includes(leaveSearch.toLowerCase())
  //       );
  //       setFilteredLeaveSocieties(filtered);
  //     } else {
  //       setFilteredLeaveSocieties(joinedSocieties!);
  //     }
  //   };
  //   filterLeaveSocieties();
  // }, [leaveSearch, getAllResult]);

  useEffect(() => {
    if (!getAllResult || !joinedSocieties) return;
    const notJoinedSocieties = getAllResult.filter(
      allSociety =>
        !joinedSocieties.some(
          joinedSociety => joinedSociety.societyId === allSociety.societyId
        )
    );
    const filteredSocieties = notJoinedSocieties.filter(society =>
      society.name.toLowerCase().includes(joinSearch.toLowerCase())
    );
    setFilteredJoinSocieties(filteredSocieties);
  }, [joinSearch, getAllResult, joinedSocieties]);

  // const leaveSociety = async () => {
  //   if (leaveSocieties !== null) {
  //     try {
  //       const response = await post(
  //         `society/leave/${leaveSocieties}/${voterId}`
  //       );
  //       await setStateBasedOnResponse(response);
  //       const updatedSocieties = joinedSocieties!.filter(
  //         society => society.societyId !== leaveSocieties
  //       );
  //       setFilteredLeaveSocieties(updatedSocieties);
  //       setSelectedLeaveSociety(null);
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       await fetchData();
  //     }
  //   }
  //   setLeaveSocieties(null);
  // };

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
      const response = await get("society/get-all").then(res => res.json());
      setGetAllResult(response.societies);
      const sortedSocieties = response.societies.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setGetAllResult(sortedSocieties);
      console.log("Get all societies", response.societies);
    } catch (error) {
      console.log(`Error when retrieving all society data: ${error}`);
    }
    try {
      const response = await get(`society/get-society-subject`).then(res =>
        res.json()
      );
      setGetSocietySubject(response.subjects);
    } catch (error) {
      console.log(error);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormEnabled(false);

    const formData = new FormData(form.current ?? undefined);
    formData.append("voterId", voterId!);
    formData.append("subjectId", selectedSubject.toString());

    const body = Object.fromEntries(formData.entries());
    const response = await post("society/create", body);
    await setStateBasedOnResponse(response);
    setModal(!modal);
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
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       await leaveSociety();
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   })();
  // }, [leaveSocieties, voterId, joinedSocieties]);

  const toggleModal = () => {
    setModal(!modal);
  };

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modal]);

  return (
    <AuthenticatedRoute>
      <div className={styles.container}>
        <main>
          <div>
            <div className={styles.notification}>
              {success && (
                <InlineNotification
                  onClose={() => setSuccess(null)}
                  title={success}
                  kind="success"
                />
              )}
              {error && (
                <InlineNotification
                  onClose={() => setError(null)}
                  title={error}
                />
              )}
            </div>
            <div className={styles.content}>
              <div className={styles.header}>
                <h1>Societies</h1>
              </div>
              <div className={styles.create}>
                <Button
                  kind={"ghost"}
                  size={"md"}
                  className={styles.button}
                  renderIcon={Add}
                  onClick={() => {
                    toggleModal();
                    // setModalContext("createSociety");
                  }}
                >
                  Create
                </Button>
              </div>
              <div className={styles.header}>
                <h2>Join a society</h2>
              </div>
              <Search
                labelText={"Search to join society"}
                value={joinSearch}
                onChange={searchJoinHandler}
                className={styles.search}
                placeholder={"Search to join society"}
              />
              <div className={styles.join}>
                <div className={styles.cardContainer}>
                  {filteredJoinSocieties &&
                    filteredJoinSocieties.map(society => (
                      <Cards
                        name={society.name}
                        key={society.societyId}
                        societySubject={society.societySubject}
                        profilePicture={society.societyPicture}
                      >
                        <Button
                          onClick={() => viewSocietyPage(society.societyId)}
                          renderIcon={PortInput}
                        >
                          View Society
                        </Button>
                      </Cards>
                    ))}
                </div>
              </div>
            </div>

            {/*<div className={styles.content}>*/}
            {/*  <div className={styles.header}>*/}
            {/*    <h2>Leave a society</h2>*/}
            {/*  </div>*/}
            {/*  <Search*/}
            {/*    labelText={"Search to leave society"}*/}
            {/*    value={leaveSearch}*/}
            {/*    onChange={searchLeaveHandler}*/}
            {/*    className={styles.search}*/}
            {/*    placeholder={"Search to leave society"}*/}
            {/*  />*/}
            {/*  <div className={styles.leave}>*/}
            {/*    <div className={styles.cardContainer}>*/}
            {/*      {filteredLeaveSocieties &&*/}
            {/*        filteredLeaveSocieties.map(society => (*/}
            {/*          <Cards*/}
            {/*            name={society.name}*/}
            {/*            key={society.societyId}*/}
            {/*            societySubject={society.societySubject}*/}
            {/*            profilePicture={society.societyPicture}*/}
            {/*          >*/}
            {/*            <Button*/}
            {/*              onClick={() => {*/}
            {/*                setModal(!modal);*/}
            {/*                setModalContext("leaveSociety");*/}
            {/*                setSelectedLeaveSociety(society.societyId);*/}
            {/*              }}*/}
            {/*              renderIcon={Exit}*/}
            {/*              kind={"danger"}*/}
            {/*            >*/}
            {/*              Leave*/}
            {/*            </Button>*/}
            {/*          </Cards>*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
          <ElectionModal modal={modal}>
            {/*{modalContext === "leaveSociety" && (*/}
            {/*  <div>*/}
            {/*    <p>*/}
            {/*      You are about to leave this society. You can join back at any*/}
            {/*      time from the societies page.*/}
            {/*    </p>*/}
            {/*    <Button renderIcon={Close} onClick={() => setModal(!modal)}>*/}
            {/*      Close*/}
            {/*    </Button>*/}
            {/*    <Button*/}
            {/*      renderIcon={PortInput}*/}
            {/*      kind={"danger"}*/}
            {/*      onClick={() => {*/}
            {/*        setModal(!modal);*/}
            {/*        leaveSocietyHandler(selectedLeaveSociety!);*/}
            {/*      }}*/}
            {/*    >*/}
            {/*      Confirm*/}
            {/*    </Button>*/}
            {/*  </div>*/}
            {/*)}*/}
            {modal && (
              <div>
                <h1 className={styles.modalHeader}>Create Society</h1>
                <form
                  aria-label="Create Society Form"
                  className={styles.form}
                  ref={form}
                  onSubmit={submit}
                >
                  <TextInput
                    id="name"
                    type="text"
                    labelText="Society Name"
                    name="name"
                    invalid={error !== null}
                  />
                  <ComboBox
                    className={styles.comboBox}
                    id={"subject"}
                    aria-label={"Select a subject"}
                    items={getSocietySubject.map(subject => subject.name)}
                    onChange={comboBoxHandler}
                    placeholder={"Select a subject"}
                  />
                  <TextArea
                    className={styles.textArea}
                    id="description"
                    labelText="Description"
                    name="description"
                    type="text"
                    invalid={error !== null}
                  />
                  <div className={styles.submit}>
                    <Button
                      kind={"danger"}
                      renderIcon={Close}
                      onClick={toggleModal}
                      className={styles.button}
                    >
                      Cancel
                    </Button>
                    <Button
                      renderIcon={PortInput}
                      type="submit"
                      disabled={!formEnabled}
                      className={styles.button}
                    >
                      Create
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </ElectionModal>
        </main>
      </div>
    </AuthenticatedRoute>
  );
};
