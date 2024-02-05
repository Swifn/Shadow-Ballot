import styles from "../live-votes/style.module.scss";
import React from "react";

export const LiveVotes = ({ children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};
