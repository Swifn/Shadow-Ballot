import styles from "./style.module.scss";
import { Cards } from "../cards";
import { Button } from "@carbon/react";
import { PortInput } from "@carbon/icons-react";
import React, { useEffect, useState } from "react";
import { get } from "../../utils/fetch";

export const BentoGrid = ({ children }) => {
  const [members, setMembers] = useState<number>();
  const [society, setSociety] = useState<number>();
  const [elections, setElections] = useState<number>();

  const bentoGridInformation = async () => {
    try {
      const response = await get("auth/bento-grid-information").then(res =>
        res.json()
      );

      setMembers(response.memberNumber);
      setSociety(response.societyNumber);
      setElections(response.electionNumber);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await bentoGridInformation();
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);
  return (
    <div className={styles.bentoGridWrapper}>
      <div className={styles.bentoGrid1}>
        <p> </p>
        <img src="/client/assets/React-icon.png" alt="" />
      </div>
      <div className={styles.bentoGrid2}>
        <img src="/client/assets/Typescript.png" alt="" />
      </div>
      <div className={styles.bentoGrid3}>
        <img src="/client/assets/sequelize.png" alt="" />
      </div>
      <div className={styles.bentoGrid4}>
        <h4>
          Developed by <span className={styles.text}>Anthony Barhpagga </span>
          for the <span className={styles.text}>Final Year Project</span> at the
          <span className={styles.text}> University of Birmingham </span> as
          part of the
          <span className={styles.text}> BSc Computer Science </span> programme
        </h4>
      </div>
      <div className={styles.bentoGrid5}>
        <h2>
          <span className={styles.text}>K-anonymity</span> to maintain voting
          integrity
        </h2>
      </div>
      <div className={styles.bentoGrid6}>
        <Cards
          name={"Your society"}
          societySubject={"Subject"}
          profilePicture={"client/assets/tonythetiger.jpeg"}
        >
          <Button renderIcon={PortInput} disabled size={"sm"}>
            View your Society
          </Button>
        </Cards>
      </div>
      <div className={styles.bentoGrid7}>{children}</div>
      <div className={styles.bentoGrid8}>
        <div className={styles.whoIsInvolved}>
          <h4>See who's involved in the society</h4>
          <img src={"/client/assets/defaultMemberImage.jpeg"} alt={"member"} />
          <h5>Manager</h5>
          <h6>Anthony</h6>
          <span>Tony</span>
        </div>
      </div>
      <div className={styles.bentoGrid9}>
        <div>
          <p>There are currently {members} active users</p>
          <p>{society} active societies</p>
          <p>and {elections} different elections</p>
        </div>
      </div>
      <div className={styles.bentoGrid10}>
        <p>No personal information stored</p>
      </div>
      <div className={styles.bentoGrid11}>
        <p>
          An <span className={styles.text}>anonymous voting system </span>
          for all your university needs
        </p>
      </div>
      <div className={styles.bentoGrid12}>
        <h3>
          <span className={styles.text}>Websockets</span> for life notifications
        </h3>
      </div>
      <div className={styles.bentoGrid13}>
        <div className={styles.timeLineContainer}>
          <div className={styles.timeLinePoint}>
            <div className={styles.timeLineDate}>Nov 2022</div>
            <div className={styles.timeLineInfo}>
              <h3>Phase 1</h3>
              <p>Project kickoff and initial development.</p>
            </div>
          </div>
          <div className={styles.timeLinePoint}>
            <div className={styles.timeLineDate}>May 2024</div>
            <div className={styles.timeLineInfo}>
              <h3>Phase 2</h3>
              <p>Alpha testing</p>
            </div>
          </div>
          <div className={styles.timeLinePoint}>
            <div className={styles.timeLineDate}>April 2024</div>
            <div className={styles.timeLineInfo}>
              <h3>Phase 2</h3>
              <p>Project deployment and submission</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bentoGrid14}>
        <h2>
          <span className={styles.text}>Election scheduling</span> using
          <span className={styles.text}> Cron</span> to make life easier
        </h2>
      </div>
    </div>
  );
};
