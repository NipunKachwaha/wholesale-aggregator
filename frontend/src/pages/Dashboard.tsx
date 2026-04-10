export default function Dashboard() {
  const stats = [
    { label: "Total Orders", value: "248", icon: "🛒", color: "bg-blue-500" },
    {
      label: "Active Products",
      value: "1,842",
      icon: "📦",
      color: "bg-green-500",
    },
    { label: "Vendors", value: "12", icon: "🏭", color: "bg-purple-500" },
    { label: "Revenue", value: "₹4.2L", icon: "💰", color: "bg-orange-500" },
  ];

  return (
    <div>
      <p className="text-slate-500 mb-6">
        Welcome back! Yahan aapka overview hai.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-6 border
                          border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`
                w-12 h-12 ${stat.color} rounded-lg flex items-center
                justify-center text-2xl
              `}
              >
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Recent Orders
        </h2>
        <div className="space-y-3">
          {["RICE-001", "OIL-001", "DAL-002"].map((sku, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3
                            border-b border-slate-100 last:border-0"
            >
              <div>
                <p className="font-medium text-slate-800">Order #{1000 + i}</p>
                <p className="text-sm text-slate-500">SKU: {sku}</p>
              </div>
              <span
                className="px-3 py-1 bg-blue-100 text-blue-700
                               text-sm rounded-full"
              >
                draft
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
