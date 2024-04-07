import React from "react";
import styles from "./style.module.scss";

export const InfoCards = ({ children }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>{children}</div>
    </div>
  );
};
