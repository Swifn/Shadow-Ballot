import React, { ReactElement } from "react";
import styles from "./style.module.scss";
import { Button } from "@carbon/react";
import { PortInput } from "@carbon/icons-react";

interface buttonConfig {
  label: string;
  eventHandler: () => void;
  icon?: React.ElementType;
  kind: React.ElementType;
}

export const Cards = ({
  profilePicture = "/client/assets/bg.jpg",
  name,
  description,
  buttons,
}) => {
  return (
    <div className={styles.card}>
      <img src={profilePicture} alt="" />
      <div className={styles.cardContent}>
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="buttonContainer">
          {buttons.map((buttonConfig, index) => (
            <Button
              key={index}
              onClick={buttonConfig.eventHandler}
              className={styles.button}
              renderIcon={buttonConfig.icon}
              kind={buttonConfig.kind}
              type="submit"
            >
              {buttonConfig.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
