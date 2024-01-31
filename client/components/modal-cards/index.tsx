import React from "react";
import styles from "./style.module.scss";
import { Cards } from "../cards";

export const ElectionModalCards = ({
  children,
  cardChildren,
  modal,
  cardContents,
}) => {
  return (
    <>
      {modal && (
        <div className={styles.modal}>
          <div className={styles.overlay}>
            <div className={styles.modalContent}>
              <div className={styles.cardContainer}>
                {cardContents &&
                  cardContents.map(contents => (
                    <Cards
                      name={contents.candidateName}
                      key={contents.candidateAlias}
                      description={contents.description}
                    >
                      {cardChildren}
                    </Cards>
                  ))}
              </div>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
