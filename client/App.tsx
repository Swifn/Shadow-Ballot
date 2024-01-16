import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Routes as Index } from "./routes";
import { RecoilRoot } from "recoil";
import { Suspense } from "react";
import { Admin } from "./routes/admin";
import { Auth } from "./routes/auth";
import { SignIn } from "./routes/auth/sign-in";
import { SignUp } from "./routes/auth/sign-up";
import { Voter } from "./routes/voter";
import { NotFound } from "./routes/not-found";
import { Election } from "./routes/election";
import { PrivacyPolicy } from "./routes/privacy-policy";
import { Society } from "./routes/society";

function App() {
  return (
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
              <Route path={Index.VOTER()} element={<Voter />} />
              <Route path={Index.ELECTION()} element={<Election />} />
              <Route path={Index.SOCIETY()} element={<Society />} />
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
  );
}

export default App;
