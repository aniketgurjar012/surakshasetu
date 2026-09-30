import {useEffect,useState} from "react";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  useNavigate,
  useParams
} from "react-router-dom";
import Navbar from "../../components/Navbar";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";
import {getModule} from "../../data/modules";

export default function Result(){
  const {submissionId}=useParams();
  const nav=useNavigate();
  const {lang,t}=useApp();

  const [submission,setSubmission]=useState(null);
  const [review,setReview]=useState(null);

  useEffect(()=>{
    supabase
      .from("submissions")
      .select("*")
      .eq("id",submissionId)
      .single()
      .then(({data})=>setSubmission(data));

    const cached=
      sessionStorage.getItem(
        `review-${submissionId}`
      );

    if(cached){
      setReview(JSON.parse(cached));
    }
  },[submissionId]);

  if(!submission){
    return (
      <div className="loader-page">
        <div className="spinner"/>
      </div>
    );
  }

  const module=
    getModule(submission.module_id);

  const passed=
    Number(submission.percentage)>=60;

  function localizedOptions(q,language=lang){
    if(language==="hi"){
      return q.options_hi||[];
    }

    if(language==="sat"){
      return q.options_sat||[];
    }

    return q.options_en||[];
  }

  return (
    <>
      <Navbar/>

      <main className="dashboard">
        <button
          className="back-inline"
          onClick={()=>nav("/worker")}
        >
          <ArrowLeft/>
          {t("dashboardBack")}
        </button>

        <section className="result-hero panel">
          {passed
            ?<CheckCircle2 className="result-pass"/>
            :<XCircle className="result-fail"/>}

          <span>{t("assessmentResult").toUpperCase()}</span>

          <h1>
            {module?.title?.[lang]||
             module?.title?.en}
          </h1>

          <div className="score-circle">
            <strong>
              {Math.round(
                submission.percentage
              )}%
            </strong>

            <span>
              {submission.score}/
              {submission.total}
            </span>
          </div>

          <h2>
            {passed
              ?t("assessmentCompleted")
              :t("reviewAndRetry")}
          </h2>

          {passed&&(
            <button
              className="primary"
              onClick={()=>
                nav(
                  `/worker/certificate/create/${submission.id}`
                )
              }
            >
              <Award/>
              {t("generateCertificate")}
            </button>
          )}
        </section>

        {review&&(
          <section className="review-section">
            <div className="title-row">
              <div>
                <span>{t("answerReview").toUpperCase()}</span>
                <h2>
                  {t("correctAnswers")}
                </h2>
              </div>
            </div>

            {review.questions.map(
              (q,index)=>{
                const localized=
                  localizedOptions(q);

                const correctIndex=
                  (q.options_en||[])
                    .indexOf(
                      q.correct_answers?.[0]
                    );

                const correct=
                  localized[correctIndex];

                const sourceOptions=localizedOptions(q,review.lang||lang);
                const selectedIndex=sourceOptions.indexOf(review.answers[q.id]);
                const selected=localizedOptions(q,lang)[selectedIndex]||t("translationUnavailable");

                const isCorrect=
                  selected===correct;

                return (
                  <article
                    className={
                      `review-card ${
                        isCorrect
                          ?"correct"
                          :"wrong"
                      }`
                    }
                    key={q.id}
                  >
                    <span>
                      {t("question")} {index+1}
                    </span>

                    <h3>
                      {lang==="hi"
                        ?q.question_hi||
                         q.question_en
                        :lang==="sat"
                          ?q.question_sat||t("translationUnavailable")
                          :q.question_en||t("translationUnavailable")}
                    </h3>

                    <p>
                      {t("yourAnswer")}
                      {" "}
                      <b>{selected}</b>
                    </p>

                    {!isCorrect&&(
                      <p>
                        {t("correctAnswer")}
                        {" "}
                        <b>{correct}</b>
                      </p>
                    )}

                    <div>
                      {isCorrect
                        ?<CheckCircle2/>
                        :<XCircle/>}
                      {
                        isCorrect
                          ?t("correct")
                          :t("incorrect")
                      }
                    </div>
                  </article>
                );
              }
            )}
          </section>
        )}
      </main>
    </>
  );
}