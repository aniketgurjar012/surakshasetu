import {useEffect,useState} from "react";
import {useNavigate,useSearchParams} from "react-router-dom";
import {ArrowLeft,LockKeyhole,ShieldCheck} from "lucide-react";
import Logo from "../components/Logo";
import {supabase,configured} from "../lib/supabase";
import {useApp} from "../context/AppContext";

export default function Auth(){
  const [params]=useSearchParams();
  const [mode,setMode]=useState(params.get("mode")||"login");
  const [role,setRole]=useState("worker");
  const [form,setForm]=useState({
    name:"",publicId:"",sector:"Mining",email:"",password:""
  });
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const nav=useNavigate();
  const {session,profile}=useApp();

  useEffect(()=>{
    if(session&&profile) nav(profile.role==="admin"?"/admin":"/worker");
  },[session,profile]);

  const change=e=>setForm({...form,[e.target.name]:e.target.value});

  async function submit(e){
    e.preventDefault();
    setError("");

    if(!configured){
      setError("Backend is not configured. Add Supabase values to .env first.");
      return;
    }

    setBusy(true);

    try{
      if(mode==="register"){
        const {data,error:authError}=await supabase.auth.signUp({
          email:form.email,
          password:form.password
        });
        if(authError) throw authError;

        if(!data.user) throw new Error("Could not create account.");

        const {error:pError}=await supabase.from("profiles").insert({
          id:data.user.id,
          name:form.name.trim(),
          public_id:form.publicId.trim(),
          role,
          sector:role==="worker"?form.sector:null
        });
        if(pError) throw pError;

        if(!data.session){
          setError("Account created. Confirm your email, then login.");
          setMode("login");
        }
      }else{
        const {error}=await supabase.auth.signInWithPassword({
          email:form.email,password:form.password
        });
        if(error) throw error;
      }
    }catch(err){
      setError(err.message);
    }finally{
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-art">
      <Logo/>
      <div>
        <div className="eyebrow"><ShieldCheck size={17}/> SurakshaSetu</div>
        <h1>Industrial safety starts with preparation.</h1>
        <p>Access training, practical simulations, assessments and verifiable safety credentials.</p>
      </div>
      <small>Code Buddies+ • SIH 26041</small>
    </section>

    <section className="auth-form-wrap">
      <button className="back-link" onClick={()=>nav("/")}>
        <ArrowLeft/> Back to home
      </button>

      <div className="auth-card">
        <LockKeyhole className="auth-symbol"/>
        <h2>{mode==="login"?"Welcome back":"Create your account"}</h2>
        <p>{mode==="login"?"Sign in securely to continue.":"Choose your role and enter your identity details."}</p>

        <div className="role-switch">
          <button className={role==="worker"?"active":""} onClick={()=>setRole("worker")}>Worker</button>
          <button className={role==="admin"?"active":""} onClick={()=>setRole("admin")}>Administrator</button>
        </div>

        <form onSubmit={submit}>
          {mode==="register" && <>
            <label>Full name<input required name="name" value={form.name} onChange={change}/></label>
            <label>{role==="worker"?"Worker ID":"Admin ID"}
              <input required name="publicId" value={form.publicId} onChange={change}/>
            </label>
            {role==="worker" &&
              <label>Sector<select name="sector" value={form.sector} onChange={change}>
                <option>Mining</option><option>Steel</option>
                <option>Manufacturing</option><option>Mica Processing</option>
                <option>Contract Work</option><option>Other</option>
              </select></label>}
          </>}

          <label>Email<input type="email" required name="email" value={form.email} onChange={change}/></label>
          <label>Password<input type="password" minLength="6" required name="password" value={form.password} onChange={change}/></label>

          {error&&<div className="form-error">{error}</div>}

          <button className="primary full" disabled={busy}>
            {busy?"Please wait...":mode==="login"?"Login":"Register"}
          </button>
        </form>

        <div className="switch-mode">
          {mode==="login"?"New to SurakshaSetu? ":"Already registered? "}
          <button onClick={()=>setMode(mode==="login"?"register":"login")}>
            {mode==="login"?"Register":"Login"}
          </button>
        </div>
      </div>
    </section>
  </main>;
}