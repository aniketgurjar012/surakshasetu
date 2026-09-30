import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Award,
  Eye,
  Search,
  ShieldX
} from "lucide-react";

import {useNavigate} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";
import {getModule} from "../../data/modules";

export default function Certificates(){
  const {lang,t,formatDate}=useApp();
  const nav=useNavigate();

  const [certs,setCerts]=useState([]);
  const [workers,setWorkers]=useState({});
  const [search,setSearch]=useState("");

  async function load(){
    const [c,p]=await Promise.all([
      supabase
        .from("certificates")
        .select("*")
        .eq("admin_hidden",false)
        .order("issued_at",{ascending:false}),

      supabase
        .from("profiles")
        .select("id,name,public_id")
        .eq("role","worker")
    ]);

    setCerts(c.data||[]);

    setWorkers(
      Object.fromEntries(
        (p.data||[]).map(x=>[
          x.id,
          x
        ])
      )
    );
  }

  useEffect(()=>{
    load();

    const channel=supabase
      .channel("admin-certificates-live")
      .on(
        "postgres_changes",
        {
          event:"*",
          schema:"public",
          table:"certificates"
        },
        load
      )
      .subscribe();

    return ()=>{
      supabase.removeChannel(channel);
    };
  },[]);

  const filtered=useMemo(()=>{
    const query=
      search.trim().toLowerCase();

    if(!query)return certs;

    return certs.filter(cert=>{
      const worker=
        workers[cert.worker_id];

      return (
        cert.certificate_no
          ?.toLowerCase()
          .includes(query)||
        worker?.name
          ?.toLowerCase()
          .includes(query)||
        worker?.public_id
          ?.toLowerCase()
          .includes(query)
      );
    });
  },[certs,workers,search]);

  async function revoke(cert){
    if(cert.revoked)return;

    if(!confirm(
      `${cert.certificate_no}: ${t("certificateRevokeConfirm")}`
    ))return;

    const {error}=await supabase
      .from("certificates")
      .update({
        revoked:true,
        revoked_at:
          new Date().toISOString()
      })
      .eq("id",cert.id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow={t("certificates").toUpperCase()}
          title={t("issuedCertificates")}
          description={t("searchCertificates")}
        />

        <div className="admin-search certificate-search">
          <Search/>

          <input
            value={search}
            onChange={e=>
              setSearch(e.target.value)
            }
            placeholder={t("searchCertificates")}
          />
        </div>

        <div className="admin-result-count">
          {filtered.length}
          {" "}
          {filtered.length===1?t("oneCertificateFound"):t("certificateCount")}
        </div>

        <section className="admin-panel">
          {!filtered.length?(
            <AdminEmptyState
              text={t("noCertificates")}
            />
          ):(
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("certificateId")}</th>
                    <th>{t("worker")}</th>
                    <th>{t("workerId")}</th>
                    <th>{t("module")}</th>
                    <th>{t("score")}</th>
                    <th>{t("status")}</th>
                    <th>{t("issued")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(cert=>{
                    const worker=
                      workers[cert.worker_id];

                    return (
                      <tr key={cert.id}>
                        <td>
                          <strong>
                            {cert.certificate_no}
                          </strong>
                        </td>

                        <td>
                          {worker?.name||t("user")}
                        </td>

                        <td>
                          {worker?.public_id||"—"}
                        </td>

                        <td>
                          {getModule(cert.module_id)?.title?.[lang]||cert.module_id}
                        </td>

                        <td>
                          {Math.round(cert.score)}%
                        </td>

                        <td>
                          <span
                            className={
                              cert.revoked
                                ?"admin-badge danger"
                                :"admin-badge success"
                            }
                          >
                            {cert.revoked
                              ?t("revoked")
                              :t("verified")}
                          </span>
                        </td>

                        <td>
                          {formatDate(cert.issued_at)}
                        </td>

                        <td>
                          <div className="admin-row-actions">
                            <button
                              className="admin-icon"
                              title={t("view")}
                              aria-label={t("view")}
                              onClick={()=>
                                nav(
                                  `/admin/certificates/${cert.id}`
                                )
                              }
                            >
                              <Eye/>
                            </button>

                            {!cert.revoked&&(
                              <button
                                className="admin-icon danger"
                                title={t("revoke")}
                                aria-label={t("revoke")}
                                onClick={()=>
                                  revoke(cert)
                                }
                              >
                                <ShieldX/>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}