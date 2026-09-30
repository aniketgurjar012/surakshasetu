import {useEffect,useMemo,useState} from "react";

import {
  Award,
  BarChart3,
  ClipboardCheck,
  Users
} from "lucide-react";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import {modules} from "../../data/modules";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";

export default function Compliance(){
  const {lang,t}=useApp();
  const [workers,setWorkers]=useState([]);
  const [tests,setTests]=useState([]);
  const [certs,setCerts]=useState([]);

  async function load(){
    const [a,b,c]=await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("role","worker"),

      supabase
        .from("submissions")
        .select("*")
        .eq("admin_hidden",false),

      supabase
        .from("certificates")
        .select("*")
        .eq("admin_hidden",false)
    ]);

    setWorkers(a.data||[]);
    setTests(b.data||[]);
    setCerts(c.data||[]);
  }

  useEffect(()=>{
    load();
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

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow={t("compliance").toUpperCase()}
          title={t("safetyCompliance")}
          description={t("complianceDescription")}
        />

        <section className="admin-stat-grid">
          <AdminStatCard
            icon={<Users/>}
            label={t("totalWorkers")}
            value={workers.length}
          />

          <AdminStatCard
            icon={<ClipboardCheck/>}
            label={t("assessments")}
            value={tests.length}
            color="blue"
          />

          <AdminStatCard
            icon={<Award/>}
            label={t("certificates")}
            value={certs.length}
            color="gold"
          />

          <AdminStatCard
            icon={<BarChart3/>}
            label={t("averageScore")}
            value={`${average}%`}
            color="purple"
          />
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <div>
              <span>{t("modulePerformance").toUpperCase()}</span>
              <h2>
                {t("moduleAssessments")}
              </h2>
            </div>
          </div>

          <div className="compliance-bars">
            {modules.map(module=>{
              const rows=tests.filter(
                x=>x.module_id===module.id
              );

              const avg=
                rows.length
                  ?Math.round(
                    rows.reduce(
                      (a,x)=>
                        a+
                        Number(
                          x.percentage||0
                        ),
                      0
                    )/rows.length
                  )
                  :0;

              return (
                <div
                  className="compliance-row"
                  key={module.id}
                >
                  <div>
                    <span>{module.icon}</span>
                    <strong>
                      {module.title[lang]||module.title.en}
                    </strong>
                  </div>

                  <div className="compliance-track">
                    <i
                      style={{
                        width:`${avg}%`,
                        background:
                          module.color
                      }}
                    />
                  </div>

                  <b>{avg}%</b>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}