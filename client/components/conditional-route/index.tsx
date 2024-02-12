import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userState } from "../../state/user-state";
import { Routes } from "../../routes";

export const AuthenticatedRoute = ({ children }: { children: JSX.Element }) => {
  const voter = useRecoilValue(userState);
  return voter ? children : <Navigate to={Routes.LANDING()} replace />;
};

export const AnonymousRoute = ({ children }: { children: JSX.Element }) => {
  const voter = useRecoilValue(userState);
  return voter ? <Navigate to={Routes.LANDING()} replace /> : children;
};

export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const voter = useRecoilValue(userState);
  if (!voter) return <Navigate to={Routes.LANDING()} replace />;
  return voter.admin ? children : <Navigate to={Routes.LANDING()} replace />;
};
