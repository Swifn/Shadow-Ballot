import React, { useCallback, useState } from "react";
import { Routes } from "../../routes";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  Switcher,
  SwitcherDivider,
  Button,
} from "@carbon/react";

import {
  Home,
  Login,
  Logout,
  Events,
  ThumbsUp,
  Box,
  User,
} from "@carbon/icons-react";

import styles from "./style.module.scss";

import { Switcher as SwitcherIcon } from "@carbon/icons-react";
import { userState } from "../../state/user-state";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";

export const Nav = () => {
  const [user, setUser] = useRecoilState(userState);
  const navigate = useNavigate();

  const signOut = useCallback(() => {
    localStorage.clear();
    setUser(null);
    navigate(Routes.AUTH());
  }, [setUser]);

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="IBM Platform Name">
            <HeaderName prefix="AVS">[Chain]</HeaderName>
            {!user &&
              location.pathname !== Routes.AUTH_SIGN_IN() &&
              location.pathname !== Routes.AUTH_SIGN_UP() && (
                <HeaderGlobalBar aria-label="Sign in">
                  <Button
                    renderIcon={Login}
                    onClick={navigate.bind(null, Routes.AUTH_SIGN_IN())}
                  >
                    Sign in
                  </Button>
                </HeaderGlobalBar>
              )}
            {user && (
              <HeaderGlobalBar>
                <HeaderGlobalAction
                  aria-label={
                    isSideNavExpanded ? "Close switcher" : "Open switcher"
                  }
                  aria-expanded={isSideNavExpanded}
                  isActive={isSideNavExpanded}
                  onClick={onClickSideNavExpand}
                  tooltipAlignment="end"
                  id="switcher-button"
                >
                  <SwitcherIcon size={20} />
                </HeaderGlobalAction>
              </HeaderGlobalBar>
            )}
            <HeaderPanel
              expanded={isSideNavExpanded}
              onHeaderPanelFocus={onClickSideNavExpand}
              href="#switcher-button"
            >
              <Switcher
                aria-label="Switcher Container"
                expanded={isSideNavExpanded}
              >
                <div className={styles.buttonContainer}>
                  <Button
                    className={styles.button}
                    kind={"ghost"}
                    renderIcon={Home}
                    onClick={navigate.bind(null, Routes.LANDING())}
                  >
                    Home
                  </Button>
                  <SwitcherDivider />
                  <Button
                    className={styles.button}
                    kind={"ghost"}
                    renderIcon={Events}
                    onClick={navigate.bind(null, Routes.SOCIETY())}
                  >
                    Societies
                  </Button>
                  <Button
                    className={styles.button}
                    kind={"ghost"}
                    renderIcon={Events}
                    onClick={navigate.bind(null, Routes.SOCIETY_JOIN())}
                  >
                    Join a society
                  </Button>
                  <Button
                    className={styles.button}
                    kind={"ghost"}
                    renderIcon={Events}
                    onClick={navigate.bind(null, Routes.SOCIETY_CREATE())}
                  >
                    Create a society
                  </Button>
                  <SwitcherDivider />
                  <Button
                    className={styles.button}
                    kind={"ghost"}
                    renderIcon={ThumbsUp}
                    onClick={navigate.bind(null, Routes.ELECTION())}
                  >
                    Elections
                  </Button>
                  <Button
                    className={styles.button}
                    kind={"ghost"}
                    renderIcon={Box}
                    onClick={navigate.bind(null, Routes.ELECTION())}
                  >
                    Vote
                  </Button>
                  <Button
                    className={styles.button}
                    kind={"ghost"}
                    renderIcon={User}
                    onClick={navigate.bind(null, Routes.VOTER())}
                  >
                    Profile
                  </Button>
                  <SwitcherDivider />
                  <Button
                    className={styles.button}
                    renderIcon={Logout}
                    onClick={signOut}
                    aria-label="Sign Out"
                    kind={"danger--ghost"}
                  >
                    Sign Out
                  </Button>
                </div>
              </Switcher>
            </HeaderPanel>
          </Header>
        </>
      )}
    />
  );
};
