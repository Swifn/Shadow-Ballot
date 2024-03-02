import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "./style.module.scss";
import { Button, InlineNotification, Search } from "@carbon/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Close, PortInput } from "@carbon/icons-react";
import { get } from "../../utils/fetch";
import { Cards } from "../../components/cards";
import { Routes } from "../index";
import { VoteModalCards } from "../../components/vote-modal";
import { LiveVotes } from "../../components/live-votes";
import { format, parseISO } from "date-fns";
import { ElectionModal } from "../../components/election-modal";

interface Society {
  Society: {
    societyId: number;
    name: string;
    description: string;
    SocietySubject?: {
      name: string;
    };
    SocietyPicture?: {
      path: string;
    };
  };
}

interface VotedElections {
  Election: {
    electionId: number;
    name: string;
    description: string;
    end: string;
    ElectionPicture?: {
      path: string;
    };
  };
}

interface Results {
  candidateId: number;
  totalVotes: number;

  candidateName: string;
  candidateAlias: string;
  description?: string;
  path?: string;
}

interface Winner {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  path: string;
  votes?: number;
}

export const Landing = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [modalContext, setModalContext] = useState<string | null>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[]>([]);
  const [myElections, setMyElections] = useState<VotedElections[]>([]);
  const [myFinishedElections, setMyFinishedElections] = useState<
    VotedElections[]
  >([]);
  const [mySocietySearch, setMySocietySearch] = useState("");
  const [myElectionSearch, setMyElectionSearch] = useState("");
  const [myFinishedElectionSearch, setMyFinishedElectionSearch] = useState("");
  const [filteredSocieties, setFilteredSocieties] = useState<Society[]>([]);
  const [filteredElections, setFilteredElections] = useState<VotedElections[]>(
    []
  );
  const [filteredFinishedElections, setFilteredFinishedElections] = useState<
    VotedElections[]
  >([]);
  const [getResults, setGetResults] = useState<Results[]>([]);
  const [getFinishedResults, setGetFinishedResults] = useState<Winner>();
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const voterId = localStorage.getItem("USER_ID");

  const mySocietySearchHandler = event => {
    setMySocietySearch(event.target.value);
  };
  const myElectionSearchHandler = event => {
    setMyElectionSearch(event.target.value);
  };
  const myFinishedElectionSearchHandler = event => {
    setMyFinishedElectionSearch(event.target.value);
  };

  const viewCandidateHandler = async (electionId: number) => {
    setSelectedElection(electionId);
    toggleModal();
  };

  const handlePageChange = () => {
    navigate(Routes.SOCIETY());
  };

  const viewSocietyPageHandler = async (societyId: number) => {
    navigate(Routes.SOCIETY_PAGE(societyId.toString()));
  };

  useEffect(() => {
    const filtered = mySocietySearch
      ? joinedSocieties!.filter(society =>
          society.Society.name
            .toLowerCase()
            .includes(mySocietySearch.toLowerCase())
        )
      : joinedSocieties;

    setFilteredSocieties(filtered);
  }, [mySocietySearch, joinedSocieties]);

  useEffect(() => {
    const filtered = myElectionSearch
      ? myElections!.filter(election =>
          election.Election.name
            .toLowerCase()
            .includes(myElectionSearch.toLowerCase())
        )
      : myElections;

    setFilteredElections(filtered);
  }, [myElectionSearch, myElections]);

  useEffect(() => {
    const filtered = myFinishedElectionSearch
      ? myFinishedElections!.filter(election =>
          election.Election.name
            .toLowerCase()
            .includes(myFinishedElectionSearch.toLowerCase())
        )
      : myFinishedElections;

    setFilteredFinishedElections(filtered);
  }, [myFinishedElectionSearch, myFinishedElections]);

  const fetchData = async () => {
    try {
      const allSocieties = await get(`society/get-joined/${voterId}`).then(
        res => res.json()
      );

      setJoinedSocieties(allSocieties.societies);
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await get(`vote/get-voted-in-elections/${voterId}`).then(
        res => res.json()
      );

      setMyElections(response.votedElections);
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await get(
        `vote/get-finished-voted-in-elections/${voterId}`
      ).then(res => res.json());

      setMyFinishedElections(response.votedElections);
    } catch (error) {
      console.log(error);
    }

    if (selectedElection != null) {
      try {
        const response = await get(`vote/results/${selectedElection}`).then(
          res => res.json()
        );
        setGetResults(response);
      } catch (error) {
        console.log(error);
      }
    }

    if (selectedElection != null) {
      try {
        const response = await get(`election/winner/${selectedElection}`).then(
          res => res.json()
        );
        setGetFinishedResults(response.winner);
      } catch (error) {
        console.log(error);
      }
    }
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
  }, [selectedElection, voterId]);

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
                <h1>Home</h1>
              </div>
              <div className={styles.header}>
                <h2>My societies</h2>
              </div>
              <Search
                labelText={"Search for a society"}
                value={mySocietySearch}
                onChange={mySocietySearchHandler}
                className={styles.search}
                placeholder={"Search for a society"}
              />
              <div className={styles.join}>
                <div className={styles.cardContainer}>
                  <div className={styles.outerContainer}>
                    <div className={styles.cardContainer}>
                      {filteredSocieties &&
                        filteredSocieties.map(society => (
                          <Cards
                            name={society.Society.name}
                            key={society.Society.societyId}
                            societySubject={
                              society.Society.SocietySubject?.name
                            }
                            profilePicture={
                              society.Society.SocietyPicture?.path
                            }
                          >
                            <Button
                              onClick={() =>
                                viewSocietyPageHandler(
                                  society.Society.societyId
                                )
                              }
                              renderIcon={PortInput}
                            >
                              View Society
                            </Button>
                          </Cards>
                        ))}
                      {filteredSocieties.length === 0 && (
                        <div className={styles.emptyContainer}>
                          <h2>
                            It looks like you're not in any societies right now,
                            click here to join one!
                          </h2>
                          <Button
                            onClick={handlePageChange}
                            renderIcon={PortInput}
                          >
                            Join a Society
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.header}>
                <h2>My Votes</h2>
              </div>
              <Search
                labelText={"Search for an election"}
                value={myElectionSearch}
                onChange={myElectionSearchHandler}
                className={styles.search}
                placeholder={"Search for a election"}
              />
              <div className={styles.join}>
                <div className={styles.cardContainer}>
                  <div className={styles.outerContainer}>
                    <div className={styles.cardContainer}>
                      {filteredElections.map(elections => (
                        <Cards
                          name={elections.Election.name}
                          key={elections.Election.electionId}
                          description={elections.Election.description}
                          profilePicture={
                            elections.Election.ElectionPicture?.path
                          }
                        >
                          <p>
                            This election ends: {""}
                            {format(
                              parseISO(elections.Election.end),
                              "PPPP, p"
                            )}
                          </p>
                          <Button
                            onClick={() => {
                              viewCandidateHandler(
                                elections.Election.electionId
                              );
                              setModalContext("liveVotes");
                            }}
                            renderIcon={PortInput}
                          >
                            View Election
                          </Button>
                        </Cards>
                      ))}
                      {filteredElections.length === 0 && (
                        <div className={styles.emptyContainer}>
                          <h2>
                            It looks like you've haven't voted in any elections
                            yet, once you have, they'll be displayed here!
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {modalContext === "liveVotes" && (
                <VoteModalCards modal={modal}>
                  <div className={styles.cardContainer}>
                    {getResults &&
                      getResults.map(results => (
                        <Cards
                          name={results.candidateName}
                          key={results.candidateId}
                          description={results.description}
                          alias={results.candidateAlias}
                          profilePicture={results?.path}
                        >
                          <div className={styles.resultsContainer}>
                            <LiveVotes>
                              <p>Total Votes: {results?.totalVotes}</p>
                            </LiveVotes>
                          </div>
                        </Cards>
                      ))}
                  </div>
                  <Button
                    onClick={() => {
                      toggleModal();
                      setSelectedElection(null);
                      setModalContext(null);
                    }}
                    renderIcon={Close}
                    kind={"danger"}
                  >
                    Close
                  </Button>
                </VoteModalCards>
              )}
              <div className={styles.header}>
                <h2>My past votes</h2>
              </div>
              <Search
                labelText={"Search for an election"}
                value={myFinishedElectionSearch}
                onChange={myFinishedElectionSearchHandler}
                className={styles.search}
                placeholder={"Search for a election"}
              />
              <div className={styles.join}>
                <div className={styles.cardContainer}>
                  <div className={styles.outerContainer}>
                    <div className={styles.cardContainer}>
                      {filteredFinishedElections.map(elections => (
                        <Cards
                          name={elections.Election.name}
                          key={elections.Election.electionId}
                          profilePicture={
                            elections.Election.ElectionPicture?.path
                          }
                        >
                          <p>
                            This election ended: {""}
                            {format(
                              parseISO(elections.Election.end),
                              "PPPP, p"
                            )}
                          </p>
                          <Button
                            onClick={() => {
                              viewCandidateHandler(
                                elections.Election.electionId
                              );
                              setModalContext("finishedElections");
                            }}
                            renderIcon={PortInput}
                          >
                            View Winner
                          </Button>
                        </Cards>
                      ))}
                      {filteredFinishedElections.length === 0 &&
                        filteredElections.length === 0 && (
                          <div className={styles.emptyContainer}>
                            <h2>
                              It doesnt look like you've voted in any elections
                            </h2>
                          </div>
                        )}
                      {filteredFinishedElections.length === 0 &&
                        filteredElections.length !== 0 && (
                          <div className={styles.emptyContainer}>
                            <h2>
                              It doesnt look like you've voted in any elections
                              that have finished, once you have, they'll be
                              displayed here!
                            </h2>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              {modalContext === "finishedElections" && (
                <ElectionModal modal={modal}>
                  <h2>Winner</h2>
                  {getFinishedResults && (
                    <Cards
                      name={getFinishedResults.candidateName}
                      key={getFinishedResults.candidateId}
                      description={getFinishedResults.candidateAlias}
                      profilePicture={getFinishedResults.path}
                    >
                      {""}
                    </Cards>
                  )}
                  <Button
                    renderIcon={Close}
                    onClick={() => {
                      toggleModal();
                      setSelectedElection(null);
                      setModalContext(null);
                    }}
                    kind={"danger"}
                  >
                    Close
                  </Button>
                </ElectionModal>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
};
