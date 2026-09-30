import {useNavigate} from "react-router-dom";
import {BookOpen,HelpCircle} from "lucide-react";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import {modules} from "../../data/modules";
import {useApp} from "../../context/AppContext";

export default function Modules(){
  const {lang,t}=useApp();
  const nav=useNavigate();

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow={t("trainingContent").toUpperCase()}
          title={t("modules")}
          description={t("manageModuleDescription")}
        />

        <section className="admin-module-grid">
          {modules.map((module,index)=>(
            <article
              key={module.id}
              className="admin-module-card"
              style={{"--module":module.color}}
            >
              <div className="admin-module-top">
                <span>{module.icon}</span>
                <b>0{index+1}</b>
              </div>

              <h2>
                {module.title[lang]||
                 module.title.en}
              </h2>

              <p>
                {module.description[lang]||
                 module.description.en}
              </p>

              <div className="admin-module-topics">
                {module.topics.map(x=>(
                  <span key={x.en}>{x[lang]||x.en}</span>
                ))}
              </div>

              <button
                className="admin-primary"
                onClick={()=>
                  nav(
                    `/admin/questions?module=${module.id}`
                  )
                }
              >
                <HelpCircle/>
                {t("manageQuestions")}
              </button>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}