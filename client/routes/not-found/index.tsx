import { Helmet } from "react-helmet";
import styles from "./style.module.scss";

export const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found</title>
      </Helmet>
      <div className={styles.container}>
        <h1>404</h1>
        <h2>Not Found</h2>
      </div>
    </>
  );
};
