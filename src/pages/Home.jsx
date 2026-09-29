import {useNavigate} from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Camera, CheckCircle2, CloudOff,
  Languages, QrCode, ShieldCheck, Smartphone, Users
} from "lucide-react";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";
import {modules} from "../data/modules";
import {useApp} from "../context/AppContext";

export default function Home(){
  const nav=useNavigate();
  const {lang,t}=useApp();

  return <>
    <Navbar/>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <ShieldCheck size={17}/> Smart Industrial Safety Training
          </div>
          <h1>Safety training that workers can <span>see, practise and remember.</span></h1>
          <p>
            SurakshaSetu brings interactive safety training, camera-based
            practical scenarios, assessments and verifiable certification
            to mining and manufacturing workers across Jharkhand.
          </p>
          <div className="hero-buttons">
            <button className="primary" onClick={()=>nav("/auth?mode=register")}>
              Get Started <ArrowRight size={18}/>
            </button>
            <button className="secondary" onClick={()=>nav("/verify")}>
              <QrCode size={18}/> {t("verify")}
            </button>
          </div>

          <div className="trust-row">
            <span><CheckCircle2/>Android 10+</span>
            <span><CheckCircle2/>No headset</span>
            <span><CheckCircle2/>{t("offline")}</span>
          </div>
        </div>

        <div className="safety-panel">
          <div className="phone-frame">
            <div className="phone-top"/>
            <Logo/>
            <h3>Industrial Safety</h3>
            <div className="mini-progress"><i/></div>
            <div className="mini-grid">
              <div>🔥<b>Fire Safety</b></div>
              <div>☣️<b>Gas Safety</b></div>
              <div>⚙️<b>Machinery</b></div>
              <div>⚡<b>Electrical</b></div>
            </div>
            <div className="safe-message">
              <ShieldCheck/> Safety readiness: 82%
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div><strong>5</strong><span>Safety domains</span></div>
        <div><strong>3</strong><span>Languages</span></div>
        <div><strong>AR</strong><span>Camera training</span></div>
        <div><strong>QR</strong><span>Verified certificates</span></div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span>Training ecosystem</span>
          <h2>One platform, complete safety journey</h2>
          <p>Learn concepts, practise scenarios, prove understanding and carry a verifiable safety record.</p>
        </div>

        <div className="feature-grid">
          <Feature icon={<Camera/>} title="Interactive AR Training"
            text="Camera-led hazard recognition and interactive safety scenarios without an external headset."/>
          <Feature icon={<CloudOff/>} title="Low-connectivity Ready"
            text="Optimised training assets and PWA caching for field environments with unreliable internet."/>
          <Feature icon={<Languages/>} title="Regional Language Access"
            text="English, Hindi and Santali content architecture for a more accessible worker experience."/>
          <Feature icon={<QrCode/>} title="QR Certification"
            text="Unique certificate records connected to a public verification flow."/>
          <Feature icon={<Users/>} title="Admin Compliance"
            text="Worker, assessment, certification and completion information in one dashboard."/>
          <Feature icon={<Smartphone/>} title="Mobile First"
            text="Responsive interface designed around affordable Android smartphones."/>
        </div>
      </section>

      <section className="modules-section">
        <div className="section-heading">
          <span>{t("modules")}</span>
          <h2>Practical training for critical hazards</h2>
        </div>

        <div className="module-grid">
          {modules.map((m,i)=>
            <article className="module-card" key={m.id}
              style={{"--module":m.color}}>
              <div className="module-number">0{i+1}</div>
              <div className="module-icon">{m.icon}</div>
              <h3>{m.title[lang]}</h3>
              <ul>{m.topics.map(x=><li key={x}>{x}</li>)}</ul>
            </article>
          )}
        </div>
      </section>

      <section className="workflow section">
        <div className="section-heading">
          <span>How it works</span>
          <h2>From learning to verified certification</h2>
        </div>

        <div className="steps">
          {[
            ["01","Learn","Study visual safety content"],
            ["02","Practise","Complete interactive scenarios"],
            ["03","Assess","Answer module assessments"],
            ["04","Certify","Receive a QR-verifiable record"]
          ].map(([n,a,b])=>
            <div className="step" key={n}>
              <b>{n}</b><h3>{a}</h3><p>{b}</p>
            </div>
          )}
        </div>
      </section>

      <section className="cta">
        <BadgeCheck size={45}/>
        <h2>Build a safer, better-prepared workforce.</h2>
        <p>Training, assessment and compliance connected through one simple platform.</p>
        <button className="light-button" onClick={()=>nav("/auth?mode=register")}>
          Access SurakshaSetu <ArrowRight size={18}/>
        </button>
      </section>
    </main>

    <footer>
      <Logo/>
      <p>Industrial safety learning for Jharkhand's workforce.</p>
      <span>Developed by <b>Code Buddies+</b> • SIH Problem Statement 26041</span>
    </footer>
  </>;
}

function Feature({icon,title,text}){
  return <article className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3><p>{text}</p>
  </article>;
}