import "./App.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Routes as Index } from "./routes";
import { RecoilRoot } from "recoil";
import { Suspense } from "react";
import { Auth } from "./routes/auth";
import { SignIn } from "./routes/auth/sign-in";
import { SignUp } from "./routes/auth/sign-up";
import { NotFound } from "./routes/not-found";

function App() {
  return (
    <RecoilRoot>
      {}
      <Suspense fallback={"loading"}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />}>
              <Route path="/" element={<SignIn />} />
            </Route>
            <Route path={Index.AUTH()} element={<Auth />} />
            <Route path={Index.AUTH_SIGN_UP()} element={<SignUp />} />
            <Route path={Index.AUTH_SIGN_IN()} element={<SignIn />} />
            <Route path={Index.AUTH()} element={<SignIn />} />
            <Route path={Index.NOT_FOUND()} element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </RecoilRoot>
  );
}

export default App;
