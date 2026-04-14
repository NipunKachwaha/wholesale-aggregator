import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import axios from "axios";

const AI_URL = "http://localhost:8000";
const TENANT_ID = "00000000-0000-0000-0000-000000000001";

const EXAMPLE_QUERIES = [
  "show me all draft orders",
  "RICE-001 ka stock kitna hai",
  "show all products",
  "total revenue this month",
  "pending orders dikhao",
  "active vendors list",
];

interface Result {
  intent: string;
  explanation: string;
  results: any[];
  total: number;
  parameters: any;
}

export default function NLQueryBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    gsap.fromTo(
      barRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
    );
  }, []);

  const handleQuery = async (q?: string) => {
    const queryText = q || query;
    if (!queryText.trim()) return;

    setQuery(queryText);
    setLoading(true);
    setError(null);
    setResult(null);
    setExpanded(true);

    try {
      const response = await axios.post(`${AI_URL}/ai/query`, {
        query: queryText,
        tenant_id: TENANT_ID,
        execute: true,
      });

      setResult(response.data);

      setTimeout(() => {
        gsap.fromTo(
          resultRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        );
      }, 50);
    } catch {
      setError("AI Service se connect nahi ho pa raha");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleQuery();
    if (e.key === "Escape") {
      setExpanded(false);
      setResult(null);
    }
  };

  const intentIcon: Record<string, string> = {
    get_orders: "🛒",
    get_products: "📦",
    get_vendors: "🏭",
    get_analytics: "📊",
    price_check: "💰",
    unknown: "❓",
  };

  return (
    <div ref={barRef} className="mb-6">
      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Kuch bhi poochho... 'show draft orders' ya 'RICE-001 ka stock'"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={() => handleQuery()}
            disabled={loading || !query.trim()}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors ${
              loading || !query.trim()
                ? "bg-slate-300"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Ask AI
          </button>
        </div>

        {/* Example Queries */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {EXAMPLE_QUERIES.map((ex) => (
            <button
              key={ex}
              onClick={() => handleQuery(ex)}
              className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          ref={resultRef}
          className="mt-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Result Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {intentIcon[result.intent] || "🤖"}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {result.explanation}
                </p>
                <p className="text-xs text-slate-500">
                  {result.total} results mile
                </p>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-slate-400 hover:text-slate-600 text-lg"
            >
              ✕
            </button>
          </div>

          {/* Results Table */}
          {result.results && result.results.length > 0 ? (
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    {Object.keys(result.results[0]).map((col) => (
                      <th
                        key={col}
                        className="text-left py-2 px-3 text-slate-500 font-medium capitalize border-b border-slate-100"
                      >
                        {col.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="py-2 px-3 text-slate-700">
                          {typeof val === "number"
                            ? val.toFixed(2)
                            : typeof val === "string" && val.includes("T")
                              ? new Date(val).toLocaleDateString("en-IN")
                              : String(val ?? "-").slice(0, 50)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">Koi results nahi mile</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
