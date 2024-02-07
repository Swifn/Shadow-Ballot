import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "./style.module.scss";
import React from "react";
import { Button } from "@carbon/react";
import { PortInput } from "@carbon/icons-react";
import { Cards } from "../../components/cards";
import { VoteModalCards } from "../../components/vote-modal";
import { InfoCards } from "../../components/info-cards";
import { useNavigate } from "react-router-dom";
import { Routes } from "../index";

export const Landing = () => {
  const navigate = useNavigate();

  const navigateSocietyHandler = () => {
    navigate(Routes.SOCIETY_CREATE());
  };
  const navigateElectionHandler = () => {
    navigate(Routes.ELECTION());
  };
  const navigateVoteHandler = () => {
    navigate(Routes.VOTE());
  };

  return (
    <AuthenticatedRoute>
      <div>
        <Helmet>
          <title>AVS Chain</title>
        </Helmet>
        <div className={styles.mainContainer}>
          <div className={styles.intro}>
            <h1>AVS Chain</h1>
            <p>
              The anonymous voting system for your university <br />
            </p>
          </div>
          <div className={styles.middle}>
            <div className={styles.societyContainer}>
              <div className={styles.society}>
                <h1>Society</h1>
                <Button onClick={navigateSocietyHandler} renderIcon={PortInput}>
                  Go to Societies
                </Button>
              </div>
            </div>
            <div className={styles.electionContainer}>
              <div className={styles.election}>
                <h1>Election</h1>
                <Button
                  onClick={navigateElectionHandler}
                  renderIcon={PortInput}
                >
                  Go to Elections
                </Button>
              </div>
            </div>
          </div>
          <div className={styles.howContainer}>
            <h1>How it works</h1>

            <div className={styles.how}>
              <h2>As as host</h2>
              <InfoCards>
                <h3>Create a society</h3>
                <p>
                  You can create a society by visiting the create a society page
                </p>
              </InfoCards>{" "}
              <InfoCards>
                <h3>Create an election</h3>
                <p>
                  All management of elections is done through the the profile
                  page. Here, you can create an election and add candidates.
                </p>
              </InfoCards>{" "}
              <InfoCards>
                <h3>Management</h3>
                <p>
                  While you're on the profile page, you can also manage all the
                  elections and societies you have created. This includes
                  editing societies, and opening and closing elections
                </p>
              </InfoCards>
            </div>
            <div className={styles.how}>
              <h2>As as voter</h2>
              <InfoCards>
                <h3>Join a Society</h3>
                <p>
                  In order to be an eligible voter, you need to be a member of a
                  society before the election has been created
                </p>
              </InfoCards>{" "}
              <InfoCards>
                <h3>Elections</h3>
                <p>
                  You can view all the elections that are both open and closed,
                  if you are not eligible to vote, or if you are not a member of
                  a society.
                </p>
              </InfoCards>{" "}
              <InfoCards>
                <h3>Voting</h3>
                <p>
                  On the votes page, you can see all the elections that are open
                  and you are eligible to vote in. You can vote for a candidate
                  by clicking on an election and pressing the vote button
                </p>
              </InfoCards>
            </div>
          </div>

          <div className={styles.third}>
            <h1>Vote</h1>
            <Button onClick={navigateVoteHandler} renderIcon={PortInput}>
              Go to Voting
            </Button>
          </div>
        </div>
      </div>
    </AuthenticatedRoute>
  );
};
