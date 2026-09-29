import {
  createContext, useContext, useEffect, useMemo, useState
} from "react";
import { supabase } from "../lib/supabase";

const AppContext = createContext();

const text = {
  en: {
    home:"Home", profile:"Profile", language:"Language",
    settings:"Settings", logout:"Logout", login:"Login",
    register:"Register", welcome:"Welcome", dashboard:"Dashboard",
    training:"Training", assessment:"Assessment",
    certificates:"Certificates", history:"History",
    start:"Start Training", verify:"Verify Certificate",
    offline:"Offline Ready", light:"Light", dark:"Dark",
    workers:"Workers", questions:"Questions",
    compliance:"Compliance", modules:"Training Modules"
  },
  hi: {
    home:"होम", profile:"प्रोफ़ाइल", language:"भाषा",
    settings:"सेटिंग्स", logout:"लॉगआउट", login:"लॉगिन",
    register:"पंजीकरण", welcome:"स्वागत है", dashboard:"डैशबोर्ड",
    training:"प्रशिक्षण", assessment:"मूल्यांकन",
    certificates:"प्रमाणपत्र", history:"इतिहास",
    start:"प्रशिक्षण शुरू करें", verify:"प्रमाणपत्र सत्यापित करें",
    offline:"ऑफलाइन उपलब्ध", light:"लाइट", dark:"डार्क",
    workers:"कर्मचारी", questions:"प्रश्न",
    compliance:"अनुपालन", modules:"प्रशिक्षण मॉड्यूल"
  },
  sat: {
    home:"ᱚᱲᱟᱜ", profile:"ᱯᱨᱚᱯᱷᱟᱭᱤᱞ", language:"ᱯᱟᱹᱨᱥᱤ",
    settings:"ᱥᱮᱴᱤᱝ", logout:"ᱞᱚᱜ ᱟᱣᱩᱴ", login:"ᱞᱚᱜᱤᱱ",
    register:"ᱨᱮᱡᱤᱥᱴᱟᱨ", welcome:"ᱡᱚᱦᱟᱨ", dashboard:"ᱰᱮᱥᱵᱳᱨᱰ",
    training:"ᱯᱨᱚᱥᱤᱠᱠᱷᱚᱱ", assessment:"ᱢᱩᱞᱭᱟᱝᱠᱚᱱ",
    certificates:"ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ", history:"ᱦᱤᱥᱴᱨᱤ",
    start:"ᱯᱨᱚᱥᱤᱠᱠᱷᱚᱱ ᱮᱦᱚᱵ",
    verify:"ᱥᱟᱨᱴᱤᱯᱷᱤᱠᱮᱴ ᱧᱮᱞ",
    offline:"ᱚᱯᱷᱞᱟᱭᱤᱱ", light:"ᱞᱟᱭᱤᱴ", dark:"ᱰᱟᱨᱠ",
    workers:"ᱠᱟᱹᱢᱤᱭᱟᱹ", questions:"ᱠᱩᱠᱞᱤ",
    compliance:"ᱠᱚᱢᱯᱞᱟᱭᱮᱱᱥ", modules:"ᱯᱨᱚᱥᱤᱠᱠᱷᱚᱱ ᱢᱚᱰᱭᱩᱞ"
  }
};

export function AppProvider({children}) {
  const [lang,setLang] = useState(localStorage.getItem("ss-lang") || "en");
  const [theme,setTheme] = useState(localStorage.getItem("ss-theme") || "light");
  const [session,setSession] = useState(null);
  const [profile,setProfile] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("ss-theme",theme);
  },[theme]);

  useEffect(() => localStorage.setItem("ss-lang",lang),[lang]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({data}) => setSession(data.session));

    const {data:{subscription}} =
      supabase.auth.onAuthStateChange((_e,s) => setSession(s));

    return () => subscription.unsubscribe();
  },[]);

  useEffect(() => {
    if (!session || !supabase) {
      setProfile(null);
      return;
    }

    supabase.from("profiles")
      .select("*")
      .eq("id",session.user.id)
      .single()
      .then(({data}) => setProfile(data));
  },[session]);

  const t = key => text[lang]?.[key] || text.en[key] || key;

  const value = useMemo(() => ({
    lang,setLang,theme,setTheme,session,profile,setProfile,t
  }),[lang,theme,session,profile]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);