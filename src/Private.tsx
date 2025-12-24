import { Navigate, useLocation } from "react-router-dom";
import { Store } from "./state/store";
import { JSX } from "react";

function PrivateRoute({ children }: { children: JSX.Element }): JSX.Element {
  const token = Store.getState().auths.token;
  const location = useLocation();

  if (token === null) {
    return <Navigate to={"/login"} state={{ from: location }} replace />;
  }

  return <div>{children}</div>;
}

export default PrivateRoute;
