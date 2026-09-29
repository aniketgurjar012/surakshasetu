import {useEffect,useMemo,useState} from "react";
import {
  Search,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import {supabase} from "../../lib/supabase";
import {useApp} from "../../context/AppContext";

export default function Workers(){
  const {lang}=useApp();

  const [workers,setWorkers]=useState([]);
  const [search,setSearch]=useState("");

  async function load(){
    const {data,error}=await supabase
      .from("profiles")
      .select("*")
      .eq("role","worker")
      .eq("admin_hidden",false)
      .order("created_at",{ascending:false});

    if(error){
      alert(error.message);
      return;
    }

    setWorkers(data||[]);
  }

  useEffect(()=>{
    load();
  },[]);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase().trim();

    if(!q)return workers;

    return workers.filter(x=>
      x.name?.toLowerCase().includes(q)||
      x.public_id?.toLowerCase().includes(q)||
      x.sector?.toLowerCase().includes(q)
    );
  },[workers,search]);

  async function toggle(worker){
    const {error}=await supabase
      .from("profiles")
      .update({active:!worker.active})
      .eq("id",worker.id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  async function remove(worker){
    if(!confirm(
      `Remove ${worker.name} from Admin worker list?\n\nAssessment and certificate records will remain available.`
    ))return;

    const {error}=await supabase
      .from("profiles")
      .update({
        admin_hidden:true,
        active:false
      })
      .eq("id",worker.id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  const title=
    lang==="hi"
      ?"कर्मचारी प्रबंधन"
      :lang==="sat"
        ?"ᱠᱟᱹᱢᱤᱭᱟᱹ ᱢᱮᱱᱮᱡᱽ"
        :"Worker Management";

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow="WORKFORCE"
          title={title}
          description={
            lang==="hi"
              ?"पंजीकृत कर्मचारियों और उनकी खाता स्थिति का प्रबंधन करें।"
              :"View registered workers and manage account status."
          }
        />

        <div className="admin-search">
          <Search/>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder={
              lang==="hi"
                ?"नाम, वर्कर आईडी या सेक्टर खोजें..."
                :"Search name, Worker ID or sector..."
            }
          />
        </div>

        <section className="admin-panel">
          {!filtered.length?(
            <AdminEmptyState text="No workers found."/>
          ):(
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Worker ID</th>
                    <th>Sector</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(worker=>(
                    <tr key={worker.id}>
                      <td>
                        <strong>{worker.name}</strong>
                      </td>

                      <td>{worker.public_id}</td>

                      <td>{worker.sector||"—"}</td>

                      <td>
                        <span
                          className={
                            worker.active
                              ?"admin-badge success"
                              :"admin-badge danger"
                          }
                        >
                          {worker.active
                            ?"Active"
                            :"Inactive"}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          worker.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <button
                            className={
                              worker.active
                                ?"admin-icon warning"
                                :"admin-icon success"
                            }
                            title={
                              worker.active
                                ?"Deactivate"
                                :"Activate"
                            }
                            onClick={()=>toggle(worker)}
                          >
                            {worker.active
                              ?<UserX/>
                              :<UserCheck/>}
                          </button>

                          <button
                            className="admin-icon danger"
                            title="Remove"
                            onClick={()=>remove(worker)}
                          >
                            <Trash2/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}