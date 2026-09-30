import {
  useEffect,
  useMemo,
  useState
} from "react";
import {
  ArrowLeft,
  AlertTriangle,
  ClipboardCheck
} from "lucide-react";
import {
  useNavigate,
  useParams
} from "react-router-dom";
import Navbar from "../../components/Navbar";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";
import {getModule} from "../../data/modules";

export default function Assessment(){
  const {id}=useParams();
  const nav=useNavigate();

  const {profile,lang,t}=useApp();
  const module=getModule(id);

  const [questions,setQuestions]=useState([]);
  const [answers,setAnswers]=useState({});
  const [loading,setLoading]=useState(true);
  const [started,setStarted]=useState(false);
  const [invalid,setInvalid]=useState(false);
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    async function load(){
      const {data,error}=
        await supabase
          .from("questions")
          .select(
            "id,module_id,type,question_en,question_hi,question_sat,options_en,options_hi,options_sat,correct_answers,explanation_en,explanation_hi,explanation_sat,sort_order"
          )
          .eq("module_id",id)
          .order("sort_order");

      if(error){
        console.error(error);
      }

      setQuestions(data||[]);
      setLoading(false);
    }

    load();
  },[id]);

  useEffect(()=>{
    if(!started) return;

    function visibility(){
      if(document.hidden){
        setInvalid(true);
      }
    }

    document.addEventListener(
      "visibilitychange",
      visibility
    );

    return ()=>document.removeEventListener(
      "visibilitychange",
      visibility
    );
  },[started]);

  const allAnswered=useMemo(
    ()=>questions.length>0 &&
      questions.every(q=>answers[q.id]),
    [questions,answers]
  );
  const translationsComplete=questions.every(q=>
    q.question_en?.trim()&&
    q.question_hi?.trim()&&
    q.question_sat?.trim()&&
    (q.options_en||[]).every((option,index)=>
      !option?.trim()||Boolean(
        q.options_hi?.[index]?.trim()&&
        q.options_sat?.[index]?.trim()
      )
    )&&
    (!q.explanation_en?.trim()||Boolean(
      q.explanation_hi?.trim()&&
      q.explanation_sat?.trim()
    ))
  );

  function text(q,type){
    if(lang==="hi"){
      return q[`${type}_hi`]||t("translationUnavailable");
    }

    if(lang==="sat"){
      return q[`${type}_sat`]||t("translationUnavailable");
    }

    return q[`${type}_en`];
  }

  function options(q){
    if(lang==="hi"&&q.options_hi?.length){
      return q.options_hi;
    }

    if(lang==="sat"&&q.options_sat?.length){
      return q.options_sat;
    }

    return q.options_en||[];
  }

  async function submit(){
    if(!allAnswered||invalid||submitting){
      return;
    }

    setSubmitting(true);

    let score=0;

    questions.forEach(q=>{
      const correct=q.correct_answers?.[0];

      /*
        Correct answers in initial data are
        canonical English values. When localized
        options differ, match by option index.
      */

      const enOptions=q.options_en||[];
      const localized=options(q);
      const correctIndex=enOptions.indexOf(correct);
      const selectedIndex=
        localized.indexOf(answers[q.id]);

      if(
        correctIndex!==-1 &&
        correctIndex===selectedIndex
      ){
        score++;
      }
    });

    const percentage=
      Math.round(
        (score/questions.length)*100
      );

    const {data,error}=
      await supabase
        .from("submissions")
        .insert({
          worker_id:profile.id,
          module_id:id,
          answers,
          score,
          total:questions.length,
          percentage,
          status:"completed"
        })
        .select()
        .single();

    if(error){
      alert(error.message);
      setSubmitting(false);
      return;
    }

    sessionStorage.setItem(
      `review-${data.id}`,
      JSON.stringify({
        questions,
        answers,
        lang
      })
    );

    nav(`/worker/result/${data.id}`);
  }

  if(loading){
    return (
      <div className="loader-page">
        <div className="spinner"/>
      </div>
    );
  }

  if(!started){
    return (
      <>
        <Navbar/>

        <main className="dashboard">
          <button
            className="back-inline"
            onClick={()=>
              nav(`/worker/module/${id}`)
            }
          >
            <ArrowLeft/>
            {t("backToDashboard")}
          </button>

          <section className="assessment-intro panel">
            <ClipboardCheck size={45}/>

            <h1>
              {module?.title?.[lang]||
               module?.title?.en}
            </h1>

            <h2>{t("assessment")}</h2>

            <p>
              {questions.length} {t("questions").toLowerCase()}. {t("completeAllQuestions")}
            </p>

            <div className="assessment-warning">
              <AlertTriangle/>
              {t("assessmentSwitchWarning")}
            </div>

            {!questions.length?(
              <p>
                {t("noQuestionsConfigured")}
              </p>
            ):!translationsComplete?(
              <p className="form-error">{t("translationsIncomplete")}</p>
            ):(
              <button
                className="primary"
                onClick={()=>setStarted(true)}
              >
                {t("startAssessment")}
              </button>
            )}
          </section>
        </main>
      </>
    );
  }

  if(invalid){
    return (
      <>
        <Navbar/>

        <main className="dashboard">
          <section className="invalid-attempt panel">
            <AlertTriangle size={48}/>

            <h1>
              {t("attemptInterrupted")}
            </h1>

            <p>
              {t("attemptNotSubmitted")}
            </p>

            <button
              className="primary"
              onClick={()=>
                window.location.reload()
              }
            >
              {t("restartAssessment")}
            </button>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar/>

      <main className="assessment-page">
        <div className="assessment-header">
          <div>
            <span>
              {t("activeAssessment").toUpperCase()}
            </span>

            <h1>
              {module?.title?.[lang]||
               module?.title?.en}
            </h1>
          </div>

          <strong>
            {
              Object.keys(answers).length
            }/{questions.length}
          </strong>
        </div>

        <div className="question-stack">
          {questions.map((q,index)=>(
            <article
              className="question-card"
              key={q.id}
            >
              <span>
                {t("question").toUpperCase()} {index+1}
              </span>

              <h2>
                {text(q,"question")}
              </h2>

              {q.media_url&&(
                <img
                  src={q.media_url}
                  alt=""
                  className="question-media"
                />
              )}

              <div className="answer-options">
                {options(q).map(
                  (option,optionIndex)=>(
                    <label
                      className={
                        answers[q.id]===option
                          ?"selected"
                          :""
                      }
                      key={optionIndex}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={
                          answers[q.id]===option
                        }
                        onChange={()=>
                          setAnswers({
                            ...answers,
                            [q.id]:option
                          })
                        }
                      />

                      <b>
                        {
                          String.fromCharCode(
                            65+optionIndex
                          )
                        }
                      </b>

                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="submit-bar">
          <span>
            {t("answered")} {
              Object.keys(answers).length
            } {t("of")} {questions.length}
          </span>

          <button
            className="primary"
            disabled={
              !allAnswered||submitting
            }
            onClick={submit}
          >
            {submitting
              ?t("submitting")
              :t("submitAssessment")}
          </button>
        </div>
      </main>
    </>
  );
}