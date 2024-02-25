import React from "react";
import styles from "./style.module.scss";
interface props {
  name: string;
  alias?: string;
  description?: string;
  societySubject?: string;
  profilePicture?: string;
  society?: string;
  children: React.ReactNode;
}

export const Cards: React.FC<props> = ({
  profilePicture = "/client/assets/bg.jpg",
  name,
  description,
  societySubject,
  children,
  alias,
  society,
}) => {
  return (
    <div className={styles.card}>
      {society && <h4 className={styles.society}>{society}</h4>}
      <img src={`${profilePicture}`} alt="" />
      <div className={styles.cardContent}>
        <h3>{name}</h3>
        {societySubject && <h5>{societySubject}</h5>}
        {alias && <h6>AKA: {alias}</h6>}
        <p>{description}</p>
        <div className={styles.buttonContainer}>{children}</div>
      </div>
    </div>
  );
};
