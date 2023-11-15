import styles from "./style.module.scss";
import { Outlet } from "react-router-dom";
import { AnonymousRoute } from "../../components/conditional-route";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const Auth = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  console.log(publicKey);
  return (
    <AnonymousRoute>
      <div className={styles.container}>
        <main>
          <h1>SVS Chain</h1>
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </AnonymousRoute>
  );
};
