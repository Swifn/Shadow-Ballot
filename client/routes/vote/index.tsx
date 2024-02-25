import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../vote/style.module.scss";
import { Button, InlineNotification, Stack } from "@carbon/react";
import React, { useEffect, useState } from "react";
import { TabComponent } from "../../components/tabs";
import { get, post } from "../../utils/fetch";
import { Cards } from "../../components/cards";
import { Close, PortInput, View } from "@carbon/icons-react";
import { ElectionModalCards } from "../../components/modal-cards";
import { VoteModalCards } from "../../components/vote-modal";
import { Helmet } from "react-helmet";
import { LiveVotes } from "../../components/live-votes";
import { ElectionModal } from "../../components/election-modal";
import { parseISO, format } from "date-fns";

interface Elections {
  electionId: number;
  name: string;
  societyId: number;
  description: string;
  start: string;
  end: string;

  ElectionPicture?: { path: string };
}

interface electionCandidates {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  description: string;
}

interface Winner {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  votes?: number;
}

interface Results {
  candidateId: number;
  totalVotes: number;

  candidateName: string;
  candidateAlias: string;
  description?: string;
}

export const Vote = () => {
  const [getOpenElections, setGetOpenElections] = useState<Elections[] | null>(
    []
  );
  const [getResults, setGetResults] = useState<Results[] | null>([]);
  const [getFinishedResults, setGetFinishedResults] = useState<Winner>();
  const [getClosedElections, setGetClosedElections] = useState<
    Elections[] | null
  >([]);
  const [getFinishedElections, setGetFinishedElections] = useState<
    Elections[] | null
  >([]);
  const [getElectionCandidates, setGetElectionCandidates] = useState<
    electionCandidates[] | null
  >([]);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const voterId = localStorage.getItem("USER_ID");

  const voteHandler = (candidateId: number) => {
    setSelectedCandidate(candidateId);
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

  const vote = async () => {
    if (selectedCandidate !== null) {
      try {
        const response = await post(
          `vote/election/${selectedElection}/voter/${voterId}/candidate/${selectedCandidate}`
        );
        if (response.ok) {
          setInfo(
            "Dont worry if you cant see your vote, we're utilising k-anonymity to ensure your vote is kept private."
          );
        }
        await setStateBasedOnResponse(response);
        setSelectedCandidate(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await vote();
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })();
  }, [selectedCandidate, selectedElection, voterId]);

  const fetchData = async () => {
    try {
      const response = await get(`vote/get-open-elections/${voterId}`).then(
        res => res.json()
      );
      const sortedElections = response.openElections
        .map(openElections => openElections.Society.Elections)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name));
      setGetOpenElections(sortedElections);
    } catch (error) {
      console.log(`Error when retrieving open election data: ${error}`);
    }

    try {
      const response = await get(`vote/get-closed-elections/${voterId}`).then(
        res => res.json()
      );
      const sortedElections = response.closedElections
        .map(closedElections => closedElections.Society.Elections)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name));
      setGetClosedElections(sortedElections);
    } catch (error) {
      console.log(`Error when retrieving open election data: ${error}`);
    }

    if (selectedElection != null) {
      try {
        const response = await get(
          `election/getElectionCandidates/${selectedElection}`
        ).then(res => res.json());

        if (response.ElectionCandidates.length === 0) {
          setError("No candidates found for this election, check back later.");
        } else {
          setGetElectionCandidates(response.ElectionCandidates);
          setModal(!modal);
        }

        setGetElectionCandidates(response.ElectionCandidates);
      } catch (error) {
        console.log(error);
      }
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

    try {
      const response = await get(`election/get-finished-elections`).then(res =>
        res.json()
      );
      console.log(response);
      setGetFinishedElections(response.elections);
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    (async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("An error occurred:", error);
      }
    })();
  }, [voterId, selectedElection]);

  const viewCandidateHandler = async (electionId: number | null) => {
    setSelectedElection(electionId);
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Vote</title>
        </Helmet>
        <div className={styles.notification}>
          {error && (
            <InlineNotification onClose={() => setError(null)} title={error} />
          )}
          {success && (
            <InlineNotification
              onClose={() => setSuccess(null)}
              title={success}
              kind="success"
            />
          )}{" "}
          {info && (
            <InlineNotification
              onClose={() => setInfo(null)}
              title={info}
              kind="info"
            />
          )}
        </div>
        <div className={styles.container}>
          <main>
            <div>
              <Stack gap={8}>
                <TabComponent
                  tabListNames={[
                    {
                      name: "Open Votes",
                    },
                    {
                      name: "Upcoming Votes",
                    },
                    {
                      name: "Finished Votes",
                    },
                  ]}
                  tabContents={[
                    <>
                      <h1>Open Votes</h1>
                      <div className={styles.cardContainer}>
                        {getOpenElections &&
                          getOpenElections.map(elections => (
                            <Cards
                              name={elections.name}
                              key={elections.electionId}
                              description={elections.description}
                              profilePicture={elections.ElectionPicture?.path}
                            >
                              <br />
                              <p>
                                This election ends: {""}
                                {format(parseISO(elections.end), "PPPP, p")}
                              </p>
                              <Button
                                renderIcon={View}
                                onClick={() =>
                                  viewCandidateHandler(elections.electionId)
                                }
                              >
                                View Candidates
                              </Button>
                            </Cards>
                          ))}
                        <VoteModalCards modal={modal}>
                          <div className={styles.cardContainer}>
                            {getResults &&
                              getResults.map(results => (
                                <Cards
                                  name={results.candidateName}
                                  key={results.candidateId}
                                  description={results.description}
                                  alias={results.candidateAlias}
                                >
                                  <Button
                                    renderIcon={PortInput}
                                    onClick={() =>
                                      voteHandler(results.candidateId)
                                    }
                                  >
                                    Vote
                                  </Button>
                                  <div className={styles.resultsContainer}>
                                    <LiveVotes>
                                      <p>Total Votes: {results?.totalVotes}</p>
                                    </LiveVotes>
                                  </div>
                                </Cards>
                              ))}
                          </div>
                          <Button
                            onClick={() => toggleModal()}
                            renderIcon={Close}
                            kind={"danger"}
                          >
                            Close
                          </Button>
                        </VoteModalCards>
                      </div>
                    </>,
                    <>
                      <h1>Upcoming Votes</h1>
                      <div className={styles.cardContainer}>
                        {getClosedElections &&
                          getClosedElections.map(elections => (
                            <Cards
                              name={elections.name}
                              key={elections.electionId}
                              description={elections.description}
                              profilePicture={elections.ElectionPicture?.path}
                            >
                              <br />
                              {/*<p>*/}
                              {/*  This election start: {""}*/}
                              {/*  {format(parseISO(elections.start), "PPPP, p")}*/}
                              {/*</p>*/}
                              {/*<br />*/}
                              {/*<p>*/}
                              {/*  This election ends: {""}*/}
                              {/*  {format(parseISO(elections.end), "PPPP, p")}*/}
                              {/*</p>*/}
                              <Button
                                renderIcon={View}
                                onClick={() =>
                                  viewCandidateHandler(elections.electionId)
                                }
                              >
                                View Candidates
                              </Button>
                            </Cards>
                          ))}
                        <ElectionModalCards
                          modal={modal}
                          cardContents={getElectionCandidates}
                        >
                          <Button
                            onClick={() => toggleModal()}
                            renderIcon={Close}
                            kind={"danger"}
                          >
                            Close
                          </Button>
                        </ElectionModalCards>
                      </div>
                    </>,
                    <>
                      <h1>Finished Votes</h1>
                      <div className={styles.cardContainer}>
                        {getFinishedElections &&
                          getFinishedElections.map(elections => (
                            <Cards
                              name={elections.name}
                              key={elections.electionId}
                              description={elections.description}
                              profilePicture={elections.ElectionPicture?.path}
                            >
                              <br />
                              <p>
                                This election ended: {""}
                                {format(parseISO(elections.end), "PPPP, p")}
                              </p>
                              <Button
                                renderIcon={View}
                                onClick={() =>
                                  viewCandidateHandler(elections.electionId)
                                }
                              >
                                View Winner
                              </Button>
                            </Cards>
                          ))}
                        <ElectionModal modal={modal}>
                          <h2>Winner</h2>
                          {getFinishedResults && (
                            <Cards
                              name={getFinishedResults.candidateName}
                              key={getFinishedResults.candidateId}
                              description={getFinishedResults.candidateAlias}
                            >
                              {" "}
                            </Cards>
                          )}
                          <Button
                            renderIcon={Close}
                            onClick={() => setModal(!modal)}
                            kind={"danger"}
                          >
                            Close
                          </Button>
                        </ElectionModal>
                      </div>
                    </>,
                  ]}
                />
              </Stack>
            </div>
          </main>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
