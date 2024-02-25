import styles from "./style.module.scss";
import { Cards } from "../cards";
import { Button } from "@carbon/react";
import { PortInput } from "@carbon/icons-react";
import React from "react";

export const BentoGrid = ({ children }) => {
  return (
    <div className={styles.bentoGridWrapper}>
      <div className={styles.bentoGrid1}>
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
          profilePicture={"/client/assets/tonythetiger.jpeg"}
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
      <div className={styles.bentoGrid9}>9</div>
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
