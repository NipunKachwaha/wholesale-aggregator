import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import ProductTable from "../components/products/ProductTable";
import { getProducts } from "../services/products.service";
import AdvancedSearch from '../components/products/AdvancedSearch'
import ExportButton from '../components/ExportButton'

const CATEGORIES = [
  "All",
  "Grains",
  "Oils",
  "Flour",
  "Sugar",
  "Spices",
  "Pulses",
  "Beverages",
];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    );
    fetchProducts();
  }, []);

  const fetchProducts = async (cat?: string, q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({
        category: cat && cat !== "All" ? cat : undefined,
        search: q || undefined,
      });
      setProducts(res.data?.products || []);
    } catch {
      setError("Products load nahi ho paye — Catalog service chal rahi hai?");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchProducts(category, e.target.value);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    fetchProducts(cat, search);
  };

  return (
    <div>
      {/* Header */}
      <div
        ref={headerRef}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Product Catalog
            </h2>
            <p className="text-slate-500 text-sm">
              {products.length} products available
            </p>
          </div>
          <button
            onClick={() => fetchProducts(category, search)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
          <ExportButton reportType="products" label="Export PDF" />
        </div>

        {/* Advanced ES Search */}
        <div className="mb-6">
          <AdvancedSearch />
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="SKU ya naam se search karo..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600 text-sm">❌ {error}</p>
          <p className="text-red-400 text-xs mt-1">
            Make sure catalog service chal rahi hai: http://localhost:3002
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <ProductTable products={products} loading={loading} />
      </div>
    </div>
  );
}
