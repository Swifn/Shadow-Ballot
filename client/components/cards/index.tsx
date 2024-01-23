import React from "react";
import styles from "./style.module.scss";
import { Button } from "@carbon/react";
import { PortInput } from "@carbon/icons-react";

export const Cards = ({
  profilePicture = "./client/assets/bg.jpg",
  name,
  description,
  button,
  eventHandler,
  icon,
}) => {
  return (
    <div className={styles.card}>
      <img src={profilePicture} alt="" />
      <div className={styles.cardContent}>
        <h3>{name}</h3>
        <p>{description}</p>
        <Button
          onClick={eventHandler}
          className={styles.button}
          renderIcon={icon}
          type="submit"
        >
          {button}
        </Button>
      </div>
    </div>
  );
};
