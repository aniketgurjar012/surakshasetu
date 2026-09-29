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
  const {lang}=useApp();

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

  function localizedOptions(q){
    if(lang==="hi"&&q.options_hi?.length){
      return q.options_hi;
    }

    if(lang==="sat"&&q.options_sat?.length){
      return q.options_sat;
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
          Dashboard
        </button>

        <section className="result-hero panel">
          {passed
            ?<CheckCircle2 className="result-pass"/>
            :<XCircle className="result-fail"/>}

          <span>ASSESSMENT RESULT</span>

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
              ?"Assessment completed"
              :"Review the module and try again"}
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
              Generate Certificate
            </button>
          )}
        </section>

        {review&&(
          <section className="review-section">
            <div className="title-row">
              <div>
                <span>ANSWER REVIEW</span>
                <h2>
                  Correct answers
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

                const selected=
                  review.answers[q.id];

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
                      Question {index+1}
                    </span>

                    <h3>
                      {lang==="hi"
                        ?q.question_hi||
                         q.question_en
                        :lang==="sat"
                          ?q.question_sat||
                           q.question_en
                          :q.question_en}
                    </h3>

                    <p>
                      Your answer:
                      {" "}
                      <b>{selected}</b>
                    </p>

                    {!isCorrect&&(
                      <p>
                        Correct answer:
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
                          ?"Correct"
                          :"Incorrect"
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