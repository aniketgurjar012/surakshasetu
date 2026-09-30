import {useEffect,useMemo,useState} from "react";
import {
  Edit3,
  Plus,
  Search,
  Trash2
} from "lucide-react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import {modules} from "../../data/modules";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";

const localizedLabels={
  en:{mcq:"Multiple choice",scenario:"Scenario",image:"Image + MCQ",true_false:"True / False",options:"options",edit:"Edit",delete:"Delete"},
  hi:{mcq:"बहुविकल्पीय",scenario:"परिदृश्य",image:"चित्र + बहुविकल्पीय",true_false:"सही / गलत",options:"विकल्प",edit:"संपादित करें",delete:"हटाएँ"},
  sat:{mcq:"ᱟᱹᱰᱤ ᱡᱚᱵᱟᱵ ᱵᱟᱪᱷᱟᱣ",scenario:"ᱥᱤᱢᱩᱞᱮᱥᱚᱱ",image:"ᱪᱤᱛᱟᱹᱨ + ᱡᱚᱵᱟᱵ ᱵᱟᱪᱷᱟᱣ",true_false:"ᱥᱟᱹᱨᱤ / ᱵᱟᱝ ᱥᱟᱹᱨᱤ",options:"ᱵᱟᱪᱷᱟᱣ",edit:"ᱥᱚᱢᱯᱟᱫᱚᱱ",delete:"ᱰᱤᱞᱤᱴ"}
};

export default function Questions(){
  const {lang,t}=useApp();
  const labels=localizedLabels[lang]||localizedLabels.en;
  const nav=useNavigate();
  const [params,setParams]=useSearchParams();

  const [questions,setQuestions]=useState([]);
  const [search,setSearch]=useState("");

  const moduleId=
    params.get("module")||"all";

  async function load(){
    let query=supabase
      .from("questions")
      .select("*")
      .order("module_id")
      .order("sort_order");

    if(moduleId!=="all"){
      query=query.eq("module_id",moduleId);
    }

    const {data,error}=await query;

    if(error){
      alert(error.message);
      return;
    }

    setQuestions(data||[]);
  }

  useEffect(()=>{
    load();
  },[moduleId]);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase().trim();

    if(!q)return questions;

    return questions.filter(x=>
      x.question_en?.toLowerCase().includes(q)||
      x.question_hi?.toLowerCase().includes(q)||
      x.question_sat?.toLowerCase().includes(q)
    );
  },[questions,search]);

  async function remove(question){
    if(!confirm(t("questionDeleteConfirm")))return;

    const {error}=await supabase
      .from("questions")
      .delete()
      .eq("id",question.id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  function text(q){
    if(lang==="hi"){
      return q.question_hi||t("translationUnavailable");
    }

    if(lang==="sat"){
      return q.question_sat||t("translationUnavailable");
    }

    return q.question_en;
  }

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow={t("assessmentEngine").toUpperCase()}
          title={t("questionManager")}
          description={t("questionManagerDescription")}
        >
          <button
            className="admin-primary"
            onClick={()=>
              nav(
                `/admin/questions/new${
                  moduleId!=="all"
                    ?`?module=${moduleId}`
                    :""
                }`
              )
            }
          >
            <Plus/>
            {t("addQuestion")}
          </button>
        </AdminHeader>

        <section className="admin-filter-bar">
          <select
            value={moduleId}
            onChange={e=>{
              const value=e.target.value;

              if(value==="all"){
                setParams({});
              }else{
                setParams({module:value});
              }
            }}
          >
            <option value="all">
              {t("allModules")}
            </option>

            {modules.map(module=>(
              <option
                key={module.id}
                value={module.id}
              >
                {module.title[lang]||
                 module.title.en}
              </option>
            ))}
          </select>

          <div className="admin-search compact">
            <Search/>

            <input
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder={t("searchQuestions")}
            />
          </div>
        </section>

        <section className="admin-panel">
          {!filtered.length?(
            <AdminEmptyState
              text={t("questionsFound")}
            />
          ):(
            <div className="admin-question-list">
              {filtered.map((q,index)=>(
                <article
                  className="admin-question"
                  key={q.id}
                >
                  <div className="admin-question-number">
                    {index+1}
                  </div>

                  <div className="admin-question-copy">
                    <span>
                      {modules.find(module=>module.id===q.module_id)?.title?.[lang]||q.module_id}
                      {" • "}
                      {labels[q.type]||q.type}
                    </span>

                    <h3>{text(q)}</h3>

                    <small>
                      {
                        q.options_en?.length||0
                      } {labels.options}
                    </small>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      className="admin-icon"
                      title={labels.edit}
                      aria-label={labels.edit}
                      onClick={()=>
                        nav(
                          `/admin/questions/${q.id}/edit`
                        )
                      }
                    >
                      <Edit3/>
                    </button>

                    <button
                      className="admin-icon danger"
                      title={labels.delete}
                      aria-label={labels.delete}
                      onClick={()=>remove(q)}
                    >
                      <Trash2/>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}