import React from "react";
import styles from "./style.module.scss";
import { Cards } from "../cards";
import { Button } from "@carbon/react";

interface electionCandidates {
  candidateId: number;
  candidateName: string;
  candidateAlias: string;
  description: string;
  CandidatePicture?: { path: string };
}
interface ElectionModalCardsProps {
  children: React.ReactNode;
  cardChildren?: React.ReactNode;
  modal: boolean;
  cardContents: electionCandidates[] | null;
  modalContents?: React.ReactNode;
}

export const ElectionModalCards: React.FC<ElectionModalCardsProps> = ({
  children,
  cardChildren,
  modal,
  cardContents,
  modalContents,
}) => {
  return (
    <>
      {modal && modalContents === "electionModalCards" && (
        <div className={styles.modal}>
          <div className={styles.overlay}>
            <div className={styles.modalContent}>
              <div className={styles.cardContainer}>
                {cardContents &&
                  cardContents.map(contents => (
                    <Cards
                      key={contents.candidateId}
                      name={contents.candidateName}
                      alias={contents.candidateAlias}
                      description={contents.description}
                      profilePicture={contents.CandidatePicture?.path}
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
