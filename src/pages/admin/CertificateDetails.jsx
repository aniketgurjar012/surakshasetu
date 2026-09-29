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

export default function CertificateDetails(){
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
      "Revoke this certificate?"
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
          eyebrow="CERTIFICATE DETAIL"
          title={cert.certificate_no}
          description="Original issued certificate record."
        >
          {!cert.revoked&&(
            <button
              className="admin-danger"
              onClick={revoke}
            >
              <ShieldX/>
              Revoke Certificate
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
            Certificate of Completion
          </h1>

          <p>
            This certificate was issued to
          </p>

          <h2>
            {worker?.name}
          </h2>

          <p>
            Worker ID:
            {" "}
            {worker?.public_id}
          </p>

          <h3>
            {cert.module_id}
          </h3>

          <div className="certificate-admin-info">
            <div>
              <span>Score</span>
              <b>
                {Math.round(cert.score)}%
              </b>
            </div>

            <div>
              <span>Issued</span>
              <b>
                {new Date(
                  cert.issued_at
                ).toLocaleDateString()}
              </b>
            </div>

            <div>
              <span>Status</span>
              <b>
                {cert.revoked
                  ?"REVOKED"
                  :"VERIFIED"}
              </b>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}