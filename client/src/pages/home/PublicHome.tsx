import { Navigate } from "react-router-dom";

function PublicHome() {
  return <Navigate to="/login" replace />;
}

export default PublicHome;
