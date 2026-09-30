import {
  useEffect,
  useRef,
  useState
} from "react";
import {
  ArrowLeft,
  Download,
  ShieldCheck
} from "lucide-react";
import {
  useNavigate,
  useParams
} from "react-router-dom";
import QRCode from "qrcode";
import {jsPDF} from "jspdf";
import Navbar from "../../components/Navbar";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";
import {getModule} from "../../data/modules";

export default function Certificate(){
  const {
    submissionId,
    certificateId
  }=useParams();

  const nav=useNavigate();
  const {profile,lang,t,formatDate}=useApp();

  const [cert,setCert]=useState(null);
  const [submission,setSubmission]=useState(null);
  const [qr,setQr]=useState("");
  const [busy,setBusy]=useState(false);

  const cardRef=useRef(null);

  useEffect(()=>{
    load();
  },[
    submissionId,
    certificateId,
    profile
  ]);

  async function load(){
    if(!profile) return;

    if(certificateId){
      const {data}=
        await supabase
          .from("certificates")
          .select("*")
          .eq("id",certificateId)
          .single();

      if(data){
        setCert(data);

        const {data:sub}=
          await supabase
            .from("submissions")
            .select("*")
            .eq("id",data.submission_id)
            .single();

        setSubmission(sub);
        makeQR(data.certificate_no);
      }

      return;
    }

    if(submissionId){
      const {data:sub}=
        await supabase
          .from("submissions")
          .select("*")
          .eq("id",submissionId)
          .single();

      setSubmission(sub);

      const {data:existing}=
        await supabase
          .from("certificates")
          .select("*")
          .eq(
            "submission_id",
            submissionId
          )
          .maybeSingle();

      if(existing){
        setCert(existing);
        makeQR(existing.certificate_no);
      }
    }
  }

  async function makeQR(no){
    const base=
      import.meta.env.VITE_PUBLIC_URL||
      window.location.origin;

    const url=
      `${base}/verify?id=${encodeURIComponent(no)}`;

    setQr(
      await QRCode.toDataURL(
        url,
        {
          width:220,
          margin:1
        }
      )
    );
  }

  async function generate(){
    if(
      !submission||
      Number(submission.percentage)<60
    ) return;

    setBusy(true);

    const existing=
      await supabase
        .from("certificates")
        .select("*")
        .eq(
          "submission_id",
          submission.id
        )
        .maybeSingle();

    if(existing.data){
      setCert(existing.data);
      makeQR(
        existing.data.certificate_no
      );
      setBusy(false);
      return;
    }

    const no=
      `SS-${new Date()
        .getFullYear()}-${crypto
        .randomUUID()
        .slice(0,8)
        .toUpperCase()}`;

    const {data,error}=
      await supabase
        .from("certificates")
        .insert({
          certificate_no:no,
          worker_id:profile.id,
          submission_id:submission.id,
          module_id:
            submission.module_id,
          score:
            submission.percentage,
          language:lang
        })
        .select()
        .single();

    if(error){
      alert(error.message);
      setBusy(false);
      return;
    }

    setCert(data);
    await makeQR(no);
    setBusy(false);
  }

  function pdf(){
    if(!cert) return;

    const module=
      getModule(cert.module_id);

    const doc=
      new jsPDF({
        orientation:"landscape",
        unit:"mm",
        format:"a4"
      });

    doc.setDrawColor(8,127,91);
    doc.setLineWidth(2);
    doc.rect(12,12,273,186);

    doc.setTextColor(8,127,91);
    doc.setFontSize(28);
    doc.text(
      "SurakshaSetu",
      148.5,
      35,
      {align:"center"}
    );

    doc.setTextColor(20,35,30);
    doc.setFontSize(24);
    doc.text(
      t("certificateOfCompletion"),
      148.5,
      57,
      {align:"center"}
    );

    doc.setFontSize(13);
    doc.text(
      t("awardedTo"),
      148.5,
      75,
      {align:"center"}
    );

    doc.setFontSize(25);
    doc.text(
      profile.name,
      148.5,
      92,
      {align:"center"}
    );

    doc.setFontSize(12);
    doc.text(
      `${t("workerId")}: ${profile.public_id}`,
      148.5,
      106,
      {align:"center"}
    );

    doc.text(
      `${t("module")}: ${
        module?.title?.[lang]||
        cert.module_id
      }`,
      148.5,
      120,
      {align:"center"}
    );

    doc.text(
      `${t("score")}: ${Math.round(cert.score)}%`,
      148.5,
      132,
      {align:"center"}
    );

    doc.text(
      `${t("certificateId")}: ${
        cert.certificate_no
      }`,
      148.5,
      144,
      {align:"center"}
    );

    if(qr){
      doc.addImage(
        qr,
        "PNG",
        130,
        151,
        37,
        37
      );
    }

    doc.save(
      `${cert.certificate_no}.pdf`
    );
  }

  const module=
    cert
      ?getModule(cert.module_id)
      :submission
        ?getModule(submission.module_id)
        :null;

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

        {!cert?(
          <section className="certificate-ready panel">
            <ShieldCheck size={52}/>

            <h1>
              {t("certificateReady")}
            </h1>

            <p>
              {module?.title?.[lang]||
               module?.title?.en}
            </p>

            <button
              className="primary"
              disabled={busy}
              onClick={generate}
            >
              {busy
                ?t("generating")
                :t("generateCertificate")}
            </button>
          </section>
        ):(
          <>
            <section
              className="certificate"
              ref={cardRef}
            >
              <div className="certificate-border">
                <div className="certificate-brand">
                  <img
                    src="/logo.svg"
                    alt=""
                  />
                  <strong>
                    SurakshaSetu
                  </strong>
                </div>

                <span>
                  {t("certificateOfCompletion").toUpperCase()}
                </span>

                <h1>
                  {t("congratulations")}
                </h1>

                <p>
                  {t("awardedTo")}
                </p>

                <h2>
                  {profile?.name}
                </h2>

                <p>
                  {t("workerId")}:
                  {" "}
                  {profile?.public_id}
                </p>

                <h3>
                  {
                    module?.title?.[lang]||
                    module?.title?.en
                  }
                </h3>

                <div className="certificate-data">
                  <div>
                    <span>{t("score")}</span>
                    <b>
                      {Math.round(
                        cert.score
                      )}%
                    </b>
                  </div>

                  <div>
                    <span>
                      {t("certificateId")}
                    </span>
                    <b>
                      {
                        cert.certificate_no
                      }
                    </b>
                  </div>

                  <div>
                    <span>{t("issued")}</span>
                    <b>{formatDate(cert.issued_at)}</b>
                  </div>
                </div>

                {qr&&(
                  <img
                    src={qr}
                    className="certificate-qr"
                    alt={t("verificationQr")}
                  />
                )}

                <small>
                  {t("scanToVerify")}
                </small>
              </div>
            </section>

            <button
              className="primary download-cert"
              onClick={pdf}
            >
              <Download/>
              {t("downloadPdf")}
            </button>
          </>
        )}
      </main>
    </>
  );
}