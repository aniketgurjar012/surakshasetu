import {useNavigate,useParams} from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck
} from "lucide-react";
import Navbar from "../../components/Navbar";
import {getModule} from "../../data/modules";
import {useApp} from "../../context/AppContext";

export default function Module(){
  const {id}=useParams();
  const nav=useNavigate();
  const {lang,t}=useApp();

  const module=getModule(id);

  if(!module){
    return <div>{t("moduleNotFound")}</div>;
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
          {t("backToDashboard")}
        </button>

        <section
          className="module-detail-hero"
          style={{"--module":module.color}}
        >
          <div className="big-module-icon">
            {module.icon}
          </div>

          <div>
            <span>{t("safetyModule").toUpperCase()}</span>
            <h1>
              {module.title[lang]||
               module.title.en}
            </h1>

            <p>
              {module.description[lang]||
               module.description.en}
            </p>
          </div>
        </section>

        <section className="module-learning">
          <article className="panel">
            <div className="title-row">
              <div>
                <span>01 • {t("understand").toUpperCase()}</span>
                <h2>{t("learningObjectives")}</h2>
              </div>
              <BookOpen/>
            </div>

            {module.topics.map(topic=>(
              <div
                className="learning-point"
                key={topic.en}
              >
                <CheckCircle2/>
                {topic[lang]||topic.en}
              </div>
            ))}
          </article>

          <article className="panel">
            <div className="title-row">
              <div>
                <span>02 • {t("safetyPrinciple").toUpperCase()}</span>
                <h2>{t("remember")}</h2>
              </div>
              <ShieldCheck/>
            </div>

            <p className="training-copy">
              {t("safetyPrincipleText")}
            </p>
          </article>
        </section>

        <section className="module-action-grid">
          <button
            className="action-card"
            onClick={()=>
              nav(`/worker/ar/${module.id}`)
            }
          >
            <Camera/>
            <div>
              <strong>
                {t("practical")}
              </strong>
              <span>
                {t("cameraExercise")}
              </span>
            </div>
          </button>

          <button
            className="action-card assessment-action"
            onClick={()=>
              nav(`/worker/assessment/${module.id}`)
            }
          >
            <ClipboardCheck/>
            <div>
              <strong>
                {t("startAssessment")}
              </strong>
              <span>
                {t("completeModuleTest")}
              </span>
            </div>
          </button>
        </section>
      </main>
    </>
  );
}