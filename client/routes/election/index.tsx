import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";
import React, { useEffect, useState } from "react";
import { Button, InlineNotification } from "@carbon/react";
import { Cards } from "../../components/cards";
import styles from "./style.module.scss";
import { get } from "../../utils/fetch";
import { Close, View } from "@carbon/icons-react";
import { TabComponent } from "../../components/tabs";
import { ElectionModalCards } from "../../components/modal-cards";

interface electionCandidates {
  candidateName: string;
  candidateAlias: string;
  description: string;
}
interface Election {
  electionId: number;
  name: string;
  societyId: number;
  description: string;
  electionPicture?: string;
  ElectionPicture?: {
    path: string;
  };
}

export const Election = () => {
  const [getAllElections, setGetAllElections] = useState<Election[] | null>([]);
  const [getSocietyElections, setGetSocietyElections] = useState<
    Election[] | null
  >([]);
  const [getElectionCandidates, setGetElectionCandidates] = useState<
    electionCandidates[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const voterId = localStorage.getItem("USER_ID");

  const fetchData = async () => {
    try {
      const allElectionResponse = await get("election/get-all");
      const sortedElections = (await allElectionResponse.json()).elections.sort(
        (a, b) => a.name.localeCompare(b.name)
      );
      setGetAllElections(sortedElections);

      const societyElectionResponse = await get(
        `election/get-society-elections/${voterId}`
      ).then(res => res.json());
      const sortedSocietyElections = societyElectionResponse.societyElections
        .map(societyElection => societyElection.Society.Elections)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name));
      setGetSocietyElections(sortedSocietyElections);
    } catch (error) {
      console.log(`Error when retrieving all election data: ${error}`);
    }

    if (selectedElection != null) {
      try {
        const response = await get(
          `election/getElectionCandidates/${selectedElection}`
        ).then(res => res.json());
        if (response.ElectionCandidates.length === 0) {
          setError("No candidates found for this election, check back later.");
        } else {
          const sortedCandidates = response.ElectionCandidates.sort((a, b) =>
            a.candidateName.localeCompare(b.candidateName)
          );
          setGetElectionCandidates(sortedCandidates);
          setModal(!modal);
        }
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
    setSelectedElection(null);
  };

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Election</title>
        </Helmet>
        <div className={styles.notification}>
          {error && (
            <InlineNotification title={error} onClose={() => setError(null)} />
          )}
          {success && (
            <InlineNotification
              title={success}
              onClose={() => setSuccess(null)}
              kind="success"
            />
          )}
        </div>
        <TabComponent
          tabListNames={[
            {
              name: "All Elections",
            },
            {
              name: "Your society elections",
            },
          ]}
          tabContents={[
            <>
              <h1>All Elections</h1>
              <div className={styles.container}>
                <div className={styles.cardContainer}>
                  {getAllElections &&
                    getAllElections.map(elections => (
                      <Cards
                        name={elections.name}
                        key={elections.electionId}
                        description={elections.description}
                        profilePicture={elections.electionPicture}
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
              </div>
            </>,
            <>
              <h1>You Society Elections</h1>
              <div className={styles.cardContainer}>
                {getSocietyElections &&
                  getSocietyElections.map(electionCandidates => (
                    <Cards
                      name={electionCandidates.name}
                      key={electionCandidates.electionId}
                      description={electionCandidates.description}
                      profilePicture={electionCandidates.ElectionPicture?.path}
                    >
                      <Button
                        renderIcon={View}
                        onClick={() =>
                          viewCandidateHandler(electionCandidates.electionId)
                        }
                      >
                        View Candidates
                      </Button>
                    </Cards>
                  ))}
              </div>
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
            </>,
          ]}
        />
      </div>
    </AuthenticatedRoute>
  );
};
