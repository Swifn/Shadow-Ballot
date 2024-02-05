import React from "react";
import styles from "./style.module.scss";

export const Cards = ({
  profilePicture = "/client/assets/bg.jpg",
  name,
  description,
  children,
  alias,
}) => {
  return (
    <div className={styles.card}>
      <img src={profilePicture} alt="" />
      <div className={styles.cardContent}>
        <h3>{name}</h3>
        {alias && <h6>AKA: {alias}</h6>}
        <p>{description}</p>
        <div className={styles.buttonContainer}>{children}</div>
      </div>
    </div>
  );
};
