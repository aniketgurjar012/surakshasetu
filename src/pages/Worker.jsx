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

  const {
    profile,
    lang,
    t
  }=useApp();

  const nav=useNavigate();

  const [records,setRecords]=useState([]);
  const [certs,setCerts]=useState([]);
  const [loading,setLoading]=useState(true);

  // ===============================
  // LOAD WORKER HISTORY
  // ===============================

  async function load(){

    if(!profile || !supabase){
      return;
    }

    setLoading(true);

    const [r,c]=await Promise.all([

      supabase
        .from("submissions")
        .select("*")
        .eq("worker_id",profile.id)
        .eq("worker_hidden",false)
        .order(
          "created_at",
          {ascending:false}
        ),

      supabase
        .from("certificates")
        .select("*")
        .eq("worker_id",profile.id)
        .eq("worker_hidden",false)
        .order(
          "issued_at",
          {ascending:false}
        )

    ]);

    if(r.error){
      console.error(
        "Assessment load error:",
        r.error
      );
    }

    if(c.error){
      console.error(
        "Certificate load error:",
        c.error
      );
    }

    setRecords(r.data || []);
    setCerts(c.data || []);

    setLoading(false);
  }

  useEffect(()=>{

    if(!profile){
      return;
    }

    load();

  },[profile]);

  // ===============================
  // REMOVE ASSESSMENT FROM HISTORY
  // ===============================

  async function hideAssessment(id){

    const confirmRemove=
      window.confirm(
        "Remove this assessment from your history?"
      );

    if(!confirmRemove){
      return;
    }

    const {error}=
      await supabase
        .from("submissions")
        .update({
          worker_hidden:true
        })
        .eq("id",id)
        .eq(
          "worker_id",
          profile.id
        );

    if(error){

      alert(
        "Could not remove assessment: "+
        error.message
      );

      return;
    }

    // Immediately remove from screen

    setRecords(
      old=>
        old.filter(
          item=>item.id!==id
        )
    );
  }

  // ===============================
  // REMOVE CERTIFICATE FROM HISTORY
  // ===============================

  async function hideCertificate(id){

    const confirmRemove=
      window.confirm(
        "Remove this certificate from your history? The original verification record will remain valid."
      );

    if(!confirmRemove){
      return;
    }

    const {error}=
      await supabase
        .from("certificates")
        .update({
          worker_hidden:true
        })
        .eq("id",id)
        .eq(
          "worker_id",
          profile.id
        );

    if(error){

      alert(
        "Could not remove certificate: "+
        error.message
      );

      return;
    }

    setCerts(
      old=>
        old.filter(
          item=>item.id!==id
        )
    );
  }

  // ===============================
  // AVERAGE SCORE
  // ===============================

  const averageScore=
    records.length
      ?
      Math.round(
        records.reduce(
          (total,item)=>
            total+
            Number(
              item.percentage || 0
            ),
          0
        ) / records.length
      )
      :
      0;

  return(

    <>

      <Navbar/>

      <main className="dashboard">

        {/* =========================
            WORKER HEADER
        ========================= */}

        <section className="dash-hero">

          <div>

            <div className="eyebrow">

              <ShieldCheck/>

              Worker Safety Centre

            </div>

            <h1>

              {t("welcome")},{" "}

              {profile?.name}

            </h1>

            <p>

              Worker ID:{" "}

              {profile?.public_id}

              {" • "}

              {profile?.sector}

            </p>

          </div>

          <div className="worker-status">

            <div>

              <b>
                {records.length}
              </b>

              <span>
                Assessments
              </span>

            </div>

            <div>

              <b>
                {certs.length}
              </b>

              <span>
                Certificates
              </span>

            </div>

            <div>

              <b>
                {averageScore}%
              </b>

              <span>
                Average
              </span>

            </div>

          </div>

        </section>

        {/* =========================
            TRAINING MODULES
        ========================= */}

        <section className="dash-section">

          <div className="title-row">

            <div>

              <span>
                LEARN • PRACTISE • ASSESS
              </span>

              <h2>
                {t("training")}
              </h2>

            </div>

            <BookOpen/>

          </div>

          <div className="training-grid">

            {
              modules.map(
                (module,index)=>(

                  <article

                    key={module.id}

                    className="training-card"

                    style={{
                      "--module":
                        module.color
                    }}

                  >

                    <div className="training-top">

                      <div className="module-icon">

                        {module.icon}

                      </div>

                      <span>

                        MODULE 0{index+1}

                      </span>

                    </div>

                    <h3>

                      {
                        module.title[lang]
                        ||
                        module.title.en
                      }

                    </h3>

                    <p>

                      {
                        module.description[lang]
                        ||
                        module.description.en
                      }

                    </p>

                    <div className="module-actions">

                      <button

                        className="primary"

                        onClick={()=>{

                          nav(
                            `/worker/module/${module.id}`
                          );

                        }}

                      >

                        <BookOpen
                          size={16}
                        />

                        Open Module

                      </button>

                      <button

                        className="round-button"

                        onClick={()=>{

                          nav(
                            `/worker/module/${module.id}`
                          );

                        }}

                      >

                        <ChevronRight/>

                      </button>

                    </div>

                  </article>

                )
              )
            }

          </div>

        </section>

        {/* =========================
            HISTORY
        ========================= */}

        <section className="two-panels">

          {/* =====================
              ASSESSMENT HISTORY
          ===================== */}

          <div className="panel">

            <div className="title-row">

              <div>

                <span>
                  PERFORMANCE
                </span>

                <h2>
                  Assessment History
                </h2>

              </div>

              <History/>

            </div>

            {
              loading
              ?

              <div className="empty">

                <div className="spinner"/>

              </div>

              :

              records.length===0
              ?

              <div className="empty">

                <ClipboardCheck/>

                <p>
                  No completed assessments yet.
                </p>

              </div>

              :

              records.map(
                record=>(

                  <div

                    className=
                      "record-row history-record"

                    key={record.id}

                  >

                    <ClipboardCheck/>

                    <div>

                      <strong>

                        {
                          getModuleTitle(
                            record.module_id,
                            lang
                          )
                        }

                      </strong>

                      <small>

                        {
                          new Date(
                            record.created_at
                          ).toLocaleString()
                        }

                      </small>

                    </div>

                    <b

                      className={
                        Number(
                          record.percentage
                        )>=60
                        ?
                        "score-pass"
                        :
                        "score-low"
                      }

                    >

                      {
                        Math.round(
                          record.percentage
                        )
                      }%

                    </b>

                    <div className="history-actions">

                      {/* VIEW RESULT */}

                      <button

                        className="history-view"

                        title="View result"

                        onClick={()=>{

                          nav(
                            `/worker/result/${record.id}`
                          );

                        }}

                      >

                        <Eye/>

                      </button>

                      {/* REMOVE RESULT */}

                      <button

                        className="history-delete"

                        title="Remove from history"

                        onClick={()=>{

                          hideAssessment(
                            record.id
                          );

                        }}

                      >

                        <Trash2/>

                      </button>

                    </div>

                  </div>

                )
              )
            }

          </div>

          {/* =====================
              CERTIFICATE HISTORY
          ===================== */}

          <div className="panel">

            <div className="title-row">

              <div>

                <span>
                  VERIFIED RECORDS
                </span>

                <h2>

                  {t("certificates")}

                </h2>

              </div>

              <Award/>

            </div>

            {
              loading
              ?

              <div className="empty">

                <div className="spinner"/>

              </div>

              :

              certs.length===0
              ?

              <div className="empty">

                <Award/>

                <p>

                  Complete an eligible
                  assessment to earn a
                  certificate.

                </p>

              </div>

              :

              certs.map(
                certificate=>(

                  <div

                    className=
                      "record-row history-record"

                    key={
                      certificate.id
                    }

                  >

                    <Award/>

                    <div>

                      <strong>

                        {
                          certificate
                            .certificate_no
                        }

                      </strong>

                      <small>

                        {
                          getModuleTitle(
                            certificate
                              .module_id,
                            lang
                          )
                        }

                        {" • "}

                        {
                          Math.round(
                            certificate
                              .score
                          )
                        }%

                      </small>

                    </div>

                    <span className="verified">

                      Verified

                    </span>

                    <div className="history-actions">

                      {/* VIEW CERTIFICATE */}

                      <button

                        className="history-view"

                        title=
                          "View certificate"

                        onClick={()=>{

                          nav(
                            `/worker/certificate/${certificate.id}`
                          );

                        }}

                      >

                        <Eye/>

                      </button>

                      {/* REMOVE CERTIFICATE */}

                      <button

                        className="history-delete"

                        title=
                          "Remove from history"

                        onClick={()=>{

                          hideCertificate(
                            certificate.id
                          );

                        }}

                      >

                        <Trash2/>

                      </button>

                    </div>

                  </div>

                )
              )
            }

          </div>

        </section>

      </main>

    </>

  );

}

// =====================================
// MODULE NAME HELPER
// =====================================

function getModuleTitle(
  id,
  lang
){

  const module=
    modules.find(
      item=>item.id===id
    );

  return(
    module?.title?.[lang]
    ||
    module?.title?.en
    ||
    id
  );

}