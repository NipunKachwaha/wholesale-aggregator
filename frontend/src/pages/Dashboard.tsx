import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTranslation } from 'react-i18next'
import NLQueryBar from '../components/NLQueryBar'

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  fulfilled: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
};

export default function Dashboard() {
  const { t } = useTranslation();
  const titleRef = useRef<HTMLParagraphElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const stats = [
    { label: t('dashboard.totalOrders'), value: "248", icon: "🛒", color: "bg-blue-500" },
    { label: t('dashboard.activeProducts'), value: "1,842", icon: "📦", color: "bg-green-500" },
    { label: t('dashboard.vendors'), value: "12", icon: "🏭", color: "bg-purple-500" },
    { label: t('dashboard.revenue'), value: "₹4.2L", icon: "💰", color: "bg-orange-500" },
  ];

  const recentOrders = [
    { id: 1001, sku: "RICE-001", status: "confirmed", amount: "₹1,205" },
    { id: 1002, sku: "OIL-001", status: "draft", amount: "₹900" },
    { id: 1003, sku: "DAL-002", status: "fulfilled", amount: "₹475" },
  ];

  useEffect(() => {
    const tl = gsap.timeline();

    // Title
    tl.fromTo(
      titleRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    )
      // Stat cards stagger
      .fromTo(
        cardRefs.current,
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.4)",
        },
        "-=0.2",
      )
      // Table
      .fromTo(
        tableRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.2",
      );
  }, []);

  // Card hover
  const handleCardEnter = (el: HTMLDivElement | null) => {
    gsap.to(el, {
      y: -6,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      duration: 0.25,
      ease: "power2.out",
    });
  };
  const handleCardLeave = (el: HTMLDivElement | null) => {
    gsap.to(el, {
      y: 0,
      scale: 1,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <div>
      <p ref={titleRef} className="text-slate-500 dark:text-slate-400 mb-6">
        {t('dashboard.welcome')} {t('dashboard.subtitle')}
      </p>

      {/* NL Query Bar */}
      <div>
        <NLQueryBar />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            onMouseEnter={() => handleCardEnter(cardRefs.current[i])}
            onMouseLeave={() => handleCardLeave(cardRefs.current[i])}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-700 cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div
        ref={tableRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
      >
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          {t('dashboard.recentOrders')}
        </h2>
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700 px-2 rounded-lg transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {t('dashboard.orderHash')}{order.id}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t('dashboard.sku')}: {order.sku}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {order.amount}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${statusColors[order.status]}`}
                  >
                    {t(`dashboard.status.${order.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}