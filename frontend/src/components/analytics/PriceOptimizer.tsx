import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { optimizePrice } from "../../services/ai.service";

const SAMPLE_SKUS = [
  {
    sku: "RICE-001",
    name: "Basmati Rice",
    price: 120.5,
    category: "Grains",
    stock: 500,
  },
  {
    sku: "OIL-001",
    name: "Sunflower Oil",
    price: 180.0,
    category: "Oils",
    stock: 200,
  },
  {
    sku: "DAL-001",
    name: "Yellow Moong Dal",
    price: 110.0,
    category: "Pulses",
    stock: 400,
  },
  {
    sku: "TEA-001",
    name: "Assam CTC Tea",
    price: 350.0,
    category: "Beverages",
    stock: 150,
  },
];

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export default function PriceOptimizer() {
  const [selected, setSelected] = useState(SAMPLE_SKUS[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOptimize = async () => {
    setLoading(true);
    setError(null);

    // Button animation
    gsap.to(btnRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    try {
      const data = await optimizePrice({
        sku: selected.sku,
        tenant_id: TENANT_ID,
        current_price: selected.price,
        category: selected.category,
        stock_qty: selected.stock,
      });
      setResult(data);

      // Result animation
      setTimeout(() => {
        gsap.fromTo(
          resultRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        );
      }, 50);
    } catch (err: any) {
      setError("AI Service se connect nahi ho pa raha");
    } finally {
      setLoading(false);
    }
  };

  const diffPercent = result
    ? (
        ((result.suggested_price - result.current_price) /
          result.current_price) *
        100
      ).toFixed(1)
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        🤖 AI Price Optimizer
      </h3>

      {/* Product Select */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {SAMPLE_SKUS.map((item) => (
          <button
            key={item.sku}
            onClick={() => {
              setSelected(item);
              setResult(null);
            }}
            className={`p-3 rounded-lg border text-left transition-all ${
              selected.sku === item.sku
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <p className="font-medium text-sm text-slate-800">{item.name}</p>
            <p className="text-xs text-slate-500">
              ₹{item.price} • {item.category}
            </p>
          </button>
        ))}
      </div>

      {/* Optimize Button */}
      <button
        ref={btnRef}
        onClick={handleOptimize}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium text-white mb-4 transition-colors ${
          loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "⏳ Analyzing..." : "🚀 Optimize Price"}
      </button>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div ref={resultRef} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-500">Current</p>
              <p className="text-lg font-bold text-slate-800">
                ₹{result.current_price}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600">Suggested</p>
              <p className="text-lg font-bold text-blue-700">
                ₹{result.suggested_price}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 text-center ${
                Number(diffPercent) >= 0 ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="text-xs text-slate-500">Change</p>
              <p
                className={`text-lg font-bold ${
                  Number(diffPercent) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Number(diffPercent) >= 0 ? "+" : ""}
                {diffPercent}%
              </p>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Confidence</span>
              <span className="font-medium">
                {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-700">💡 {result.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
