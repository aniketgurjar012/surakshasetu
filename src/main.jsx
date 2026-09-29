import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {AppProvider} from "./context/AppContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider><App/></AppProvider>
  </React.StrictMode>
);

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}