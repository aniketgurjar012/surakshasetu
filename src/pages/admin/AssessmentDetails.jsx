import {useEffect,useState} from "react";
import {Trash2} from "lucide-react";
import {
  useNavigate,
  useParams
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import {supabase} from "../../lib/supabase";

export default function AssessmentDetails(){
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
      "Remove this assessment from Admin records?"
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
          eyebrow="ASSESSMENT DETAIL"
          title={`${worker?.name||"Worker"} • ${Math.round(record.percentage)}%`}
          description={`${worker?.public_id||""} • ${record.module_id}`}
        >
          <button
            className="admin-danger"
            onClick={remove}
          >
            <Trash2/>
            Remove
          </button>
        </AdminHeader>

        <section className="admin-detail-grid">
          <Detail
            title="Worker"
            value={worker?.name}
          />

          <Detail
            title="Worker ID"
            value={worker?.public_id}
          />

          <Detail
            title="Sector"
            value={worker?.sector}
          />

          <Detail
            title="Module"
            value={record.module_id}
          />

          <Detail
            title="Score"
            value={`${record.score}/${record.total}`}
          />

          <Detail
            title="Percentage"
            value={`${Math.round(record.percentage)}%`}
          />

          <Detail
            title="Status"
            value={record.status}
          />

          <Detail
            title="Submitted"
            value={
              new Date(
                record.created_at
              ).toLocaleString()
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