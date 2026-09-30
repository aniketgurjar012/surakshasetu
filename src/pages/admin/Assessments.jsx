import {useEffect,useMemo,useState} from "react";
import {
  Eye,
  Search,
  Trash2
} from "lucide-react";
import {useNavigate} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";
import {getModule} from "../../data/modules";

export default function Assessments(){
  const {lang,t,formatDateTime}=useApp();
  const nav=useNavigate();

  const [rows,setRows]=useState([]);
  const [workers,setWorkers]=useState({});
  const [search,setSearch]=useState("");

  async function load(){
    const [s,p]=await Promise.all([
      supabase
        .from("submissions")
        .select("*")
        .eq("admin_hidden",false)
        .order("created_at",{ascending:false}),

      supabase
        .from("profiles")
        .select("id,name,public_id")
        .eq("role","worker")
    ]);

    setRows(s.data||[]);

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
  },[]);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase().trim();

    if(!q)return rows;

    return rows.filter(row=>{
      const worker=workers[row.worker_id];

      return (
        worker?.name
          ?.toLowerCase()
          .includes(q)||
        worker?.public_id
          ?.toLowerCase()
          .includes(q)||
        row.module_id
          ?.toLowerCase()
          .includes(q)
      );
    });
  },[rows,workers,search]);

  async function remove(id){
    if(!confirm(
      t("assessmentDeleteConfirm")
    ))return;

    const {error}=await supabase
      .from("submissions")
      .update({admin_hidden:true})
      .eq("id",id);

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
          eyebrow={t("assessmentRecords").toUpperCase()}
          title={t("assessmentHistory")}
          description={t("workerHistoryAdminNote")}
        />

        <div className="admin-search">
          <Search/>

          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder={t("searchWorker")}
          />
        </div>

        <section className="admin-panel">
          {!filtered.length?(
            <AdminEmptyState
              text={t("noAssessments")}
            />
          ):(
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("worker")}</th>
                    <th>{t("workerId")}</th>
                    <th>{t("module")}</th>
                    <th>{t("score")}</th>
                    <th>{t("date")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(row=>{
                    const worker=
                      workers[row.worker_id];

                    return (
                      <tr key={row.id}>
                        <td>
                          {worker?.name||t("user")}
                        </td>

                        <td>
                          {worker?.public_id||"—"}
                        </td>

                        <td>
                          {getModule(row.module_id)?.title?.[lang]||row.module_id}
                        </td>

                        <td>
                          <span
                            className={
                              Number(row.percentage)>=60
                                ?"admin-badge success"
                                :"admin-badge danger"
                            }
                          >
                            {Math.round(
                              row.percentage
                            )}%
                          </span>
                        </td>

                        <td>
                          {formatDateTime(row.created_at)}
                        </td>

                        <td>
                          <div className="admin-row-actions">
                            <button
                              className="admin-icon"
                              title={t("view")}
                              aria-label={t("view")}
                              onClick={()=>
                                nav(
                                  `/admin/assessments/${row.id}`
                                )
                              }
                            >
                              <Eye/>
                            </button>

                            <button
                              className="admin-icon danger"
                              title={t("remove")}
                              aria-label={t("remove")}
                              onClick={()=>remove(row.id)}
                            >
                              <Trash2/>
                            </button>
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