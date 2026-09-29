import {Inbox} from "lucide-react";

export default function AdminEmptyState({text}){
  return (
    <div className="admin-empty">
      <Inbox/>
      <p>{text}</p>
    </div>
  );
}