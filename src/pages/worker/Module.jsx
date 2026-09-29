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
  const {lang}=useApp();

  const module=getModule(id);

  if(!module){
    return <div>Module not found.</div>;
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
          Back to dashboard
        </button>

        <section
          className="module-detail-hero"
          style={{"--module":module.color}}
        >
          <div className="big-module-icon">
            {module.icon}
          </div>

          <div>
            <span>SAFETY TRAINING MODULE</span>
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
                <span>01 • UNDERSTAND</span>
                <h2>Learning objectives</h2>
              </div>
              <BookOpen/>
            </div>

            {module.topics.map(topic=>(
              <div
                className="learning-point"
                key={topic}
              >
                <CheckCircle2/>
                {topic}
              </div>
            ))}
          </article>

          <article className="panel">
            <div className="title-row">
              <div>
                <span>02 • SAFETY PRINCIPLE</span>
                <h2>Remember</h2>
              </div>
              <ShieldCheck/>
            </div>

            <p className="training-copy">
              Stop and assess the hazard before
              acting. Follow site procedures,
              warning signs, authorised isolation,
              required PPE and emergency
              instructions. Never enter a hazardous
              area merely to complete a training
              activity.
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
                Interactive Practical
              </strong>
              <span>
                Camera-assisted hazard exercise
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
                Start Assessment
              </strong>
              <span>
                Complete the module test
              </span>
            </div>
          </button>
        </section>
      </main>
    </>
  );
}