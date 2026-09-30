import {useState} from "react";
import {Globe2, Settings, UserRound, Moon, Sun, LogOut} from "lucide-react";
import {useNavigate} from "react-router-dom";
import Logo from "./Logo";
import {useApp} from "../context/AppContext";
import {supabase} from "../lib/supabase";

export default function Navbar() {
  const {lang,setLang,theme,setTheme,session,profile,t} = useApp();
  const [menu,setMenu] = useState("");
  const nav = useNavigate();

  async function logout(){
    if(supabase) await supabase.auth.signOut();
    nav("/");
    setMenu("");
  }

  return (
    <header className="navbar">
      <div onClick={()=>nav("/")} className="pointer"><Logo/></div>

      <div className="nav-actions">
        <div className="relative">
          <button className="icon-btn" onClick={()=>setMenu(menu==="profile"?"":"profile")}>
            <UserRound size={19}/><span>{t("profile")}</span>
          </button>

          {menu==="profile" && (
            <div className="popover">
              {session ? <>
                <strong>{profile?.name || t("user")}</strong>
                <small>{profile?.public_id}</small>
                <small className="role">{profile?.role==="admin"?t("administrator"):t("worker")}</small>
              </> : <>
                <button onClick={()=>nav("/auth?mode=login")}>{t("login")}</button>
                <button onClick={()=>nav("/auth?mode=register")}>{t("register")}</button>
              </>}
            </div>
          )}
        </div>

        <div className="relative">
          <button className="icon-btn" onClick={()=>setMenu(menu==="lang"?"":"lang")}>
            <Globe2 size={19}/><span>{t("language")}</span>
          </button>
          {menu==="lang" && (
            <div className="popover">
              <button onClick={()=>setLang("en")}>English</button>
              <button onClick={()=>setLang("hi")}>हिन्दी</button>
              <button onClick={()=>setLang("sat")}>ᱥᱟᱱᱛᱟᱲᱤ</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button className="icon-btn" onClick={()=>setMenu(menu==="settings"?"":"settings")}>
            <Settings size={19}/><span>{t("settings")}</span>
          </button>
          {menu==="settings" && (
            <div className="popover">
              <button onClick={()=>setTheme(theme==="light"?"dark":"light")}>
                {theme==="light"?<Moon size={17}/>:<Sun size={17}/>}
                {theme==="light"?t("dark"):t("light")}
              </button>
              {session &&
                <button className="danger-text" onClick={logout}>
                  <LogOut size={17}/>{t("logout")}
                </button>}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}