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

export default function Verify(){
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
      <button
        className="back-link"
        onClick={()=>nav("/")}
      >
        <ArrowLeft/>
        Home
      </button>

      <Logo/>

      <div className="verify-card">
        <BadgeCheck size={47}/>

        <h1>
          Certificate Verification
        </h1>

        <p>
          Enter the unique SurakshaSetu
          Certificate ID.
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
              ?"Checking..."
              :"Verify"}
          </button>
        </div>

        {searched&&record&&!record.revoked&&(
          <div className="verified-card">
            <BadgeCheck/>

            <div>
              <b>
                Certificate Verified
              </b>

              <span>
                Authentic SurakshaSetu record
              </span>
            </div>

            <dl>
              <dt>Worker</dt>
              <dd>{record.worker_name}</dd>

              <dt>Worker ID</dt>
              <dd>
                {record.worker_public_id}
              </dd>

              <dt>Certificate</dt>
              <dd>
                {record.certificate_no}
              </dd>

              <dt>Module</dt>
              <dd>{record.module_id}</dd>

              <dt>Score</dt>
              <dd>
                {Math.round(record.score)}%
              </dd>

              <dt>Issued</dt>
              <dd>
                {new Date(
                  record.issued_at
                ).toLocaleDateString()}
              </dd>
            </dl>
          </div>
        )}

        {searched&&record?.revoked&&(
          <div className="invalid-card">
            <ShieldX/>
            This certificate has been revoked
            and is no longer valid.
          </div>
        )}

        {searched&&!record&&(
          <div className="invalid-card">
            <XCircle/>
            Certificate not found.
          </div>
        )}
      </div>
    </main>
  );
}