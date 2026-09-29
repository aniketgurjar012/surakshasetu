import {
  useEffect,
  useRef,
  useState
} from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Volume2
} from "lucide-react";
import {useNavigate,useParams} from "react-router-dom";
import Navbar from "../../components/Navbar";
import {getModule} from "../../data/modules";
import {useApp} from "../../context/AppContext";
import {supabase} from "../../lib/supabase";

const exercises={
  fire:{
    prompt:{en:"Identify the safest emergency exit.",hi:"सबसे सुरक्षित आपातकालीन निकास पहचानें।"},
    target:{en:"Marked exit or evacuation route",hi:"चिह्नित निकास या बाहर जाने का रास्ता"},
    steps:[
      {en:"Scan the scene for an exit sign and route.",hi:"निकास के संकेत और रास्ते को ध्यान से देखें।"},
      {en:"Tap the area you want to identify.",hi:"जिस जगह को पहचानना है, उस पर टैप करें।"},
      {en:"Choose a clear exit, not a blocked route or lift.",hi:"खुला निकास चुनें, बंद रास्ता या लिफ्ट नहीं।"}
    ],
    options:[
      {label:{en:"Marked emergency exit",hi:"चिह्नित आपातकालीन निकास"},correct:true,feedback:{en:"Correct. Use the marked exit and follow the evacuation signs.",hi:"सही। चिह्नित निकास से जाएँ और निकासी संकेतों का पालन करें।"}},
      {label:{en:"Blocked corridor",hi:"बंद गलियारा"},feedback:{en:"A blocked route can trap people. Keep clear and use another marked exit.",hi:"बंद रास्ते में लोग फँस सकते हैं। वहाँ से न जाएँ, दूसरा चिह्नित निकास चुनें।"}},
      {label:{en:"Lift",hi:"लिफ्ट"},feedback:{en:"Do not use a lift during a fire. Use the marked stairs or emergency exit.",hi:"आग लगने पर लिफ्ट का उपयोग न करें। चिह्नित सीढ़ियों या आपातकालीन निकास से जाएँ।"}}
    ]
  },

  gas:{
    prompt:{en:"A gas hazard is suspected. Choose the safest action.",hi:"गैस का खतरा हो सकता है। सबसे सुरक्षित कदम चुनें।"},
    target:{en:"Suspected hazard zone or access point",hi:"संदिग्ध खतरे वाली जगह या प्रवेश बिंदु"},
    steps:[
      {en:"Observe the area from a safe distance.",hi:"सुरक्षित दूरी से जगह का निरीक्षण करें।"},
      {en:"Mark the suspected zone without entering it.",hi:"अंदर जाए बिना संदिग्ध जगह पर निशान लगाएँ।"},
      {en:"Choose the access-control and emergency procedure.",hi:"प्रवेश नियंत्रण और आपातकालीन प्रक्रिया चुनें।"}
    ],
    options:[
      {label:{en:"Enter alone",hi:"अकेले अंदर जाना"},feedback:{en:"Never enter a suspected gas or confined-space hazard alone. The atmosphere may be immediately dangerous.",hi:"गैस या सीमित जगह के संदिग्ध खतरे में अकेले कभी न जाएँ। हवा तुरंत जानलेवा हो सकती है।"}},
      {label:{en:"Control access and follow gas/confined-space procedure",hi:"प्रवेश रोकें और गैस/सीमित जगह की प्रक्रिया अपनाएँ"},correct:true,feedback:{en:"Correct. Keep people out and follow the site gas or confined-space emergency procedure.",hi:"सही। लोगों को दूर रखें और साइट की गैस या सीमित जगह वाली आपातकालीन प्रक्रिया अपनाएँ।"}},
      {label:{en:"Remove PPE",hi:"सुरक्षा उपकरण हटाना"},feedback:{en:"Removing PPE increases exposure. Do not enter; follow the approved procedure and use trained responders.",hi:"सुरक्षा उपकरण हटाने से खतरा बढ़ता है। अंदर न जाएँ; स्वीकृत प्रक्रिया और प्रशिक्षित सहायता लें।"}}
    ]
  },

  machine:{
    prompt:{en:"Choose the safe action before machinery maintenance.",hi:"मशीन की मरम्मत से पहले सुरक्षित कदम चुनें।"},
    target:{en:"Machine or energy-isolation point",hi:"मशीन या ऊर्जा बंद करने का बिंदु"},
    steps:[
      {en:"Identify the machine and its hazard area.",hi:"मशीन और उसके खतरे वाले हिस्से को पहचानें।"},
      {en:"Tap the machine or isolation point to mark it.",hi:"मशीन या ऊर्जा बंद करने वाले बिंदु पर टैप करें।"},
      {en:"Choose approved isolation before maintenance.",hi:"मरम्मत से पहले स्वीकृत आइसोलेशन चुनें।"}
    ],
    options:[
      {label:{en:"Approved energy isolation",hi:"स्वीकृत ऊर्जा आइसोलेशन"},correct:true,feedback:{en:"Correct. Isolate, lock and tag the energy source, then verify it is safe before work.",hi:"सही। ऊर्जा स्रोत बंद करके लॉक और टैग करें, फिर काम से पहले जाँचें कि मशीन सुरक्षित है।"}},
      {label:{en:"Leave it running",hi:"मशीन चालू छोड़ना"},feedback:{en:"A running machine can start or move unexpectedly. Stop and isolate it using the approved procedure.",hi:"चालू मशीन अचानक चल सकती है। स्वीकृत प्रक्रिया से उसे रोकें और आइसोलेट करें।"}},
      {label:{en:"Remove machine guards",hi:"मशीन के गार्ड हटाना"},feedback:{en:"Guards protect people from moving parts. Never remove them as a substitute for isolation.",hi:"गार्ड चलते हिस्सों से बचाते हैं। आइसोलेशन की जगह गार्ड कभी न हटाएँ।"}}
    ]
  },

  electrical:{
    prompt:{en:"You identify damaged electrical equipment.",hi:"आपको बिजली का खराब उपकरण दिखता है।"},
    target:{en:"Damaged equipment or cable area",hi:"खराब उपकरण या तार के पास का क्षेत्र"},
    steps:[
      {en:"Look for damage from a safe distance.",hi:"सुरक्षित दूरी से नुकसान देखें।"},
      {en:"Tap the area without touching the equipment.",hi:"उपकरण को छुए बिना उस जगह पर टैप करें।"},
      {en:"Choose the safe isolation and reporting action.",hi:"बिजली बंद कराने और रिपोर्ट करने का सुरक्षित कदम चुनें।"}
    ],
    options:[
      {label:{en:"Isolate and report",hi:"बिजली बंद कराएँ और रिपोर्ट करें"},correct:true,feedback:{en:"Correct. Keep clear, warn others and report it. Only an authorised person should isolate it.",hi:"सही। दूर रहें, दूसरों को चेतावनी दें और रिपोर्ट करें। केवल अधिकृत व्यक्ति ही बिजली बंद करे।"}},
      {label:{en:"Touch the cable",hi:"तार को छूना"},feedback:{en:"A damaged cable may still be live and can cause a fatal shock. Do not touch it.",hi:"खराब तार में बिजली हो सकती है और जानलेवा झटका लग सकता है। उसे न छुएँ।"}},
      {label:{en:"Use water",hi:"पानी डालना"},feedback:{en:"Water can conduct electricity and make the danger worse. Keep clear and report the hazard.",hi:"पानी से बिजली फैल सकती है और खतरा बढ़ सकता है। दूर रहें और खतरे की रिपोर्ट करें।"}}
    ]
  },

  ppe:{
    prompt:{en:"Choose head protection for a falling-object hazard.",hi:"ऊपर से वस्तु गिरने के खतरे के लिए सिर की सुरक्षा चुनें।"},
    target:{en:"Work area where head protection is needed",hi:"वह कार्यक्षेत्र जहाँ सिर की सुरक्षा चाहिए"},
    steps:[
      {en:"Scan the work area for overhead hazards.",hi:"ऊपर से गिरने वाली वस्तुओं के खतरे को देखें।"},
      {en:"Tap the area where head protection is needed.",hi:"जहाँ सिर की सुरक्षा चाहिए, वहाँ टैप करें।"},
      {en:"Choose head protection suited to the site rules.",hi:"साइट के नियमों के अनुसार सिर की सुरक्षा चुनें।"}
    ],
    options:[
      {label:{en:"Safety helmet",hi:"सुरक्षा हेलमेट"},correct:true,feedback:{en:"Correct. Wear an approved helmet suited to the site and hazard.",hi:"सही। साइट और खतरे के अनुसार स्वीकृत हेलमेट पहनें।"}},
      {label:{en:"Ear plugs",hi:"कान के प्लग"},feedback:{en:"Ear plugs protect hearing, not the head. Choose approved head protection for falling objects.",hi:"कान के प्लग सुनने की क्षमता बचाते हैं, सिर नहीं। गिरती वस्तुओं के लिए स्वीकृत हेलमेट चुनें।"}},
      {label:{en:"Gloves only",hi:"केवल दस्ताने"},feedback:{en:"Gloves protect hands, not the head. Wear the required helmet as well.",hi:"दस्ताने हाथों की रक्षा करते हैं, सिर की नहीं। जरूरी हेलमेट पहनें।"}}
    ]
  }
};

const getText=(value,lang)=>value?.[lang]||value?.en||value;

export default function ARTraining(){
  const {id}=useParams();
  const nav=useNavigate();

  const module=getModule(id);
  const exercise=exercises[id];

  const {profile,lang}=useApp();

  const videoRef=useRef(null);
  const stageRef=useRef(null);
  const streamRef=useRef(null);
  const detectorRef=useRef(null);
  const frameRef=useRef(null);

  const [camera,setCamera]=useState(false);
  const [marker,setMarker]=useState(null);
  const [detections,setDetections]=useState([]);
  const [detectorStatus,setDetectorStatus]=useState("idle");
  const [message,setMessage]=useState("");
  const [complete,setComplete]=useState(false);
  const [selectedOption,setSelectedOption]=useState(null);
  const [voiceError,setVoiceError]=useState("");

  const text=value=>getText(value,lang);
  const ui=(en,hi)=>lang==="hi"?hi:en;

  function markCameraView(event){
    if(!camera) return;

    const bounds=stageRef.current.getBoundingClientRect();
    setMarker({
      x:((event.clientX-bounds.left)/bounds.width)*100,
      y:((event.clientY-bounds.top)/bounds.height)*100
    });
  }

  function speak(content){
    if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
      setVoiceError(
        lang==="hi"
          ?"इस ब्राउज़र में आवाज़ उपलब्ध नहीं है।"
          :"Speech is not available in this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(content);
    utterance.lang=lang==="hi"?"hi-IN":"en-IN";
    window.speechSynthesis.speak(utterance);
    setVoiceError("");
  }

  function readGuidance(){
    const parts=[
      text(module?.title),
      text(exercise.prompt),
      ...exercise.steps.map(text)
    ];

    if(message) parts.push(message);
    speak(parts.join(". "));
  }

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
        ui(
          "Camera permission unavailable. You can still complete the interactive simulation.",
          "कैमरा अनुमति उपलब्ध नहीं है। आप फिर भी यह अभ्यास पूरा कर सकते हैं।"
        )
      );
    }
  }

  async function choose(option){
    const feedback=text(option.feedback);
    setSelectedOption(option);
    setMessage(feedback);

    if(!option.correct){
      return;
    }

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

  useEffect(()=>{
    if(!camera) return;

    let active=true;
    let lastScan=0;
    let detector;

    async function startDetection(){
      try{
        setDetectorStatus("loading");
        const {FilesetResolver,ObjectDetector}=await import("@mediapipe/tasks-vision");
        const vision=await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm"
        );
        detector=await ObjectDetector.createFromOptions(vision,{
          baseOptions:{
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite"
          },
          runningMode:"VIDEO",
          maxResults:6,
          scoreThreshold:.45
        });

        if(!active){
          detector.close();
          return;
        }

        detectorRef.current=detector;
        setDetectorStatus("active");

        function scan(timestamp){
          if(!active) return;

          const video=videoRef.current;
          if(timestamp-lastScan>400&&video?.readyState>=2){
            lastScan=timestamp;

            try{
              const result=detector.detectForVideo(video,timestamp);
              const stage=stageRef.current;
              const stageWidth=stage.clientWidth;
              const stageHeight=stage.clientHeight;
              const scale=Math.min(
                stageWidth/video.videoWidth,
                stageHeight/video.videoHeight
              );
              const offsetX=(stageWidth-video.videoWidth*scale)/2;
              const offsetY=(stageHeight-video.videoHeight*scale)/2;

              setDetections(result.detections.flatMap((item,index)=>{
                const box=item.boundingBox;
                if(!box) return [];
                const category=item.categories?.[0];
                return [{
                  id:`${category?.categoryName||"object"}-${index}`,
                  label:category?.displayName||category?.categoryName||"Object",
                  score:category?.score||0,
                  left:(offsetX+box.originX*scale)/stageWidth*100,
                  top:(offsetY+box.originY*scale)/stageHeight*100,
                  width:box.width*scale/stageWidth*100,
                  height:box.height*scale/stageHeight*100
                }];
              }));
            }catch{
              active=false;
              setDetectorStatus("stopped");
              return;
            }
          }

          frameRef.current=requestAnimationFrame(scan);
        }

        frameRef.current=requestAnimationFrame(scan);
      }catch{
        if(active){
          setDetectorStatus("failed");
        }
      }
    }

    startDetection();

    return ()=>{
      active=false;
      if(frameRef.current) cancelAnimationFrame(frameRef.current);
      detectorRef.current?.close();
      detectorRef.current=null;
      setDetections([]);
    };
  },[camera]);

  useEffect(()=>()=>window.speechSynthesis?.cancel(),[]);

  const activeStep=complete
    ?exercise.steps.length
    :!camera?0:!marker?1:2;
  const detectorStatusText={
    idle:ui("Object detection starts with the camera.","कैमरा चालू होने पर वस्तु पहचान शुरू होगी।"),
    loading:ui("Loading object detection model...","वस्तु पहचान मॉडल लोड हो रहा है..."),
    active:ui("Common objects only; hazards are not identified.","सामान्य वस्तुएँ ही पहचानी जाती हैं, खतरे नहीं।"),
    stopped:ui("Object detection stopped. Camera training is still available.","वस्तु पहचान रुक गई। कैमरा ट्रेनिंग जारी रख सकते हैं।"),
    failed:ui("Object detection could not load. Camera training is still available.","वस्तु पहचान लोड नहीं हुई। कैमरा ट्रेनिंग जारी रख सकते हैं।")
  }[detectorStatus];

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
          <section
            ref={stageRef}
            className={`camera-stage${camera?" camera-live":""}`}
          >
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
                  {ui("Camera-assisted practical","कैमरा के साथ व्यावहारिक अभ्यास")}
                </h2>
                <p className="ar-camera-privacy">
                  {ui(
                    "Video is processed on this device. MediaPipe may send usage metrics; camera frames are not sent to its servers.",
                    "वीडियो इसी डिवाइस पर प्रोसेस होता है। MediaPipe उपयोग के आँकड़े भेज सकता है; कैमरे के फ़्रेम उसके सर्वर पर नहीं भेजे जाते।"
                  )}
                </p>

                <button
                  className="primary"
                  onClick={startCamera}
                >
                  <Camera/>
                  {ui("Enable Camera","कैमरा चालू करें")}
                </button>
              </div>
            )}

            {camera&&(
              <>
                <button
                  type="button"
                  className="ar-tap-layer"
                  aria-label={`${ui("Mark","निशान लगाएँ")}: ${text(exercise.target)}`}
                  onClick={markCameraView}
                />
                <div
                  className={`ar-reticle${marker?" ar-reticle-marked":""}`}
                  style={marker?{
                    left:`${marker.x}%`,
                    top:`${marker.y}%`
                  }:undefined}
                >
                  <span/>
                </div>
                {detections.map(item=>(
                  <div
                    key={item.id}
                    className="ar-detection-box"
                    style={{
                      left:`${item.left}%`,
                      top:`${item.top}%`,
                      width:`${item.width}%`,
                      height:`${item.height}%`
                    }}
                  >
                    <span>{item.label} {Math.round(item.score*100)}%</span>
                  </div>
                ))}
                <div className="ar-camera-hint">
                  {marker
                    ?ui("Training point marked. Tap again to reposition.","ट्रेनिंग पॉइंट लग गया। जगह बदलने के लिए फिर टैप करें।")
                    :`${ui("Tap the view to mark:","जगह पर निशान लगाने के लिए टैप करें:")} ${text(exercise.target)}`}
                </div>
                <div className="ar-detector-status" aria-live="polite">
                  {detectorStatusText}
                </div>
              </>
            )}

            <div className="ar-label">
              <span>{module?.icon} {text(module?.title)}</span>
              <small>{ui("HEADSET-FREE CAMERA AR","बिना हेडसेट कैमरा AR")}</small>
            </div>
          </section>

          <section className="panel ar-task">
            <div className="ar-task-heading">
              <div>
                <span>{ui("PRACTICAL SAFETY TASK","व्यावहारिक सुरक्षा अभ्यास")}</span>
                <h2>{text(exercise.prompt)}</h2>
              </div>
              <button
                className="ar-read-button"
                onClick={readGuidance}
                title={ui("Read guidance aloud","निर्देश सुनें")}
              >
                <Volume2 size={18}/>
                {ui("Listen","सुनें")}
              </button>
            </div>

            <p>
              {ui(
                "Tap the live camera view to mark the relevant area, then choose the safest response. No headset required.",
                "कैमरा दृश्य में संबंधित जगह पर निशान लगाएँ, फिर सबसे सुरक्षित कदम चुनें। AR हेडसेट की जरूरत नहीं।"
              )}
            </p>

            {marker&&(
              <div className="ar-marked-note">
                <MapPin size={17}/>
                {ui("Training point placed on the camera view","कैमरा दृश्य में ट्रेनिंग पॉइंट लगाया गया")}
              </div>
            )}

            <ol className="ar-steps" aria-label={ui("Training steps","ट्रेनिंग के चरण")}>
              {exercise.steps.map((step,index)=>(
                <li
                  key={step.en}
                  className={`${index<activeStep?"done":""}${index===activeStep&&!complete?" active":""}`}
                >
                  <span>{index<activeStep||complete?<CheckCircle2 size={16}/>:index+1}</span>
                  {text(step)}
                </li>
              ))}
            </ol>

            <div className="ar-options">
              {exercise.options.map(option=>(
                <button
                  key={option.label.en}
                  className={`${selectedOption===option?(option.correct?"selected-correct":"selected-incorrect"):""}`}
                  onClick={()=>choose(option)}
                  disabled={complete}
                >
                  {text(option.label)}
                </button>
              ))}
            </div>

            {message&&(
              <div
                role="status"
                aria-live="polite"
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

            {voiceError&&(
              <div className="ar-voice-error" role="status">
                {voiceError}
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
                {ui("Continue to Assessment","मूल्यांकन जारी रखें")}
              </button>
            )}
          </section>
        </div>
      </main>
    </>
  );
}