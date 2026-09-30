import {
  useEffect,
  useState
} from "react";

import {
  ArrowLeft,
  BadgeCheck,
  Search,
  ShieldX,
  XCircle
} from "lucide-react";

import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import Logo from "../components/Logo";
import {supabase} from "../lib/supabase";
import {useApp} from "../context/AppContext";
import {getModule} from "../data/modules";

export default function Verify(){
  const {lang,setLang,t,formatDate}=useApp();
  const [params]=useSearchParams();
  const nav=useNavigate();

  const [query,setQuery]=useState(
    params.get("id")||""
  );

  const [record,setRecord]=useState(null);
  const [searched,setSearched]=useState(false);
  const [busy,setBusy]=useState(false);

  async function verify(value=query){
    if(!value.trim()||!supabase)return;

    setBusy(true);

    const {data,error}=await supabase
      .rpc(
        "verify_certificate",
        {
          search_no:value.trim()
        }
      );

    setRecord(
      !error&&data?.length
        ?data[0]
        :null
    );

    setSearched(true);
    setBusy(false);
  }

  useEffect(()=>{
    const id=params.get("id");

    if(id){
      verify(id);
    }
  },[]);

  return (
    <main className="verify-page">
      <label className="auth-language">
        <span>{t("language")}</span>
        <select value={lang} onChange={e=>setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ</option>
        </select>
      </label>
      <button
        className="back-link"
        onClick={()=>nav("/")}
      >
        <ArrowLeft/>
        {t("home")}
      </button>

      <Logo/>

      <div className="verify-card">
        <BadgeCheck size={47}/>

        <h1>
          {t("certificateVerification")}
        </h1>

        <p>
          {t("enterCertificateId")}
        </p>

        <div className="verify-search">
          <input
            value={query}
            onChange={e=>
              setQuery(e.target.value)
            }
            placeholder="SS-2026-XXXXXXXX"
            onKeyDown={e=>
              e.key==="Enter"&&verify()
            }
          />

          <button
            className="primary"
            disabled={busy}
            onClick={()=>verify()}
          >
            <Search/>
            {busy
              ?t("checking")
              :t("verifyAction")}
          </button>
        </div>

        {searched&&record&&!record.revoked&&(
          <div className="verified-card">
            <BadgeCheck/>

            <div>
              <b>
                {t("certificateVerified")}
              </b>

              <span>
                {t("authenticRecord")}
              </span>
            </div>

            <dl>
              <dt>{t("worker")}</dt>
              <dd>{record.worker_name}</dd>

              <dt>{t("workerId")}</dt>
              <dd>
                {record.worker_public_id}
              </dd>

              <dt>{t("certificate")}</dt>
              <dd>
                {record.certificate_no}
              </dd>

              <dt>{t("module")}</dt>
              <dd>{getModule(record.module_id)?.title?.[lang]||getModule(record.module_id)?.title?.en||record.module_id}</dd>

              <dt>{t("score")}</dt>
              <dd>
                {Math.round(record.score)}%
              </dd>

              <dt>{t("issued")}</dt>
              <dd>
                {formatDate(record.issued_at)}
              </dd>
            </dl>
          </div>
        )}

        {searched&&record?.revoked&&(
          <div className="invalid-card">
            <ShieldX/>
            {t("certificateRevoked")}
          </div>
        )}

        {searched&&!record&&(
          <div className="invalid-card">
            <XCircle/>
            {t("certificateNotFound")}
          </div>
        )}
      </div>
    </main>
  );
}