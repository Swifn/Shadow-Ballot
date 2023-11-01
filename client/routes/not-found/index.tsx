import { Helmet } from "react-helmet";
import styles from "./styles.module.scss";

export const NotFound = () => {
  return (
    <>
      <Helmet>
        <div className={styles.container}>
          <h1>404</h1>
          <h2>Not Found</h2>
        </div>
      </Helmet>
    </>
  );
};
