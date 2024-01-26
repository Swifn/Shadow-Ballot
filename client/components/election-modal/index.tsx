import React from "react";
import styles from "./style.module.scss";
import { Button, TextInput } from "@carbon/react";

interface buttonConfig {
  label: string;
  eventHandler: () => void;
  icon?: React.ElementType;
  kind: React.ElementType;
}

interface inputConfig {
  label: string;
  type: string;
  name: string;
  required: boolean;
}

export const ElectionModal = ({
  modal,
  buttons,
  inputs,
  form,
  submit,
  modalheader,
}) => {
  return (
    <>
      {modal && (
        <div className={styles.modal}>
          <div className={styles.overlay}>
            <div className={styles.modalContent}>
              <h3>{modalheader}</h3>
              <form ref={form} onSubmit={submit}>
                {inputs.map((inputConfig, index) => (
                  <TextInput
                    id={index}
                    labelText={inputConfig.label}
                    type={inputConfig.type}
                    name={inputConfig.name}
                    className={styles.input}
                    required={inputConfig.required}
                  />
                ))}
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
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
