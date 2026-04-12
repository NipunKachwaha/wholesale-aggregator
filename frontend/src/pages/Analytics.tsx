import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import StatsCard from "../components/analytics/StatsCard";
import PriceOptimizer from "../components/analytics/PriceOptimizer";
import DemandForecast from "../components/analytics/DemandForecast";
import { checkAiHealth } from "../services/ai.service";

export default function Analytics() {
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [aiStatus, setAiStatus] = useState<"checking" | "online" | "offline">(
    "checking",
  );

  useEffect(() => {
    // Mount animations
    const tl = gsap.timeline();
    tl.fromTo(
      titleRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
    ).fromTo(
      contentRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.2",
    );

    // AI Service health check
    checkAiHealth()
      .then(() => setAiStatus("online"))
      .catch(() => setAiStatus("offline"));
  }, []);

  const stats = [
    {
      title: "Orders Analyzed",
      value: "248",
      icon: "🛒",
      color: "bg-blue-500",
      trend: "up" as const,
      subtitle: "Last 30 days",
    },
    {
      title: "Avg Price Savings",
      value: "12.4%",
      icon: "💰",
      color: "bg-green-500",
      trend: "up" as const,
      subtitle: "AI optimization se",
    },
    {
      title: "Forecast Accuracy",
      value: "87%",
      icon: "🎯",
      color: "bg-purple-500",
      trend: "stable" as const,
      subtitle: "Demand prediction",
    },
    {
      title: "AI Service",
      value:
        aiStatus === "online"
          ? "Online"
          : aiStatus === "offline"
            ? "Offline"
            : "...",
      icon: "🤖",
      color: aiStatus === "online" ? "bg-green-500" : "bg-red-500",
      subtitle: "http://localhost:8000",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div ref={titleRef} className="flex items-center justify-between mb-6">
        <div>
          <p className="text-slate-500">AI-powered insights aur predictions</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            aiStatus === "online"
              ? "bg-green-100 text-green-700"
              : aiStatus === "offline"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus === "online"
                ? "bg-green-500 animate-pulse"
                : aiStatus === "offline"
                  ? "bg-red-500"
                  : "bg-slate-400"
            }`}
          />
          AI Service {aiStatus}
        </div>
      </div>

      <div ref={contentRef}>
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* AI Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceOptimizer />
          <DemandForecast />
        </div>
      </div>
    </div>
  );
}
