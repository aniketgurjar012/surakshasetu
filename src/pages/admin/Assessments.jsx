import {useEffect,useMemo,useState} from "react";
import {
  Eye,
  Search,
  Trash2
} from "lucide-react";
import {useNavigate} from "react-router-dom";

import Navbar from "../../components/Navbar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminEmptyState from "../../components/admin/AdminEmptyState";
import {supabase} from "../../lib/supabase";

export default function Assessments(){
  const nav=useNavigate();

  const [rows,setRows]=useState([]);
  const [workers,setWorkers]=useState({});
  const [search,setSearch]=useState("");

  async function load(){
    const [s,p]=await Promise.all([
      supabase
        .from("submissions")
        .select("*")
        .eq("admin_hidden",false)
        .order("created_at",{ascending:false}),

      supabase
        .from("profiles")
        .select("id,name,public_id")
        .eq("role","worker")
    ]);

    setRows(s.data||[]);

    setWorkers(
      Object.fromEntries(
        (p.data||[]).map(x=>[
          x.id,
          x
        ])
      )
    );
  }

  useEffect(()=>{
    load();
  },[]);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase().trim();

    if(!q)return rows;

    return rows.filter(row=>{
      const worker=workers[row.worker_id];

      return (
        worker?.name
          ?.toLowerCase()
          .includes(q)||
        worker?.public_id
          ?.toLowerCase()
          .includes(q)||
        row.module_id
          ?.toLowerCase()
          .includes(q)
      );
    });
  },[rows,workers,search]);

  async function remove(id){
    if(!confirm(
      "Remove this assessment from Admin records?"
    ))return;

    const {error}=await supabase
      .from("submissions")
      .update({admin_hidden:true})
      .eq("id",id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  return (
    <>
      <Navbar/>

      <main className="admin-shell">
        <AdminHeader
          eyebrow="ASSESSMENT RECORDS"
          title="Assessment History"
          description="Worker-side history removal does not remove these compliance records."
        />

        <div className="admin-search">
          <Search/>

          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search worker name, ID or module..."
          />
        </div>

        <section className="admin-panel">
          {!filtered.length?(
            <AdminEmptyState
              text="No assessment records."
            />
          ):(
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Worker ID</th>
                    <th>Module</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(row=>{
                    const worker=
                      workers[row.worker_id];

                    return (
                      <tr key={row.id}>
                        <td>
                          {worker?.name||"Unknown"}
                        </td>

                        <td>
                          {worker?.public_id||"—"}
                        </td>

                        <td>
                          {row.module_id}
                        </td>

                        <td>
                          <span
                            className={
                              Number(row.percentage)>=60
                                ?"admin-badge success"
                                :"admin-badge danger"
                            }
                          >
                            {Math.round(
                              row.percentage
                            )}%
                          </span>
                        </td>

                        <td>
                          {new Date(
                            row.created_at
                          ).toLocaleString()}
                        </td>

                        <td>
                          <div className="admin-row-actions">
                            <button
                              className="admin-icon"
                              onClick={()=>
                                nav(
                                  `/admin/assessments/${row.id}`
                                )
                              }
                            >
                              <Eye/>
                            </button>

                            <button
                              className="admin-icon danger"
                              onClick={()=>remove(row.id)}
                            >
                              <Trash2/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}