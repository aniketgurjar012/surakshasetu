export default function Logo({compact=false}) {
  return (
    <div className="brand">
      <img src="/logo.svg" alt="SurakshaSetu logo"/>
      {!compact && (
        <div>
          <strong>SurakshaSetu</strong>
          <small>Safety • Skills • Confidence</small>
        </div>
      )}
    </div>
  );
}