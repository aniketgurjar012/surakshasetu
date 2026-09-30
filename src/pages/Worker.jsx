import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  Award,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Eye,
  History,
  ShieldCheck,
  Trash2
} from "lucide-react";
import Navbar from "../components/Navbar";
import {useApp} from "../context/AppContext";
import {modules} from "../data/modules";
import {supabase} from "../lib/supabase";

export default function Worker(){
  const {profile,lang,t,formatDateTime}=useApp();
  const nav=useNavigate();
  const [records,setRecords]=useState([]);
  const [certs,setCerts]=useState([]);
  const [loading,setLoading]=useState(true);

  async function load(){
    if(!profile||!supabase)return;
    setLoading(true);

    const [result,certificates]=await Promise.all([
      supabase.from("submissions")
        .select("*")
        .eq("worker_id",profile.id)
        .eq("worker_hidden",false)
        .order("created_at",{ascending:false}),
      supabase.from("certificates")
        .select("*")
        .eq("worker_id",profile.id)
        .eq("worker_hidden",false)
        .order("issued_at",{ascending:false})
    ]);

    if(result.error)console.error("Assessment load error:",result.error);
    if(certificates.error)console.error("Certificate load error:",certificates.error);
    setRecords(result.data||[]);
    setCerts(certificates.data||[]);
    setLoading(false);
  }

  useEffect(()=>{
    if(profile)load();
  },[profile]);

  async function hideAssessment(id){
    if(!window.confirm(t("removeAssessmentConfirm")))return;
    const {error}=await supabase.from("submissions")
      .update({worker_hidden:true})
      .eq("id",id)
      .eq("worker_id",profile.id);
    if(error){
      window.alert(`${t("couldNotRemoveAssessment")} ${error.message}`);
      return;
    }
    setRecords(current=>current.filter(item=>item.id!==id));
  }

  async function hideCertificate(id){
    if(!window.confirm(t("removeCertificateConfirm")))return;
    const {error}=await supabase.from("certificates")
      .update({worker_hidden:true})
      .eq("id",id)
      .eq("worker_id",profile.id);
    if(error){
      window.alert(`${t("couldNotRemoveCertificate")} ${error.message}`);
      return;
    }
    setCerts(current=>current.filter(item=>item.id!==id));
  }

  const averageScore=records.length
    ?Math.round(records.reduce((total,item)=>total+Number(item.percentage||0),0)/records.length)
    :0;

  return <>
    <Navbar/>
    <main className="dashboard">
      <section className="dash-hero">
        <div>
          <div className="eyebrow"><ShieldCheck/>{t("workerCentre")}</div>
          <h1>{t("welcome")}, {profile?.name}</h1>
          <p>{t("workerId")}: {profile?.public_id} • {localizeSector(profile?.sector,t)}</p>
        </div>
        <div className="worker-status">
          <div><b>{records.length}</b><span>{t("assessments")}</span></div>
          <div><b>{certs.length}</b><span>{t("certificates")}</span></div>
          <div><b>{averageScore}%</b><span>{t("average")}</span></div>
        </div>
      </section>

      <section className="dash-section">
        <div className="title-row">
          <div>
            <span>{t("learn")} • {t("practise")} • {t("assess")}</span>
            <h2>{t("training")}</h2>
          </div>
          <BookOpen/>
        </div>
        <div className="training-grid">
          {modules.map((module,index)=><article
            key={module.id}
            className="training-card"
            style={{"--module":module.color}}
          >
            <div className="training-top">
              <div className="module-icon">{module.icon}</div>
              <span>{t("module").toUpperCase()} 0{index+1}</span>
            </div>
            <h3>{module.title[lang]||module.title.en}</h3>
            <p>{module.description[lang]||module.description.en}</p>
            <div className="module-actions">
              <button className="primary" onClick={()=>nav(`/worker/module/${module.id}`)}>
                <BookOpen size={16}/>{t("openModule")}
              </button>
              <button className="round-button" aria-label={t("openModule")} onClick={()=>nav(`/worker/module/${module.id}`)}>
                <ChevronRight/>
              </button>
            </div>
          </article>)}
        </div>
      </section>

      <section className="two-panels">
        <div className="panel">
          <div className="title-row">
            <div><span>{t("performance").toUpperCase()}</span><h2>{t("assessmentHistory")}</h2></div>
            <History/>
          </div>
          {loading?<div className="empty"><div className="spinner"/></div>
            :records.length===0?<div className="empty"><ClipboardCheck/><p>{t("noCompletedAssessments")}</p></div>
            :records.map(record=><div className="record-row history-record" key={record.id}>
              <ClipboardCheck/>
              <div>
                <strong>{getModuleTitle(record.module_id,lang)}</strong>
                <small>{formatDateTime(record.created_at)}</small>
              </div>
              <b className={Number(record.percentage)>=60?"score-pass":"score-low"}>{Math.round(record.percentage)}%</b>
              <div className="history-actions">
                <button className="history-view" title={t("viewResult")} aria-label={t("viewResult")} onClick={()=>nav(`/worker/result/${record.id}`)}><Eye/></button>
                <button className="history-delete" title={t("removeFromHistory")} aria-label={t("removeFromHistory")} onClick={()=>hideAssessment(record.id)}><Trash2/></button>
              </div>
            </div>)}
        </div>

        <div className="panel">
          <div className="title-row">
            <div><span>{t("verifiedRecords").toUpperCase()}</span><h2>{t("certificates")}</h2></div>
            <Award/>
          </div>
          {loading?<div className="empty"><div className="spinner"/></div>
            :certs.length===0?<div className="empty"><Award/><p>{t("completeForCertificate")}</p></div>
            :certs.map(certificate=><div className="record-row history-record" key={certificate.id}>
              <Award/>
              <div>
                <strong>{certificate.certificate_no}</strong>
                <small>{getModuleTitle(certificate.module_id,lang)} • {Math.round(certificate.score)}%</small>
              </div>
              <span className="verified">{t("verified")}</span>
              <div className="history-actions">
                <button className="history-view" title={t("viewCertificate")} aria-label={t("viewCertificate")} onClick={()=>nav(`/worker/certificate/${certificate.id}`)}><Eye/></button>
                <button className="history-delete" title={t("removeFromHistory")} aria-label={t("removeFromHistory")} onClick={()=>hideCertificate(certificate.id)}><Trash2/></button>
              </div>
            </div>)}
        </div>
      </section>
    </main>
  </>;
}

function getModuleTitle(id,lang){
  const module=modules.find(item=>item.id===id);
  return module?.title?.[lang]||module?.title?.en||id;
}

function localizeSector(value,t){
  const sectorKeys={
    Mining:"mining",
    Steel:"steel",
    Manufacturing:"manufacturing",
    "Mica Processing":"micaProcessing",
    "Contract Work":"contractWork",
    Other:"other"
  };
  return sectorKeys[value]?t(sectorKeys[value]):value;
}