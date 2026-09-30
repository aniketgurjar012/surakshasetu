import {useEffect,useState} from "react";
import {Trash2} from "lucide-react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";
import {getModule} from "../../data/modules";

export default function AssessmentDetails(){
  const {lang,t,formatDateTime}=useApp();
  const {id}=useParams();
  const nav=useNavigate();

  const [record,setRecord]=useState(null);
  const [worker,setWorker]=useState(null);

  useEffect(()=>{
    async function load(){
      const {data}=await supabase
        .from("submissions")
        .select("*")
        .eq("id",id)
        .single();

      setRecord(data);

      if(data){
        const {data:w}=await supabase
          .from("profiles")
          .select("name,public_id,sector")
          .eq("id",data.worker_id)
          .single();

        setWorker(w);
      }
    }

    load();
  },[id]);

  async function remove(){
    if(!confirm(
      t("assessmentDeleteConfirm")
    ))return;

    await supabase
      .from("submissions")
      .update({admin_hidden:true})
      .eq("id",id);

    nav("/admin/assessments");
  }

  if(!record){
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
          eyebrow={t("assessmentRecords").toUpperCase()}
          title={`${worker?.name||t("worker")} • ${Math.round(record.percentage)}%`}
          description={`${worker?.public_id||""} • ${getModule(record.module_id)?.title?.[lang]||record.module_id}`}
        >
          <button
            className="admin-danger"
            onClick={remove}
          >
            <Trash2/>
            {t("remove")}
          </button>
        </AdminHeader>

        <section className="admin-detail-grid">
          <Detail
            title={t("worker")}
            value={worker?.name}
          />

          <Detail
            title={t("workerId")}
            value={worker?.public_id}
          />

          <Detail
            title={t("sector")}
            value={localizeSector(worker?.sector,t)}
          />

          <Detail
            title={t("module")}
            value={getModule(record.module_id)?.title?.[lang]||record.module_id}
          />

          <Detail
            title={t("score")}
            value={`${record.score}/${record.total}`}
          />

          <Detail
            title={t("percentage")}
            value={`${Math.round(record.percentage)}%`}
          />

          <Detail
            title={t("status")}
            value={record.status==="completed"?t("completed"):record.status}
          />

          <Detail
            title={t("submitted")}
            value={
              formatDateTime(record.created_at)
            }
          />
        </section>
      </main>
    </>
  );
}

function Detail({title,value}){
  return (
    <article className="admin-detail-card">
      <span>{title}</span>
      <strong>{value||"—"}</strong>
    </article>
  );
}

function localizeSector(value,t){
  const keys={Mining:"mining",Steel:"steel",Manufacturing:"manufacturing","Mica Processing":"micaProcessing","Contract Work":"contractWork",Other:"other"};
  return keys[value]?t(keys[value]):value;
}