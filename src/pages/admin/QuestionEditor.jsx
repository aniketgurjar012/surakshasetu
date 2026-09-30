import {useEffect,useState} from "react";
import {
  Save,
  Trash2
} from "lucide-react";
import {
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import {useApp} from "../../context/AppContext";
import {modules} from "../../data/modules";
import {supabase} from "../../lib/supabase";

const typeLabels={
  en:{mcq:"Multiple choice",scenario:"Scenario",image:"Image + MCQ",true_false:"True / False",option:"Option"},
  hi:{mcq:"बहुविकल्पीय",scenario:"परिदृश्य",image:"चित्र + बहुविकल्पीय",true_false:"सही / गलत",option:"विकल्प"},
  sat:{mcq:"ᱟᱹᱰᱤ ᱡᱚᱵᱟᱵ ᱵᱟᱪᱷᱟᱣ",scenario:"ᱥᱤᱢᱩᱞᱮᱥᱚᱱ",image:"ᱪᱤᱛᱟᱹᱨ + ᱡᱚᱵᱟᱵ ᱵᱟᱪᱷᱟᱣ",true_false:"ᱥᱟᱹᱨᱤ / ᱵᱟᱝ ᱥᱟᱹᱨᱤ",option:"ᱵᱟᱪᱷᱟᱣ"}
};

const blank={
  module_id:"fire",
  type:"mcq",

  question_en:"",
  question_hi:"",
  question_sat:"",

  options_en:["","","",""],
  options_hi:["","","",""],
  options_sat:["","","",""],

  correctIndex:0,

  explanation_en:"",
  explanation_hi:"",
  explanation_sat:"",

  media_url:"",
  sort_order:0
};

export default function QuestionEditor(){
  const {lang,t}=useApp();
  const labels=typeLabels[lang]||typeLabels.en;
  const {id}=useParams();
  const [params]=useSearchParams();
  const nav=useNavigate();

  const [form,setForm]=useState({
    ...blank,
    module_id:
      params.get("module")||"fire"
  });

  const [busy,setBusy]=useState(false);

  const editing=Boolean(id);

  useEffect(()=>{
    if(!editing)return;

    supabase
      .from("questions")
      .select("*")
      .eq("id",id)
      .single()
      .then(({data,error})=>{
        if(error){
          alert(error.message);
          return;
        }

        const correct=
          data.correct_answers?.[0];

        const correctIndex=
          (data.options_en||[])
            .indexOf(correct);

        setForm({
          ...blank,
          ...data,
          options_en:
            normalize(data.options_en),
          options_hi:
            normalize(data.options_hi),
          options_sat:
            normalize(data.options_sat),
          correctIndex:
            correctIndex>=0
              ?correctIndex
              :0
        });
      });
  },[id]);

  function normalize(options=[]){
    const result=[...options];

    while(result.length<4){
      result.push("");
    }

    return result.slice(0,4);
  }

  function setOption(language,index,value){
    const key=`options_${language}`;
    const next=[...form[key]];
    next[index]=value;

    setForm({
      ...form,
      [key]:next
    });
  }

  async function save(e){
    e.preventDefault();

    if(!form.question_en.trim()||!form.question_hi.trim()||!form.question_sat.trim()){
      alert(t("questionTranslationRequired"));
      return;
    }

    const optionsComplete=form.options_en.every((_,index)=>{
      const values=["en","hi","sat"].map(code=>form[`options_${code}`][index]?.trim()||"");
      return values.every(value=>!value)||values.every(Boolean);
    });
    const explanations=["en","hi","sat"].map(code=>form[`explanation_${code}`]?.trim()||"");
    const explanationsComplete=explanations.every(value=>!value)||explanations.every(Boolean);
    if(!optionsComplete||!explanationsComplete){
      alert(t("optionsTranslationRequired"));
      return;
    }

    if(["en","hi","sat"].some(code=>!form[`options_${code}`][form.correctIndex]?.trim())){
      alert(t("selectedAnswerRequired"));
      return;
    }

    setBusy(true);

    const payload={
      module_id:form.module_id,
      type:form.type,

      question_en:form.question_en.trim(),
      question_hi:form.question_hi.trim(),
      question_sat:form.question_sat.trim(),

      options_en:form.options_en,
      options_hi:form.options_hi,
      options_sat:form.options_sat,

      correct_answers:[
        form.options_en[
          form.correctIndex
        ]
      ],

      explanation_en:
        form.explanation_en,
      explanation_hi:
        form.explanation_hi,
      explanation_sat:
        form.explanation_sat,

      media_url:
        form.media_url||null,

      sort_order:
        Number(form.sort_order)||0
    };

    let result;

    if(editing){
      result=await supabase
        .from("questions")
        .update(payload)
        .eq("id",id);
    }else{
      result=await supabase
        .from("questions")
        .insert(payload);
    }

    setBusy(false);

    if(result.error){
      alert(result.error.message);
      return;
    }

    nav(
      `/admin/questions?module=${
        form.module_id
      }`
    );
  }

  async function remove(){
    if(!editing)return;

    if(!confirm(t("questionDeleteConfirm"))){
      return;
    }

    const {error}=await supabase
      .from("questions")
      .delete()
      .eq("id",id);

    if(error){
      alert(error.message);
      return;
    }

    nav("/admin/questions");
  }

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow={t("questionEditor").toUpperCase()}
          title={
            editing
              ?t("editQuestion")
              :t("addQuestion")
          }
          description={t("regionalLanguagesDesc")}
        />

        <form
          className="admin-editor"
          onSubmit={save}
        >
          <section className="admin-panel">
            <div className="admin-form-grid">
              <label>
                {t("module")}

                <select
                  value={form.module_id}
                  onChange={e=>
                    setForm({
                      ...form,
                      module_id:e.target.value
                    })
                  }
                >
                  {modules.map(module=>(
                    <option
                      key={module.id}
                      value={module.id}
                    >
                      {module.title[lang]||module.title.en}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t("questionType")}

                <select
                  value={form.type}
                  onChange={e=>
                    setForm({
                      ...form,
                      type:e.target.value
                    })
                  }
                >
                  <option value="mcq">
                    {labels.mcq}
                  </option>
                  <option value="scenario">
                    {labels.scenario}
                  </option>
                  <option value="image">
                    {labels.image}
                  </option>
                  <option value="true_false">
                    {labels.true_false}
                  </option>
                </select>
              </label>

              <label>
                {t("sortOrder")}

                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e=>
                    setForm({
                      ...form,
                      sort_order:e.target.value
                    })
                  }
                />
              </label>

              <label>
                {t("imageOptional")}

                <input
                  value={form.media_url||""}
                  onChange={e=>
                    setForm({
                      ...form,
                      media_url:e.target.value
                    })
                  }
                  placeholder="https://..."
                />
              </label>
            </div>
          </section>

          {[
            ["en","English"],
            ["hi","हिन्दी"],
            ["sat","Santali / ᱥᱟᱱᱛᱟᱲᱤ"]
          ].map(([code,name])=>(
            <section
              className="admin-panel language-editor"
              key={code}
            >
              <h2>{name}</h2>

              <label>
                {t("question")}

                <textarea
                  required={code==="en"}
                  rows="3"
                  value={
                    form[`question_${code}`]
                  }
                  onChange={e=>
                    setForm({
                      ...form,
                      [`question_${code}`]:
                        e.target.value
                    })
                  }
                />
              </label>

              <div className="option-editor">
                {[0,1,2,3].map(index=>(
                  <label key={index}>
                    <input
                      type="radio"
                      name="correct"
                      checked={
                        form.correctIndex===index
                      }
                      onChange={()=>
                        setForm({
                          ...form,
                          correctIndex:index
                        })
                      }
                    />

                    <span>
                      {String.fromCharCode(
                        65+index
                      )}
                    </span>

                    <input
                      value={
                        form[
                          `options_${code}`
                        ][index]
                      }
                      onChange={e=>
                        setOption(
                          code,
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`${labels.option} ${String.fromCharCode(65+index)}`}
                    />
                  </label>
                ))}
              </div>

              <label>
                {t("explanation")}

                <textarea
                  rows="2"
                  value={
                    form[
                      `explanation_${code}`
                    ]||""
                  }
                  onChange={e=>
                    setForm({
                      ...form,
                      [`explanation_${code}`]:
                        e.target.value
                    })
                  }
                />
              </label>
            </section>
          ))}

          <div className="admin-form-actions">
            {editing&&(
              <button
                type="button"
                className="admin-danger"
                onClick={remove}
              >
                <Trash2/>
                {t("delete")}
              </button>
            )}

            <button
              className="admin-primary"
              disabled={busy}
            >
              <Save/>

              {busy?t("pleaseWait"):t("save")}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}