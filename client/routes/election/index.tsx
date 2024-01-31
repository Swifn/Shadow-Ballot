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
}

export const Election = () => {
  const [getAllElections, setGetAllElections] = useState<Election[] | null>([]);
  const [getSocietyElections, setGetSocietyElections] = useState<
    Election[] | null
  >([]);
  const [getElectionCandidates, setGetElectionCandidates] = useState<
    electionCandidates[] | null
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<number | null>(null);
  const [modal, setModal] = useState(false);
  const voterId = localStorage.getItem("USER_ID");

  useEffect(() => {
    const fetchAllElections = async () => {
      try {
        const response = await get("election/get-all").then(res => res.json());
        setGetAllElections(response.elections);
        const sortedElections = response.elections.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setGetAllElections(sortedElections);
      } catch (error) {
        console.log(`Error when retrieving all election data: ${error}`);
      }

      try {
        const response = await get(
          `election/get-society-elections/${voterId}`
        ).then(res => res.json());
        const elections = response.societyElections
          .map(societyElection => societyElection.Society.Elections)
          .flat()
          .sort((a, b) => a.name.localeCompare(b.name));
        setGetSocietyElections(elections);
        console.log(elections);
      } catch (error) {
        console.log(error);
      }

      if (selectedElection != null) {
        try {
          const response = await get(
            `election/getElectionCandidates/${selectedElection}`
          ).then(res => res.json());

          setGetElectionCandidates(response.ElectionCandidates);
          console.log(getElectionCandidates);
          setSelectedElection(null);
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchAllElections();
  }, [voterId, selectedElection, getElectionCandidates]);

  const viewCandidateHandler = async (electionId: number | null) => {
    setModal(!modal);
    setSelectedElection(electionId);
    console.log(modal);
  };
  const toggleModal = () => {
    setModal(!modal);
    setSelectedElection(0);
    console.log(modal);
  };

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>Election</title>
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
              <div className={styles.cardContainer}>
                {getAllElections &&
                  getAllElections.map(elections => (
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
              <h1>You Society Elections</h1>
              <div className={styles.cardContainer}>
                {getSocietyElections &&
                  getSocietyElections.map(electionCandidates => (
                    <Cards
                      name={electionCandidates.name}
                      key={electionCandidates.electionId}
                      description={electionCandidates.description}
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
