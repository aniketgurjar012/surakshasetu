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
            <ShieldCheck size={17}/> {t("safetyEyebrow")}
          </div>
          <h1>{t("heroTitle")} <span>{t("heroTitleAccent")}</span></h1>
          <p>
            {t("heroDescription")}
          </p>
          <div className="hero-buttons">
            <button className="primary" onClick={()=>nav("/auth?mode=register")}>
              {t("getStarted")} <ArrowRight size={18}/>
            </button>
            <button className="secondary" onClick={()=>nav("/verify")}>
              <QrCode size={18}/> {t("verify")}
            </button>
          </div>

          <div className="trust-row">
            <span><CheckCircle2/>{t("android")}</span>
            <span><CheckCircle2/>{t("noHeadset")}</span>
            <span><CheckCircle2/>{t("offline")}</span>
          </div>
        </div>

        <div className="safety-panel">
          <div className="phone-frame">
            <div className="phone-top"/>
            <Logo/>
            <h3>{t("industrialSafety")}</h3>
            <div className="mini-progress"><i/></div>
            <div className="mini-grid">
              <div>🔥<b>{t("fireSafety")}</b></div>
              <div>☣️<b>{t("gasSafety")}</b></div>
              <div>⚙️<b>{t("machinery")}</b></div>
              <div>⚡<b>{t("electrical")}</b></div>
            </div>
            <div className="safe-message">
              <ShieldCheck/> {t("safetyReadiness")}: 82%
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div><strong>5</strong><span>{t("safetyDomains")}</span></div>
        <div><strong>3</strong><span>{t("languages")}</span></div>
        <div><strong>AR</strong><span>{t("cameraTraining")}</span></div>
        <div><strong>QR</strong><span>{t("verifiedCertificates")}</span></div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span>{t("trainingEcosystem")}</span>
          <h2>{t("platformJourney")}</h2>
          <p>{t("journeyDescription")}</p>
        </div>

        <div className="feature-grid">
          <Feature icon={<Camera/>} title={t("interactiveTraining")}
            text={t("interactiveTrainingDesc")}/>
          <Feature icon={<CloudOff/>} title={t("lowConnectivity")}
            text={t("lowConnectivityDesc")}/>
          <Feature icon={<Languages/>} title={t("regionalLanguages")}
            text={t("regionalLanguagesDesc")}/>
          <Feature icon={<QrCode/>} title={t("qrCertification")}
            text={t("qrCertificationDesc")}/>
          <Feature icon={<Users/>} title={t("adminCompliance")}
            text={t("adminComplianceDesc")}/>
          <Feature icon={<Smartphone/>} title={t("mobileFirst")}
            text={t("mobileFirstDesc")}/>
        </div>
      </section>

      <section className="modules-section">
        <div className="section-heading">
          <span>{t("modules")}</span>
          <h2>{t("practicalTraining")}</h2>
        </div>

        <div className="module-grid">
          {modules.map((m,i)=>
            <article className="module-card" key={m.id}
              style={{"--module":m.color}}>
              <div className="module-number">0{i+1}</div>
              <div className="module-icon">{m.icon}</div>
              <h3>{m.title[lang]}</h3>
              <ul>{m.topics.map(x=><li key={x.en}>{x[lang]||x.en}</li>)}</ul>
            </article>
          )}
        </div>
      </section>

      <section className="workflow section">
        <div className="section-heading">
          <span>{t("howItWorks")}</span>
          <h2>{t("verifiedJourney")}</h2>
        </div>

        <div className="steps">
          {[
            ["01",t("learn"),t("journeyLearn")],
            ["02",t("practise"),t("journeyPractise")],
            ["03",t("assess"),t("journeyAssess")],
            ["04",t("certify"),t("journeyCertify")]
          ].map(([n,a,b])=>
            <div className="step" key={n}>
              <b>{n}</b><h3>{a}</h3><p>{b}</p>
            </div>
          )}
        </div>
      </section>

      <section className="cta">
        <BadgeCheck size={45}/>
        <h2>{t("saferWorkforce")}</h2>
        <p>{t("connectedPlatform")}</p>
        <button className="light-button" onClick={()=>nav("/auth?mode=register")}>
          {t("accessSurakshaSetu")} <ArrowRight size={18}/>
        </button>
      </section>
    </main>

    <footer>
      <Logo/>
      <p>{t("industrialLearning")}</p>
      <span>{t("developedBy")} <b>Code Buddies+</b> • {t("problemStatement")}</span>
    </footer>
  </>;
}

function Feature({icon,title,text}){
  return <article className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3><p>{text}</p>
  </article>;
}