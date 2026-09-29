import {useEffect,useState} from "react";
import {
  Award,BarChart3,BookOpen,ClipboardList,Edit3,
  Plus,ShieldCheck,Trash2,Users
} from "lucide-react";
import Navbar from "../components/Navbar";
import {useApp} from "../context/AppContext";
import {supabase} from "../lib/supabase";

export default function Admin(){
  const {profile}=useApp();
  const [workers,setWorkers]=useState([]);
  const [submissions,setSubmissions]=useState([]);
  const [certs,setCerts]=useState([]);
  const [questions,setQuestions]=useState([]);

  async function load(){
    if(!supabase)return;

    const [w,s,c,q]=await Promise.all([
      supabase.from("profiles").select("*").eq("role","worker").order("created_at"),
      supabase.from("submissions").select("*").order("created_at",{ascending:false}),
      supabase.from("certificates").select("*").order("issued_at",{ascending:false}),
      supabase.from("questions").select("*").order("created_at")
    ]);

    setWorkers(w.data||[]);
    setSubmissions(s.data||[]);
    setCerts(c.data||[]);
    setQuestions(q.data||[]);
  }

  useEffect(()=>{
    load();
    if(!supabase)return;

    const channel=supabase.channel("admin-live")
      .on("postgres_changes",{event:"*",schema:"public",table:"submissions"},load)
      .on("postgres_changes",{event:"*",schema:"public",table:"certificates"},load)
      .subscribe();

    return ()=>supabase.removeChannel(channel);
  },[]);

  async function removeWorker(id){
    if(!confirm("Remove this worker profile?"))return;
    await supabase.from("profiles").delete().eq("id",id);
    load();
  }

  return <>
    <Navbar/>
    <main className="dashboard">
      <section className="dash-hero admin-hero">
        <div>
          <div className="eyebrow"><ShieldCheck/> Administration & Compliance</div>
          <h1>Welcome, {profile?.name}</h1>
          <p>Admin ID: {profile?.public_id}</p>
        </div>
        <div className="live-pill"><i/> Live data sync</div>
      </section>

      <section className="metric-grid">
        <Metric icon={<Users/>} title="Workers" value={workers.length}/>
        <Metric icon={<ClipboardList/>} title="Assessments" value={submissions.length}/>
        <Metric icon={<Award/>} title="Certificates" value={certs.length}/>
        <Metric icon={<BookOpen/>} title="Questions" value={questions.length}/>
      </section>

      <section className="admin-tools">
        <button><Users/><div><strong>Worker Management</strong><span>View and manage registered workers</span></div></button>
        <button><BookOpen/><div><strong>Training Modules</strong><span>Manage learning content</span></div></button>
        <button><Edit3/><div><strong>Question Manager</strong><span>Add, edit and delete assessments</span></div></button>
        <button><Award/><div><strong>Certificates</strong><span>Issued records and verification</span></div></button>
        <button><BarChart3/><div><strong>Compliance</strong><span>Performance and completion analytics</span></div></button>
      </section>

      <section className="panel">
        <div className="title-row">
          <div><span>CONNECTED WORKFORCE</span><h2>Workers</h2></div>
          <button className="primary"><Plus/> Add</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Worker</th><th>Worker ID</th><th>Sector</th><th>Joined</th><th>Action</th>
            </tr></thead>
            <tbody>
              {workers.map(w=><tr key={w.id}>
                <td><strong>{w.name}</strong></td>
                <td>{w.public_id}</td>
                <td><span className="status-badge">{w.sector}</span></td>
                <td>{new Date(w.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="delete-button" onClick={()=>removeWorker(w.id)}>
                    <Trash2 size={17}/>
                  </button>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="two-panels">
        <div className="panel">
          <div className="title-row">
            <div><span>REAL-TIME FEED</span><h2>Recent Assessments</h2></div>
          </div>
          {submissions.slice(0,6).map(x=>
            <div className="record-row" key={x.id}>
              <ClipboardList/>
              <div><strong>{x.module_id}</strong><small>{new Date(x.created_at).toLocaleString()}</small></div>
              <b>{x.percentage}%</b>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="title-row">
            <div><span>CERTIFICATION</span><h2>Recent Certificates</h2></div>
          </div>
          {certs.slice(0,6).map(x=>
            <div className="record-row" key={x.id}>
              <Award/>
              <div><strong>{x.certificate_no}</strong><small>{x.module_id}</small></div>
              <span className="verified">Verified</span>
            </div>
          )}
        </div>
      </section>
    </main>
  </>;
}

function Metric({icon,title,value}){
  return <div className="metric">
    <div>{icon}</div><span>{title}</span><strong>{value}</strong>
  </div>;
}