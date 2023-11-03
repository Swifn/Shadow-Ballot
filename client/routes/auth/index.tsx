import { Helmet } from "react-helmet";
import styles from "./style.module.scss";
import { Outlet } from "react-router-dom";

export const Auth = () => {
  return (
    <>
      <Helmet>
        <title>SVS Chain</title>
      </Helmet>
      <div className={styles.container}>
        <main>
          <h1>SVS Chain</h1>
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};
