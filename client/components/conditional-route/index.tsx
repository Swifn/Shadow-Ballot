import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "../../state/user-state";
import { Routes } from "../../routes";

export const AuthenticatedRoute = ({ children }: { children: JSX.Element }) => {
  const voter = useRecoilValue(userState);
  return voter ? children : <Navigate to={Routes.AUTH_SIGN_IN()} replace />;
};

export const AnonymousRoute = ({ children }: { children: JSX.Element }) => {
  const voter = useRecoilValue(userState);
  return voter ? (
    <Navigate to={Routes.VOTER(voter.voterId.toString())} replace />
  ) : (
    children
  );
};

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const voter = useRecoilValue(userState);
  if (!voter) return <Navigate to={Routes.AUTH_SIGN_IN()} replace />;
  return voter.admin ? (
    children
  ) : (
    <Navigate to={Routes.VOTER(voter.voterId.toString())} replace />
  );
};
