export default function Vendors() {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border
                    border-slate-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Vendors</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white
                           rounded-lg text-sm hover:bg-blue-700"
        >
          + Add Vendor
        </button>
      </div>
      <p className="text-slate-500">Step 10 mein vendors yahan load honge...</p>
    </div>
  );
}
