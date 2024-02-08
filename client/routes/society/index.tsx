import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import {
  Button,
  InlineNotification,
  Search,
  Stack,
  TextInput,
} from "@carbon/react";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Add, PortInput, Close, Exit } from "@carbon/icons-react";
import { ElectionModal } from "../../components/election-modal";
import { get, post } from "../../utils/fetch";
import { Cards } from "../../components/cards";

interface Society {
  societyId: number;
  name: string;
  description: string;
}

export const Society = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [modalContext, setModalContext] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formEnabled, setFormEnabled] = useState(true);
  const [selectedJoinSociety, setSelectedJoinSociety] = useState<number | null>(
    null
  );
  const [selectedLeaveSociety, setSelectedLeaveSociety] = useState<
    number | null
  >(null);
  const [getAllResult, setGetAllResult] = useState<Society[] | null>([]);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[] | null>([]);
  const [leaveSocieties, setLeaveSocieties] = useState<number | null>(null);
  const [joinSearch, setJoinSearch] = useState("");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [filteredLeaveSocieties, setFilteredLeaveSocieties] = useState<
    Society[]
  >([]);
  const [filteredJoinSocieties, setFilteredJoinSocieties] = useState<Society[]>(
    []
  );
  const voterId = localStorage.getItem("USER_ID");

  const joinSocietyHandler = async (societyId: number) => {
    setSelectedJoinSociety(societyId);
  };

  const leaveSocietyHandler = async (societyId: number) => {
    setLeaveSocieties(societyId);
  };

  const searchLeaveHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLeaveSearch(event.target.value);
  };
  const searchJoinHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJoinSearch(event.target.value);
  };

  useEffect(() => {
    const filterLeaveSocieties = () => {
      if (leaveSearch) {
        const filtered = joinedSocieties!.filter(society =>
          society.name.toLowerCase().includes(leaveSearch.toLowerCase())
        );
        setFilteredLeaveSocieties(filtered);
      } else {
        setFilteredLeaveSocieties(joinedSocieties!);
      }
    };
    filterLeaveSocieties();
  }, [leaveSearch, getAllResult]);

  useEffect(() => {
    const filterJoinSocieties = () => {
      if (joinSearch) {
        const filtered = joinedSocieties!.filter(society =>
          society.name.toLowerCase().includes(joinSearch.toLowerCase())
        );
        setFilteredJoinSocieties(filtered);
      } else {
        setFilteredJoinSocieties(joinedSocieties!);
      }
    };
    filterJoinSocieties();
  }, [joinSearch, getAllResult]);

  const joinSociety = async () => {
    if (selectedJoinSociety != null) {
      try {
        const formData = new FormData();

        const voterId = localStorage.getItem("USER_ID");
        formData.append("voterId", voterId!.toString());
        formData.append("societyId", selectedJoinSociety!.toString());

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
        setSelectedJoinSociety(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const leaveSociety = async () => {
    if (leaveSocieties !== null) {
      try {
        const response = await post(
          `society/leave/${leaveSocieties}/${voterId}`
        );
        await setStateBasedOnResponse(response);
        const updatedSocieties = joinedSocieties!.filter(
          society => society.societyId !== leaveSocieties
        );
        setJoinedSocieties(updatedSocieties);
        await setStateBasedOnResponse(response);
        setSelectedLeaveSociety(null);
      } catch (error) {
        console.log(error);
      }
    }
    setLeaveSocieties(null);
  };

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
    } catch (error) {
      console.log(`Error when retrieving all society data: ${error}`);
    }
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

    const response = await post("society/create", body);
    await setStateBasedOnResponse(response);
    setFormEnabled(true);
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

  useEffect(() => {
    (async () => {
      try {
        await joinSociety();
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })();
  }, [selectedJoinSociety]);

  useEffect(() => {
    (async () => {
      try {
        await leaveSociety();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [leaveSocieties, voterId, joinedSocieties]);

  const toggleModal = () => {
    setModal(!modal);
  };

  return (
    <AuthenticatedRoute>
      <div className={styles.container}>
        <main>
          <div>
            <Stack>
              <div className={styles.notification}>
                {success && (
                  <InlineNotification title={success} kind="success" />
                )}
                {error && <InlineNotification title={error} />}
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
                      setModalContext("createSociety");
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
                />
                <div className={styles.join}>
                  <div className={styles.cardContainer}>
                    {filteredJoinSocieties &&
                      filteredJoinSocieties.map(society => (
                        <Cards
                          name={society.name}
                          key={society.societyId}
                          description={society.description}
                        >
                          <Button
                            onClick={() =>
                              joinSocietyHandler(society.societyId)
                            }
                            renderIcon={PortInput}
                          >
                            Join
                          </Button>
                        </Cards>
                      ))}
                  </div>
                </div>
              </div>

              <div className={styles.content}>
                <div className={styles.header}>
                  <h2>Leave a society</h2>
                </div>
                <Search
                  labelText={"Search to leave society"}
                  value={leaveSearch}
                  onChange={searchLeaveHandler}
                  className={styles.search}
                />
                <div className={styles.leave}>
                  <div className={styles.cardContainer}>
                    {filteredLeaveSocieties &&
                      filteredLeaveSocieties.map(society => (
                        <Cards
                          name={society.name}
                          key={society.societyId}
                          description={society.description}
                        >
                          <Button
                            onClick={() => {
                              setModal(!modal);
                              setModalContext("leaveSociety");
                              setSelectedLeaveSociety(society.societyId);
                            }}
                            renderIcon={Exit}
                            kind={"danger"}
                          >
                            Leave
                          </Button>
                        </Cards>
                      ))}
                  </div>
                </div>
              </div>
            </Stack>
          </div>
          <ElectionModal modal={modal}>
            {modalContext === "leaveSociety" && (
              <div>
                <p>
                  You are about to leave this society. You can join back at any
                  time from the societies page.
                </p>
                <Button renderIcon={Close} onClick={() => setModal(!modal)}>
                  Close
                </Button>
                <Button
                  renderIcon={PortInput}
                  kind={"danger"}
                  onClick={() => {
                    setModal(!modal);
                    leaveSocietyHandler(selectedLeaveSociety!);
                  }}
                >
                  Confirm
                </Button>
              </div>
            )}
            {modalContext === "createSociety" && (
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
                  <TextInput
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
