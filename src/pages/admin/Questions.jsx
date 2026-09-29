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

export default function Questions(){
  const {lang}=useApp();
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
    if(!confirm("Delete this question?"))return;

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
      return q.question_hi||q.question_en;
    }

    if(lang==="sat"){
      return q.question_sat||q.question_en;
    }

    return q.question_en;
  }

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow="ASSESSMENT ENGINE"
          title={
            lang==="hi"
              ?"प्रश्न प्रबंधक"
              :lang==="sat"
                ?"ᱠᱩᱠᱞᱤ ᱢᱮᱱᱮᱡᱚᱨ"
                :"Question Manager"
          }
          description="Create, edit and delete multilingual assessment questions."
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
            Add Question
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
              All modules
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
              placeholder="Search questions..."
            />
          </div>
        </section>

        <section className="admin-panel">
          {!filtered.length?(
            <AdminEmptyState
              text="No questions found."
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
                      {q.module_id}
                      {" • "}
                      {q.type}
                    </span>

                    <h3>{text(q)}</h3>

                    <small>
                      {
                        q.options_en?.length||0
                      } options
                    </small>
                  </div>

                  <div className="admin-row-actions">
                    <button
                      className="admin-icon"
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