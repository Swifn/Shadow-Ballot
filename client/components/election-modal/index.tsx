import React from "react";
import styles from "./style.module.scss";

export const ElectionModal = ({ modal, children }) => {
  return (
    <>
      {modal && (
        <div className={styles.modal}>
          <div className={styles.overlay}>
            <div className={styles.modalContent}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
};
