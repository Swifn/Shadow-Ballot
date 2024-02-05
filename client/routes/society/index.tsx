import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import { Stack } from "@carbon/react";
import React from "react";

import { Outlet, useNavigate } from "react-router-dom";

export const Society = () => {
  const navigate = useNavigate();

  return (
    <AuthenticatedRoute>
      <div className={styles.container}>
        <main>
          <div>
            <Stack gap={8}>
              <Outlet />
            </Stack>
          </div>
          <div className="Create"></div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
};
