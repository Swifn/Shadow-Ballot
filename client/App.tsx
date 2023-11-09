import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Routes as Index } from "./routes";
import { RecoilRoot } from "recoil";
import { Suspense, useMemo } from "react";
import { Admin } from "./routes/admin";
import { Auth } from "./routes/auth";
import { SignIn } from "./routes/auth/sign-in";
import { SignUp } from "./routes/auth/sign-up";
import { NotFound } from "./routes/not-found";
import { Vote } from "./routes/vote";
import { PrivacyPolicy } from "./routes/privacy-policy";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

function App() {
  // you can use Mainnet, Devnet or Testnet here
  const solNetwork = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(solNetwork), [solNetwork]);
  // initialise all the wallets you want to use
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ solNetwork }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [solNetwork]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <div className="App">
            <RecoilRoot>
              {}
              <Suspense fallback={"loading"}>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Auth />}>
                      <Route path="/" element={<SignIn />} />
                    </Route>
                    <Route path={Index.ADMIN()} element={<Admin />} />
                    <Route path={Index.AUTH()} element={<Auth />}>
                      <Route path={Index.AUTH_SIGN_UP()} element={<SignUp />} />
                      <Route path={Index.AUTH_SIGN_IN()} element={<SignIn />} />
                      <Route path={Index.AUTH()} element={<SignIn />} />
                    </Route>
                    <Route path={Index.VOTE()} element={<Vote />} />
                    <Route
                      path={Index.PRIVACY_POLICY()}
                      element={<PrivacyPolicy />}
                    />
                    <Route path={Index.NOT_FOUND()} element={<NotFound />} />
                    <Route path={"*"} element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </Suspense>
            </RecoilRoot>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
