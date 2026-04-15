import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useWebSocket } from "../hooks/useWebSocket";
import type { WsNotification } from "../hooks/useWebSocket";

const SEVERITY_CONFIG = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "✅",
    text: "text-green-800",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "❌",
    text: "text-red-800",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "⚠️",
    text: "text-yellow-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "ℹ️",
    text: "text-blue-800",
  },
};

function NotificationItem({ notif }: { notif: WsNotification }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const config = SEVERITY_CONFIG[notif.severity] || SEVERITY_CONFIG.info;

  useEffect(() => {
    gsap.fromTo(
      itemRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
    );
  }, []);

  return (
    <div
      ref={itemRef}
      className={`p-3 rounded-lg border ${config.bg} ${config.border} mb-2`}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg mt-0.5">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.text}`}>{notif.title}</p>
          <p className="text-xs text-slate-600 mt-0.5 truncate">
            {notif.message}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(notif.timestamp).toLocaleTimeString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function NotificationPanel() {
  const { notifications, connected, unreadCount, clearUnread, clearAll } =
    useWebSocket();

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    setOpen(true);
    clearUnread();

    // Panel animation
    setTimeout(() => {
      gsap.fromTo(
        panelRef.current,
        { y: -10, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.4)" },
      );
    }, 10);
  };

  const handleClose = () => {
    gsap.to(panelRef.current, {
      y: -10,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      onComplete: () => setOpen(false),
    });
  };

  // Bell shake animation jab naya notification aaye
  useEffect(() => {
    if (unreadCount > 0) {
      gsap.to(btnRef.current, {
        rotation: 15,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "power2.inOut",
        onComplete: () => gsap.set(btnRef.current, { rotation: 0 }),
      });
    }
  }, [unreadCount]);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={btnRef}
        onClick={open ? handleClose : handleOpen}
        className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <span className="text-xl">🔔</span>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Connection dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-40" onClick={handleClose} />

          {/* Notification Panel */}
          <div
            ref={panelRef}
            className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-sm">
                  Notifications
                </h3>
                <span
                  className={`w-2 h-2 rounded-full ${
                    connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-slate-400">
                  {connected ? "Live" : "Offline"}
                </span>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto p-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🔕</p>
                  <p className="text-slate-400 text-sm">
                    Koi notifications nahi hain
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    Orders aur syncs yahan dikhenge
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400 text-center">
                {notifications.length} notifications •{" "}
                {connected ? "🟢 Connected" : "🔴 Reconnecting..."}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
