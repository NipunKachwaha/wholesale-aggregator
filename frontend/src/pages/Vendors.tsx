import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import VendorCard from "../components/vendors/VendorCard";
import AddVendorModal from "../components/vendors/AddVendorModal";
import { getVendors, syncVendor } from "../services/vendors.service";

export default function Vendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      headerRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    );
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVendors();
      setVendors(res.data?.vendors || []);

      // Cards animation
      setTimeout(() => {
        const cards = cardsRef.current?.querySelectorAll(".vendor-card");
        if (cards) {
          gsap.fromTo(
            Array.from(cards),
            { y: 30, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.4,
              stagger: 0.1,
              ease: "back.out(1.4)",
            },
          );
        }
      }, 100);
    } catch {
      setError("Vendors load nahi ho paye");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (vendorId: string) => {
    setSyncingId(vendorId);
    try {
      await syncVendor(vendorId);
      fetchVendors();
    } catch {
      // Sync fail — ignore
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-500">{vendors.length} vendors registered</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Vendor
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-4xl mb-3 animate-bounce">🏭</p>
            <p className="text-slate-500">Vendors load ho rahe hain...</p>
          </div>
        </div>
      )}

      {/* Vendor Cards */}
      {!loading && (
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {vendors.map((vendor) => (
            <div key={vendor.id} className="vendor-card">
              <VendorCard
                vendor={vendor}
                onSync={handleSync}
                syncing={syncingId === vendor.id}
              />
            </div>
          ))}

          {vendors.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <p className="text-4xl mb-3">🏭</p>
              <p className="text-slate-500">Koi vendors nahi hain</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                + Pehla Vendor Add Karo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <AddVendorModal
          onClose={() => setShowModal(false)}
          onAdded={fetchVendors}
        />
      )}
    </div>
  );
}
