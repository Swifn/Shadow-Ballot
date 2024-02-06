import React from "react";
import { Tab, Tabs, TabList, TabPanels, TabPanel } from "@carbon/react";
import styles from "./style.module.scss";

export const TabComponent = ({ tabListNames, tabContents }) => {
  return (
    <>
      <Tabs>
        <TabList aria-label="List of tabs" className={styles.tabList}>
          {tabListNames.map(tabNames => (
            <Tab>{tabNames.name}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabContents.map(contents => (
            <TabPanel>{contents}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </>
  );
};
