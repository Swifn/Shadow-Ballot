import styles from "./style.module.scss";
import { Outlet, useNavigate } from "react-router-dom";
import { Routes } from "../index";
import { AnonymousRoute } from "../../components/conditional-route";
import React from "react";
import { Button, Stack } from "@carbon/react";
import { BentoGrid } from "../../components/bento-grid";

export const Auth = () => {
  const navigate = useNavigate();

  return (
    <AnonymousRoute>
      <div className={styles.container}>
        <BentoGrid>
          <main>
            <h1 className={styles.text}> Shadow Ballot</h1>
            <div>
              <Outlet />
            </div>
            {/*<div className="privacy">*/}
            {/*  <Button*/}
            {/*    kind="ghost"*/}
            {/*    size="md"*/}
            {/*    onClick={navigate.bind(null, Routes.PRIVACY_POLICY())}*/}
            {/*    hidden*/}
            {/*  >*/}
            {/*    Privacy policy*/}
            {/*  </Button>*/}
            {/*</div>*/}
          </main>
        </BentoGrid>
      </div>
    </AnonymousRoute>
  );
};
