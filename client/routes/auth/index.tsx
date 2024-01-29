import styles from "./style.module.scss";
import { Outlet, useNavigate } from "react-router-dom";
import { Routes } from "../index";
import { AnonymousRoute } from "../../components/conditional-route";
import React from "react";
import { Button, Stack } from "@carbon/react";
import bg from "/client/assets/bg.jpg";

export const Auth = () => {
  const navigate = useNavigate();

  return (
    <AnonymousRoute>
      <div className={styles.container}>
        <main>
          <h1>SVS Chain</h1>
          <div>
            <Stack gap={8}>
              <Outlet />
            </Stack>
          </div>
          <div className="privacy">
            <Button
              kind="ghost"
              size="md"
              onClick={navigate.bind(null, Routes.PRIVACY_POLICY())}
              hidden
            >
              Privacy policy
            </Button>
          </div>
        </main>
      </div>
    </AnonymousRoute>
  );
};
