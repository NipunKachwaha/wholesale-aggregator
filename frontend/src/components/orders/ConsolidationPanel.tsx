import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import axios from "axios";

const ORDER_URL = "http://localhost:3003";
const TENANT_ID = "00000000-0000-0000-0000-000000000001";

interface Suggestion {
  groupId: string;
  orders: any[];
  merged: any[];
  total: number;
  saving: number;
}

export default function ConsolidationPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${ORDER_URL}/orders/consolidation/suggestions`,
        { params: { tenantId: TENANT_ID } },
      );
      setSuggestions(res.data.data?.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConsolidate = async (suggestion: Suggestion) => {
    setMerging(suggestion.groupId);
    try {
      const orderIds = suggestion.orders.map((o: any) => o.id);
      await axios.post(`${ORDER_URL}/orders/consolidate`, {
        orderIds,
        tenantId: TENANT_ID,
      });

      setSuccess(
        `✅ ${orderIds.length} orders merge ho gaye! ₹${suggestion.saving} bachaya`,
      );

      // Animation
      gsap.to(panelRef.current, {
        scale: 1.02,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });

      setTimeout(() => {
        setSuccess(null);
        fetchSuggestions();
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || "Consolidation fail ho gaya");
    } finally {
      setMerging(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-6 text-center">
        <p className="text-2xl animate-bounce">🔄</p>
        <p className="text-slate-500 text-sm mt-2">
          Suggestions load ho rahe hain...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          🔀 Order Consolidation
        </h3>
        <button
          onClick={fetchSuggestions}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">✨</p>
          <p className="text-slate-500 text-sm">
            Koi consolidation suggestions nahi hain
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Jab same SKUs ke multiple draft orders honge — yahan dikhenge
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.groupId}
              className="border border-slate-200 dark:border-slate-600 rounded-xl p-4"
            >
              {/* Saving Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {suggestion.orders.length} orders merge honge
                </span>
                {suggestion.saving > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    💰 ₹{suggestion.saving} bachega
                  </span>
                )}
              </div>

              {/* Merged Items Preview */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-3">
                <p className="text-xs text-slate-500 mb-2">Merged items:</p>
                {suggestion.merged.map((item: any) => (
                  <div
                    key={item.sku}
                    className="flex justify-between text-xs py-1"
                  >
                    <span className="font-mono text-blue-600">{item.sku}</span>
                    <span className="text-slate-600 dark:text-slate-300">
                      ×{item.quantity} = ₹{item.total?.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-200 dark:border-slate-600 mt-2 pt-2 flex justify-between text-xs font-semibold">
                  <span>Total:</span>
                  <span>₹{suggestion.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Consolidate Button */}
              <button
                onClick={() => handleConsolidate(suggestion)}
                disabled={merging === suggestion.groupId}
                className={`w-full py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  merging === suggestion.groupId
                    ? "bg-slate-400"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {merging === suggestion.groupId
                  ? "⏳ Merging..."
                  : `🔀 Consolidate ${suggestion.orders.length} Orders`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
