export default function AdminStatCard({
  icon,
  label,
  value,
  color="green"
}){
  return (
    <article className={`admin-stat ${color}`}>
      <div className="admin-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}