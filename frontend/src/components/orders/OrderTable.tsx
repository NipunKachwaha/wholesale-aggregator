import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import OrderStatusBadge from "./OrderStatusBadge";

interface Order {
  id: string;
  status: string;
  line_items: any[];
  total_amount: number;
  created_at: string;
  notes: string;
}

interface Props {
  orders: Order[];
  loading: boolean;
  onUpdate: () => void;
}

export default function OrderTable({ orders, loading, onUpdate }: Props) {
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    if (!loading && orders.length > 0) {
      gsap.fromTo(
        rowRefs.current.filter(Boolean),
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        },
      );
    }
  }, [orders, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-4xl mb-3 animate-bounce">🛒</p>
          <p className="text-slate-500">Orders load ho rahe hain...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-slate-500">Koi orders nahi hain abhi</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Order ID
            </th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Items
            </th>
            <th className="text-right py-3 px-4 text-slate-500 font-medium">
              Total
            </th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Status
            </th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr
              key={order.id}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                  {order.id.slice(0, 8)}...
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(order.line_items)
                    ? order.line_items
                    : JSON.parse(order.line_items || "[]")
                  )
                    .slice(0, 2)
                    .map((item: any, j: number) => (
                      <span
                        key={j}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                      >
                        {item.sku} ×{item.quantity}
                      </span>
                    ))}
                  {(Array.isArray(order.line_items)
                    ? order.line_items
                    : JSON.parse(order.line_items || "[]")
                  ).length > 2 && (
                    <span className="text-xs text-slate-400">
                      +
                      {(Array.isArray(order.line_items)
                        ? order.line_items
                        : JSON.parse(order.line_items || "[]")
                      ).length - 2}{" "}
                      more
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right font-medium">
                ₹{Number(order.total_amount).toFixed(2)}
              </td>
              <td className="py-3 px-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-3 px-4 text-slate-500 text-xs">
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
