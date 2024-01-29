import { Helmet } from "react-helmet";
import { AuthenticatedRoute } from "../../components/conditional-route";
import styles from "../society/style.module.scss";
import { Button, InlineNotification, Stack, TextInput } from "@carbon/react";
import { PortInput } from "@carbon/icons-react";
import React, { FormEvent, useRef, useState } from "react";
import { get, post } from "../../utils/fetch";
import { Routes } from "../index";
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
