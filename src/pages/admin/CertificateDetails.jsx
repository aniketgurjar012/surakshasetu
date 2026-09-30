import {
  useEffect,
  useState
} from "react";

import {
  BadgeCheck,
  ShieldX
} from "lucide-react";

import {useParams} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";
import {getModule} from "../../data/modules";

export default function CertificateDetails(){
  const {lang,t,formatDate}=useApp();
  const {id}=useParams();

  const [cert,setCert]=useState(null);
  const [worker,setWorker]=useState(null);

  async function load(){
    const {data}=await supabase
      .from("certificates")
      .select("*")
      .eq("id",id)
      .single();

    setCert(data);

    if(data){
      const {data:w}=await supabase
        .from("profiles")
        .select(
          "name,public_id,sector"
        )
        .eq("id",data.worker_id)
        .single();

      setWorker(w);
    }
  }

  useEffect(()=>{
    load();
  },[id]);

  async function revoke(){
    if(!confirm(
      t("certificateRevokeConfirm")
    ))return;

    const {error}=await supabase
      .from("certificates")
      .update({
        revoked:true,
        revoked_at:
          new Date().toISOString()
      })
      .eq("id",id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  if(!cert){
    return (
      <div className="loader-page">
        <div className="spinner"/>
      </div>
    );
  }

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow={t("certificate").toUpperCase()}
          title={cert.certificate_no}
          description={t("originalCertificateRecord")}
        >
          {!cert.revoked&&(
            <button
              className="admin-danger"
              onClick={revoke}
            >
              <ShieldX/>
              {t("revoke")} {t("certificate")}
            </button>
          )}
        </AdminHeader>

        <section
          className={
            cert.revoked
              ?"admin-certificate-card revoked"
              :"admin-certificate-card"
          }
        >
          {cert.revoked
            ?<ShieldX/>
            :<BadgeCheck/>}

          <span>
            SURAKSHASETU
          </span>

          <h1>
            {t("certificateOfCompletion")}
          </h1>

          <p>
            {t("awardedTo")}
          </p>

          <h2>
            {worker?.name}
          </h2>

          <p>
            {t("workerId")}:
            {" "}
            {worker?.public_id}
          </p>

          <h3>
            {getModule(cert.module_id)?.title?.[lang]||cert.module_id}
          </h3>

          <div className="certificate-admin-info">
            <div>
              <span>{t("score")}</span>
              <b>
                {Math.round(cert.score)}%
              </b>
            </div>

            <div>
              <span>{t("issued")}</span>
              <b>
                formatDate(cert.issued_at)
              </b>
            </div>

            <div>
              <span>{t("status")}</span>
              <b>
                {cert.revoked
                  ?t("revoked").toUpperCase()
                  :t("verified").toUpperCase()}
              </b>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}