import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle?: string;
  trend?: "up" | "down" | "stable";
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
  trend,
}: StatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" },
    );
  }, []);

  const handleEnter = () => {
    gsap.to(cardRef.current, {
      y: -4,
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    });
  };
  const handleLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const trendIcon = trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️";
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-slate-500";

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm cursor-default"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-xl`}
        >
          {icon}
        </span>
        {trend && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendIcon}
          </span>
        )}
      </div>
      <p ref={valueRef} className="text-2xl font-bold text-slate-800">
        {value}
      </p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
