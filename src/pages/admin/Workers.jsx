import {useEffect,useMemo,useState} from "react";
import {
  Search,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";

export default function Workers(){
  const {t,formatDate}=useApp();

  const [workers,setWorkers]=useState([]);
  const [search,setSearch]=useState("");

  async function load(){
    const {data,error}=await supabase
      .from("profiles")
      .select("*")
      .eq("role","worker")
      .eq("admin_hidden",false)
      .order("created_at",{ascending:false});

    if(error){
      alert(error.message);
      return;
    }

    setWorkers(data||[]);
  }

  useEffect(()=>{
    load();
  },[]);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase().trim();

    if(!q)return workers;

    return workers.filter(x=>
      x.name?.toLowerCase().includes(q)||
      x.public_id?.toLowerCase().includes(q)||
      x.sector?.toLowerCase().includes(q)
    );
  },[workers,search]);

  async function toggle(worker){
    const {error}=await supabase
      .from("profiles")
      .update({active:!worker.active})
      .eq("id",worker.id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  async function remove(worker){
    if(!confirm(`${worker.name}: ${t("workerRemoveConfirm")}`))return;

    const {error}=await supabase
      .from("profiles")
      .update({
        admin_hidden:true,
        active:false
      })
      .eq("id",worker.id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  const title=t("workerManagement");

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow={t("workforce").toUpperCase()}
          title={title}
          description={t("registeredWorkerDesc")}
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
            <AdminEmptyState text={t("noWorkersFound")}/>
          ):(
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("name")}</th>
                    <th>{t("workerId")}</th>
                    <th>{t("sector")}</th>
                    <th>{t("status")}</th>
                    <th>{t("joined")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(worker=>(
                    <tr key={worker.id}>
                      <td>
                        <strong>{worker.name}</strong>
                      </td>

                      <td>{worker.public_id}</td>

                      <td>{localizeSector(worker.sector,t)||"—"}</td>

                      <td>
                        <span
                          className={
                            worker.active
                              ?"admin-badge success"
                              :"admin-badge danger"
                          }
                        >
                          {worker.active?t("active"):t("inactive")}
                        </span>
                      </td>

                      <td>
                        {formatDate(worker.created_at)}
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            className={worker.active?"admin-icon warning":"admin-icon success"}
                            title={
                              worker.active?t("deactivate"):t("activate")
                            }
                            onClick={()=>toggle(worker)}
                          >
                            {worker.active
                              ?<UserX/>
                              :<UserCheck/>}
                          </button>

                          <button
                            className="admin-icon danger"
                            title={t("remove")}
                            onClick={()=>remove(worker)}
                          >
                            <Trash2/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function localizeSector(value,t){
  const keys={Mining:"mining",Steel:"steel",Manufacturing:"manufacturing","Mica Processing":"micaProcessing","Contract Work":"contractWork",Other:"other"};
  return keys[value]?t(keys[value]):value;
}