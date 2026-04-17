import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import OrderTable from "../components/orders/OrderTable";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import ConsolidationPanel from "../components/orders/ConsolidationPanel";
import ExportButton from '../components/ExportButton'
import PaymentModal from '../components/PaymentModal'
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../services/orders.service";

const STATUSES = [
  "All",
  "draft",
  "confirmed",
  "processing",
  "fulfilled",
  "cancelled",
];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    );
    fetchOrders();
  }, []);

  const fetchOrders = async (s?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders({
        status: s && s !== "All" ? s : undefined,
      });
      setOrders(res.data?.orders || []);
    } catch {
      setError("Orders load nahi ho paye — Order service chal rahi hai?");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (s: string) => {
    setStatus(s);
    fetchOrders(s);
  };

  // Order counts per status
  const statusCounts = STATUSES.slice(1).reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      {/* Header */}
      <div
        ref={headerRef}
        className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Orders</h2>
            <p className="text-slate-500 text-sm">
              {orders.length} total orders
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders(status)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              🔄 Refresh
            </button>
            <ExportButton reportType="orders" label="Export PDF" status={status !== 'All' ? status : undefined} />
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
          {STATUSES.slice(1).map((s) => (
            <div key={s} className="text-center p-2 bg-slate-50 rounded-lg">
              <p className="text-lg font-bold text-slate-800">
                {statusCounts[s] || 0}
              </p>
              <OrderStatusBadge status={s} />
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                status === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600 text-sm">❌ {error}</p>
          <p className="text-red-400 text-xs mt-1">
            Make sure order service chal rahi hai: http://localhost:3003
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <OrderTable
          orders={orders}
          loading={loading}
          onUpdate={() => fetchOrders(status)}
          onPay={(order) => setPaymentOrder(order)} /* <-- Added onPay prop here */
        />
      </div>
      
      {/* Consolidation Panel */}
      <div className="mt-6">
        <ConsolidationPanel />
      </div>

      {/* Payment Modal */}
      {paymentOrder && (
        <PaymentModal
          orderId={paymentOrder.id}
          amount={Number(paymentOrder.total_amount)}
          onClose={() => setPaymentOrder(null)}
          onSuccess={() => {
            setPaymentOrder(null);
            fetchOrders(status);
          }}
        />
      )}
    </div>
  );
}