import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useApp} from "../../context/AppContext";

export default function AdminHeader({
  eyebrow,
  title,
  description,
  back=true,
  children
}){
  const nav=useNavigate();
  const {t}=useApp();

  return (
    <div className="admin-page-head">
      <div>
        {back&&(
          <button
            className="back-inline"
            onClick={()=>nav("/admin")}
          >
            <ArrowLeft/>
            {t("backToDashboard")}
          </button>
        )}

        <span className="admin-eyebrow">
          {eyebrow}
        </span>

        <h1>{title}</h1>

        {description&&<p>{description}</p>}
      </div>

      {children&&(
        <div className="admin-head-actions">
          {children}
        </div>
      )}
    </div>
  );
}