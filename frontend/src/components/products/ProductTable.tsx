import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  base_price: number;
  unit: string;
  stock_qty: number;
  vendor_name: string;
  is_active: boolean;
}

interface Props {
  products: Product[];
  loading: boolean;
}

export default function ProductTable({ products, loading }: Props) {
  const tableRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      gsap.fromTo(
        rowRefs.current.filter(Boolean),
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out",
        },
      );
    }
  }, [products, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-4xl mb-3 animate-bounce">📦</p>
          <p className="text-slate-500">Products load ho rahe hain...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🗃️</p>
        <p className="text-slate-500">Koi products nahi mile</p>
        <p className="text-slate-400 text-sm mt-1">
          CSV sync karke products add karo
        </p>
      </div>
    );
  }

  return (
    <div ref={tableRef} className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              SKU
            </th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Name
            </th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Category
            </th>
            <th className="text-right py-3 px-4 text-slate-500 font-medium">
              Price
            </th>
            <th className="text-right py-3 px-4 text-slate-500 font-medium">
              Stock
            </th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Vendor
            </th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr
              key={product.id}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                  {product.sku}
                </span>
              </td>
              <td className="py-3 px-4 font-medium text-slate-800">
                {product.name}
              </td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  {product.category || "N/A"}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-medium">
                ₹{Number(product.base_price).toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`font-medium ${
                    product.stock_qty < 50
                      ? "text-red-600"
                      : product.stock_qty < 200
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {product.stock_qty}
                </span>
                <span className="text-slate-400 ml-1 text-xs">
                  {product.unit}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-500 text-xs">
                {product.vendor_name || "N/A"}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {product.is_active ? "✅ Active" : "❌ Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
