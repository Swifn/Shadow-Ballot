import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import { Button, InlineNotification, Stack } from "@carbon/react";
import React, { useEffect, useState } from "react";
import { TabComponent } from "../../components/tabs";
import { get, post } from "../../utils/fetch";
import { Cards } from "../../components/cards";
import { Close, PortInput, View } from "@carbon/icons-react";
import { ElectionModalCards } from "../../components/modal-cards";
import { VoteModalCards } from "../../components/vote-modal";
import { Helmet } from "react-helmet";

interface Elections {
  electionId: number;
  name: string;
  societyId: number;
  description: string;
}

interface electionCandidates {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  description: string;
}

export const Vote = () => {
  const [getOpenElections, setGetOpenElections] = useState<Elections[] | null>(
    []
  );
  const [getClosedElections, setGetClosedElections] = useState<
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
  const [modal, setModal] = useState(false);

  const voterId = localStorage.getItem("USER_ID");

  const voteHandler = (candidateId: number) => {
    setSelectedCandidate(candidateId);
  };

  const setStateBasedOnResponse = async response => {
    const responseMessage = (await response).message;
    if (response.ok) {
      setSuccess(responseMessage);
      setError(null);
    } else {
      setSuccess(null);
      setError(responseMessage);
    }
  };

  useEffect(() => {
    const vote = async () => {
      if (selectedCandidate !== null) {
        try {
          const response = await post(
            `vote/election/${selectedElection}/voter/${voterId}/candidate/${selectedCandidate}`
          ).then(res => res.json());
          await setStateBasedOnResponse(response);
        } catch (error) {
          console.log(error);
        }
      }
    };
    vote();
  }, [selectedCandidate, selectedElection, voterId]);

  useEffect(() => {
    const fetchAllElections = async () => {
      try {
        const response = await get(`vote/get-open-elections/${voterId}`).then(
          res => res.json()
        );
        const validElections = response.openElections.filter(
          item => item.Society !== null
        );
        const sortedElections = validElections
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
        const validElections = response.closedElections.filter(
          item => item.Society !== null
        );
        const sortedElections = validElections
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

          setGetElectionCandidates(response.ElectionCandidates);
          //setSelectedElection(null);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchAllElections();
  }, [voterId, selectedElection]);

  const viewCandidateHandler = async (electionId: number | null) => {
    setModal(!modal);
    setSelectedElection(electionId);
  };

  const toggleModal = () => {
    setGetElectionCandidates(null);
    setSelectedCandidate(null);
    setModal(!modal);
  };

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Vote</title>
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
        <div className={styles.container}>
          <main>
            <div>
              <Stack gap={8}>
                <TabComponent
                  tabListNames={[
                    {
                      name: "Open Elections",
                    },
                    {
                      name: "Close Elections",
                    },
                    {
                      name: "Elections you've participated in",
                    },
                  ]}
                  tabContents={[
                    <>
                      <h1>Open Elections</h1>
                      <div className={styles.cardContainer}>
                        {getOpenElections &&
                          getOpenElections.map(elections => (
                            <Cards
                              name={elections.name}
                              key={elections.electionId}
                              description={elections.description}
                            >
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
                            {getElectionCandidates &&
                              getElectionCandidates.map(elections => (
                                <Cards
                                  name={elections.candidateName}
                                  key={elections.candidateId}
                                  description={elections.description}
                                >
                                  <Button
                                    renderIcon={PortInput}
                                    onClick={() =>
                                      voteHandler(elections.candidateId)
                                    }
                                  >
                                    Vote
                                  </Button>
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
                      <h1>Close Elections</h1>
                      <div className={styles.cardContainer}>
                        {getClosedElections &&
                          getClosedElections.map(elections => (
                            <Cards
                              name={elections.name}
                              key={elections.electionId}
                              description={elections.description}
                            >
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
                      <h1>Participated Elections</h1>
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
