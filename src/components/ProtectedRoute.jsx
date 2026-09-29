import {Navigate} from "react-router-dom";
import {useApp} from "../context/AppContext";

export default function ProtectedRoute({role,children}){
  const {session,profile}=useApp();

  if(!session) return <Navigate to="/auth?mode=login" replace/>;
  if(!profile) return <div className="loader-page"><div className="spinner"/></div>;
  if(role && profile.role!==role) {
    return <Navigate to={profile.role==="admin"?"/admin":"/worker"} replace/>;
  }
  return children;
}