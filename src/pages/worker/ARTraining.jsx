import {
  useEffect,
  useRef,
  useState
} from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import Navbar from "../../components/Navbar";
import {getModule} from "../../data/modules";
import {useApp} from "../../context/AppContext";
import {supabase} from "../../lib/supabase";

const exercises={
  fire:{
    prompt:"Identify the safest emergency exit.",
    options:[
      "Marked emergency exit",
      "Blocked corridor",
      "Lift"
    ],
    answer:"Marked emergency exit"
  },

  gas:{
    prompt:"A gas hazard is suspected. Choose the safest action.",
    options:[
      "Enter alone",
      "Control access and follow gas/confined-space procedure",
      "Remove PPE"
    ],
    answer:
      "Control access and follow gas/confined-space procedure"
  },

  machine:{
    prompt:"Choose the safe action before machinery maintenance.",
    options:[
      "Approved energy isolation",
      "Leave it running",
      "Remove machine guards"
    ],
    answer:"Approved energy isolation"
  },

  electrical:{
    prompt:"You identify damaged electrical equipment.",
    options:[
      "Isolate and report",
      "Touch the cable",
      "Use water"
    ],
    answer:"Isolate and report"
  },

  ppe:{
    prompt:"Choose head protection for a falling-object hazard.",
    options:[
      "Safety helmet",
      "Ear plugs",
      "Gloves only"
    ],
    answer:"Safety helmet"
  }
};

export default function ARTraining(){
  const {id}=useParams();
  const nav=useNavigate();

  const module=getModule(id);
  const exercise=exercises[id];

  const {profile}=useApp();

  const videoRef=useRef(null);
  const streamRef=useRef(null);

  const [camera,setCamera]=useState(false);
  const [message,setMessage]=useState("");
  const [complete,setComplete]=useState(false);

  async function startCamera(){
    try{
      const stream=
        await navigator.mediaDevices
          .getUserMedia({
            video:{
              facingMode:{
                ideal:"environment"
              }
            },
            audio:false
          });

      streamRef.current=stream;

      if(videoRef.current){
        videoRef.current.srcObject=stream;
      }

      setCamera(true);
    }catch{
      setMessage(
        "Camera permission unavailable. You can still complete the interactive simulation."
      );
    }
  }

  async function choose(option){
    if(option!==exercise.answer){
      setMessage(
        "Incorrect. Review the hazard and choose the safest action."
      );
      return;
    }

    setMessage(
      "Correct. Practical exercise completed safely."
    );

    setComplete(true);

    if(supabase&&profile){
      await supabase
        .from("training_progress")
        .upsert({
          worker_id:profile.id,
          module_id:id,
          ar_completed:true,
          updated_at:
            new Date().toISOString()
        },{
          onConflict:"worker_id,module_id"
        });
    }
  }

  useEffect(()=>{
    return ()=>{
      streamRef.current
        ?.getTracks()
        .forEach(track=>track.stop());
    };
  },[]);

  return (
    <>
      <Navbar/>

      <main className="dashboard">
        <button
          className="back-inline"
          onClick={()=>nav(`/worker/module/${id}`)}
        >
          <ArrowLeft/>
          Back
        </button>

        <div className="ar-layout">
          <section className="camera-stage">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />

            {!camera&&(
              <div className="camera-placeholder">
                <Camera size={45}/>
                <h2>
                  Camera-assisted practical
                </h2>

                <button
                  className="primary"
                  onClick={startCamera}
                >
                  <Camera/>
                  Enable Camera
                </button>
              </div>
            )}

            <div className="ar-reticle">
              <span/>
            </div>

            <div className="ar-label">
              {module?.icon}
              {module?.title?.en}
            </div>
          </section>

          <section className="panel ar-task">
            <span>
              PRACTICAL SAFETY TASK
            </span>

            <h2>
              {exercise.prompt}
            </h2>

            <p>
              Select the safest response based
              on your training.
            </p>

            <div className="ar-options">
              {exercise.options.map(option=>(
                <button
                  key={option}
                  onClick={()=>choose(option)}
                  disabled={complete}
                >
                  {option}
                </button>
              ))}
            </div>

            {message&&(
              <div
                className={
                  complete
                    ?"ar-success"
                    :"ar-warning"
                }
              >
                {complete
                  ?<CheckCircle2/>
                  :<ShieldAlert/>}
                {message}
              </div>
            )}

            {complete&&(
              <button
                className="primary full"
                onClick={()=>
                  nav(
                    `/worker/assessment/${id}`
                  )
                }
              >
                Continue to Assessment
              </button>
            )}
          </section>
        </div>
      </main>
    </>
  );
}