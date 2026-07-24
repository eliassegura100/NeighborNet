const STATUS_LABEL = {
  open: "Open",
  claimed: "On the way",
  completed: "Completed",
};

export function StatusBadge({ status }) {
  const cls = `badge badge-${status || "open"}`;
  return (
    <span className={cls}>
      <span className="badge-dot" />
      {STATUS_LABEL[status] || status || "Open"}
    </span>
  );
}

export function UrgencyBadge({ urgency = "normal" }) {
  return <span className={`badge badge-urgency-${urgency}`}>{urgency}</span>;
}
