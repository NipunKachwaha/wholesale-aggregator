import { useRef } from "react";
import { gsap } from "gsap";

interface Vendor {
  id: string;
  name: string;
  feed_type: string;
  api_endpoint: string;
  reliability_score: number;
  is_active: boolean;
  last_synced_at: string;
}

interface Props {
  vendor: Vendor;
  onSync: (id: string) => void;
  syncing: boolean;
}

const FEED_ICONS: Record<string, string> = {
  csv: "📄",
  api: "🔌",
  excel: "📊",
  webhook: "🔗",
};

export default function VendorCard({ vendor, onSync, syncing }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      y: -4,
      scale: 1.01,
      duration: 0.2,
      ease: "power2.out",
    });
  };
  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleSync = () => {
    gsap.to(btnRef.current, {
      rotation: 360,
      duration: 0.5,
      ease: "power2.inOut",
    });
    onSync(vendor.id);
  };

  const reliabilityColor =
    vendor.reliability_score >= 0.8
      ? "text-green-600"
      : vendor.reliability_score >= 0.5
        ? "text-yellow-600"
        : "text-red-600";

  const lastSynced = vendor.last_synced_at
    ? new Date(vendor.last_synced_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never synced";

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {FEED_ICONS[vendor.feed_type] || "🏭"}
          </span>
          <div>
            <h3 className="font-semibold text-slate-800">{vendor.name}</h3>
            <span className="text-xs text-slate-500 capitalize">
              {vendor.feed_type} feed
            </span>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            vendor.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {vendor.is_active ? "● Active" : "● Inactive"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Reliability</p>
          <p className={`text-lg font-bold ${reliabilityColor}`}>
            {(vendor.reliability_score * 100).toFixed(0)}%
          </p>
          <div className="h-1.5 bg-slate-200 rounded-full mt-1">
            <div
              className={`h-full rounded-full ${
                vendor.reliability_score >= 0.8
                  ? "bg-green-500"
                  : vendor.reliability_score >= 0.5
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${vendor.reliability_score * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Last Synced</p>
          <p className="text-xs font-medium text-slate-700">{lastSynced}</p>
        </div>
      </div>

      {/* API Endpoint */}
      {vendor.api_endpoint && (
        <div className="bg-slate-50 rounded-lg p-2 mb-4">
          <p className="text-xs font-mono text-slate-500 truncate">
            {vendor.api_endpoint}
          </p>
        </div>
      )}

      {/* Sync Button */}
      <button
        ref={btnRef}
        onClick={handleSync}
        disabled={syncing}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          syncing
            ? "bg-slate-100 text-slate-400"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
      >
        {syncing ? "⏳ Syncing..." : "🔄 Sync Now"}
      </button>
    </div>
  );
}
