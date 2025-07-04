import React from "react";
import { Tab, Tabs, TabList, TabPanels, TabPanel } from "@carbon/react";
import styles from "./style.module.scss";

export const TabComponent = ({ tabListNames, tabContents }) => {
  return (
    <>
      <Tabs>
        <TabList aria-label="List of tabs" className={styles.tabList}>
          {tabListNames.map(tabNames => (
            <Tab key={tabNames.name}>{tabNames.name}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabContents.map((contents, index) => (
            <TabPanel key={index}>{contents}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </>
  );
};
