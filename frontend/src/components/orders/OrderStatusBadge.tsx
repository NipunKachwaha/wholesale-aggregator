type Status = "draft" | "confirmed" | "processing" | "fulfilled" | "cancelled";

const STATUS_CONFIG: Record<Status, { color: string; icon: string }> = {
  draft: { color: "bg-slate-100 text-slate-600", icon: "📝" },
  confirmed: { color: "bg-blue-100 text-blue-700", icon: "✅" },
  processing: { color: "bg-yellow-100 text-yellow-700", icon: "⚙️" },
  fulfilled: { color: "bg-green-100 text-green-700", icon: "📦" },
  cancelled: { color: "bg-red-100 text-red-600", icon: "❌" },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as Status] || STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon} {status}
    </span>
  );
}
