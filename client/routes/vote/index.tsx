import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import { Stack } from "@carbon/react";
import React from "react";

export const Vote = () => {
  return (
    <AuthenticatedRoute>
      <div className={styles.container}>
        <main>
          <div>
            <Stack gap={8}>
              <h1>votepage</h1>
            </Stack>
          </div>
          <div className="Create"></div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
};
