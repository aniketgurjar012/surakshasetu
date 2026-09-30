import {useEffect,useMemo,useState} from "react";
import {useNavigate} from "react-router-dom";

import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  ShieldCheck,
  Users
} from "lucide-react";

import Navbar from "../../components/Navbar";
import AdminStatCard from "../../components/admin/AdminStatCard";
import {useApp} from "../../context/AppContext";
import {supabase} from "../../lib/supabase";
import {getModule} from "../../data/modules";

const words={
  en:{
    centre:"ADMINISTRATION & COMPLIANCE",
    welcome:"Welcome",
    id:"Admin ID",
    workers:"Workers",
    tests:"Assessments",
    certs:"Certificates",
    avg:"Average Score",
    manageWorkers:"Worker Management",
    workerDesc:"Registered workforce and account status",
    modules:"Training Modules",
    moduleDesc:"Review the five safety training domains",
    questions:"Question Manager",
    questionDesc:"Create and maintain multilingual assessments",
    assessments:"Assessment Records",
    assessmentDesc:"Worker scores and submissions",
    certificates:"Certificate Centre",
    certDesc:"Search, inspect and revoke certificates",
    compliance:"Compliance Analytics",
    complianceDesc:"Platform-level performance overview",
    recent:"Recent Assessments",
    live:"Live data sync"
  },

  hi:{
    centre:"प्रशासन एवं अनुपालन",
    welcome:"स्वागत है",
    id:"एडमिन आईडी",
    workers:"कर्मचारी",
    tests:"मूल्यांकन",
    certs:"प्रमाणपत्र",
    avg:"औसत स्कोर",
    manageWorkers:"कर्मचारी प्रबंधन",
    workerDesc:"पंजीकृत कर्मचारियों और खाते की स्थिति देखें",
    modules:"प्रशिक्षण मॉड्यूल",
    moduleDesc:"पाँच सुरक्षा प्रशिक्षण क्षेत्रों को देखें",
    questions:"प्रश्न प्रबंधक",
    questionDesc:"बहुभाषी मूल्यांकन प्रश्न बनाएं और संपादित करें",
    assessments:"मूल्यांकन रिकॉर्ड",
    assessmentDesc:"कर्मचारी स्कोर और सबमिशन देखें",
    certificates:"प्रमाणपत्र केंद्र",
    certDesc:"प्रमाणपत्र खोजें, देखें और रद्द करें",
    compliance:"अनुपालन विश्लेषण",
    complianceDesc:"समग्र प्रशिक्षण प्रदर्शन देखें",
    recent:"हाल के मूल्यांकन",
    live:"लाइव डेटा सिंक"
  },

  sat:{
    centre:"ᱮᱰᱢᱤᱱ ᱟᱨ ᱠᱚᱢᱯᱞᱟᱭᱮᱱᱥ",
    welcome:"ᱡᱚᱦᱟᱨ",
    id:"ᱮᱰᱢᱤᱱ ID",
    workers:"ᱠᱟᱹᱢᱤᱭᱟᱹ",
    tests:"ᱢᱩᱞᱭᱟᱝᱠᱚᱱ",
    certs:"ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ",
    avg:"ᱜᱚᱲ ᱥᱠᱳᱨ",
    manageWorkers:"ᱠᱟᱹᱢᱤᱭᱟᱹ ᱢᱮᱱᱮᱡᱽ",
    workerDesc:"ᱨᱮᱡᱤᱥᱴᱟᱨ ᱠᱟᱹᱢᱤᱭᱟᱹ ᱧᱮᱞ",
    modules:"ᱴᱨᱮᱱᱤᱝ ᱢᱚᱰᱭᱩᱞ",
    moduleDesc:"5 ᱥᱩᱨᱚᱠᱪᱷᱟ ᱢᱚᱰᱭᱩᱞ ᱧᱮᱞ",
    questions:"ᱠᱩᱠᱞᱤ ᱢᱮᱱᱮᱡᱚᱨ",
    questionDesc:"ᱠᱩᱠᱞᱤ ᱥᱮᱞᱮᱫ, ᱮᱰᱤᱴ ᱟᱨ ᱰᱤᱞᱤᱴ",
    assessments:"ᱢᱩᱞᱭᱟᱝᱠᱚᱱ ᱨᱮᱠᱚᱨᱰ",
    assessmentDesc:"ᱥᱠᱳᱨ ᱟᱨ ᱥᱟᱵᱢᱤᱥᱚᱱ ᱧᱮᱞ",
    certificates:"ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ ᱥᱮᱱᱴᱟᱨ",
    certDesc:"ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ ᱥᱮᱸᱫᱽᱨᱟ ᱟᱨ ᱧᱮᱞ",
    compliance:"ᱠᱚᱢᱯᱞᱟᱭᱮᱱᱥ",
    complianceDesc:"ᱯᱞᱮᱴᱯᱷᱚᱨᱢ ᱰᱟᱴᱟ ᱧᱮᱞ",
    recent:"ᱱᱟᱶᱟ ᱢᱩᱞᱭᱟᱝᱠᱚᱱ",
    live:"ᱞᱟᱭᱤᱵ ᱥᱤᱝᱠ"
  }
};

export default function AdminDashboard(){
  const {profile,lang,t,formatDateTime}=useApp();
  const nav=useNavigate();
  const w=words[lang]||words.en;

  const [workers,setWorkers]=useState([]);
  const [tests,setTests]=useState([]);
  const [certs,setCerts]=useState([]);

  async function load(){
    const [a,b,c]=await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("role","worker")
        .eq("admin_hidden",false),

      supabase
        .from("submissions")
        .select("*")
        .eq("admin_hidden",false)
        .order("created_at",{ascending:false}),

      supabase
        .from("certificates")
        .select("*")
        .eq("admin_hidden",false)
        .order("issued_at",{ascending:false})
    ]);

    setWorkers(a.data||[]);
    setTests(b.data||[]);
    setCerts(c.data||[]);
  }

  useEffect(()=>{
    load();

    const channel=supabase
      .channel("admin-dashboard-live")
      .on(
        "postgres_changes",
        {event:"*",schema:"public",table:"submissions"},
        load
      )
      .on(
        "postgres_changes",
        {event:"*",schema:"public",table:"certificates"},
        load
      )
      .on(
        "postgres_changes",
        {event:"*",schema:"public",table:"profiles"},
        load
      )
      .subscribe();

    return ()=>{
      supabase.removeChannel(channel);
    };
  },[]);

  const average=useMemo(()=>{
    if(!tests.length)return 0;

    return Math.round(
      tests.reduce(
        (a,x)=>a+Number(x.percentage||0),
        0
      )/tests.length
    );
  },[tests]);

  const tools=[
    {
      icon:<Users/>,
      title:w.manageWorkers,
      desc:w.workerDesc,
      to:"/admin/workers"
    },
    {
      icon:<BookOpen/>,
      title:w.modules,
      desc:w.moduleDesc,
      to:"/admin/modules"
    },
    {
      icon:<HelpCircle/>,
      title:w.questions,
      desc:w.questionDesc,
      to:"/admin/questions"
    },
    {
      icon:<ClipboardCheck/>,
      title:w.assessments,
      desc:w.assessmentDesc,
      to:"/admin/assessments"
    },
    {
      icon:<Award/>,
      title:w.certificates,
      desc:w.certDesc,
      to:"/admin/certificates"
    },
    {
      icon:<BarChart3/>,
      title:w.compliance,
      desc:w.complianceDesc,
      to:"/admin/compliance"
    }
  ];

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <section className="admin-welcome">
          <div>
            <div className="eyebrow">
              <ShieldCheck/>
              {w.centre}
            </div>

            <h1>
              {w.welcome}, {profile?.name}
            </h1>

            <p>
              {w.id}: {profile?.public_id}
            </p>
          </div>

          <span className="admin-live">
            <i/>
            {w.live}
          </span>
        </section>

        <section className="admin-stat-grid">
          <AdminStatCard
            icon={<Users/>}
            label={w.workers}
            value={workers.length}
          />

          <AdminStatCard
            icon={<ClipboardCheck/>}
            label={w.tests}
            value={tests.length}
            color="blue"
          />

          <AdminStatCard
            icon={<Award/>}
            label={w.certs}
            value={certs.length}
            color="gold"
          />

          <AdminStatCard
            icon={<BarChart3/>}
            label={w.avg}
            value={`${average}%`}
            color="purple"
          />
        </section>

        <section className="admin-tool-grid">
          {tools.map(tool=>(
            <button
              key={tool.to}
              className="admin-tool-card"
              onClick={()=>nav(tool.to)}
            >
              <div>{tool.icon}</div>

              <section>
                <strong>{tool.title}</strong>
                <span>{tool.desc}</span>
              </section>

              <b>→</b>
            </button>
          ))}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <span>{t("liveActivity").toUpperCase()}</span>
              <h2>{w.recent}</h2>
            </div>
          </div>

          {!tests.length&&(
            <div className="admin-empty">
              {t("noAssessmentsYet")}
            </div>
          )}

          {tests.slice(0,8).map(test=>(
            <div
              className="admin-activity-row"
              key={test.id}
              onClick={()=>
                nav(`/admin/assessments/${test.id}`)
              }
            >
              <ClipboardCheck/>

              <div>
                <strong>{getModule(test.module_id)?.title?.[lang]||getModule(test.module_id)?.title?.en||test.module_id}</strong>
                <small>
                  {formatDateTime(test.created_at)}
                </small>
              </div>

              <b>{Math.round(test.percentage)}%</b>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}