import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { createVendor } from "../../services/vendors.service";

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddVendorModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [feedType, setFeedType] = useState("csv");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Modal open animation
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.2 },
    );
    gsap.fromTo(
      modalRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.4)" },
    );
  }, []);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      y: 30,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      onComplete: onClose,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vendor name required hai");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createVendor({ name, feedType, apiEndpoint });
      onAdded();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Vendor add nahi ho paya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            🏭 Add New Vendor
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vendor Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ABC Suppliers"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Feed Type *
            </label>
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="csv">📄 CSV Upload</option>
              <option value="api">🔌 REST API</option>
              <option value="excel">📊 Excel</option>
              <option value="webhook">🔗 Webhook</option>
            </select>
          </div>

          {feedType === "api" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                API Endpoint
              </label>
              <input
                type="url"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.vendor.com/products"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 text-white rounded-lg text-sm font-medium ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "⏳ Adding..." : "+ Add Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
