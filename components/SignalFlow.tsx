"use client";
import { useEffect, useState } from "react";

type Particle = { id: number; progress: number; color: string; path: "send" | "callback" };

const COLORS = ["#2a8cf5", "#06B6D4", "#8B5CF6", "#FB923C"];

export default function SignalFlow() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);

      setParticles((prev) => {
        // Move existing particles
        const moved = prev
          .map((p) => ({ ...p, progress: p.progress + 0.025 }))
          .filter((p) => p.progress < 1);

        // Occasionally spawn new particle
        if (Math.random() < 0.3) {
          moved.push({
            id: Date.now(),
            progress: 0,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            path: Math.random() > 0.4 ? "send" : "callback",
          });
        }

        return moved;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // SVG paths
  const W = 180, H = 220;
  const crmX = 30, crmY = 90;
  const chX = 150, chY = 90;
  const shopperX = 90, shopperY = 185;

  // Send path: CRM → Channel
  const sendPath = `M ${crmX} ${crmY} C ${crmX + 50} ${crmY}, ${chX - 50} ${chY}, ${chX} ${chY}`;
  // Callback path: Channel → Shopper → CRM
  const callbackPath = `M ${chX} ${chY} C ${chX} ${chY + 60}, ${shopperX + 40} ${shopperY}, ${shopperX} ${shopperY} C ${shopperX - 40} ${shopperY}, ${crmX} ${crmY + 60}, ${crmX} ${crmY}`;

  function pointOnCubic(path: string, t: number): { x: number; y: number } {
    if (path === "send") {
      // Simple bezier approximation
      const p0 = { x: crmX, y: crmY };
      const p1 = { x: crmX + 50, y: crmY };
      const p2 = { x: chX - 50, y: chY };
      const p3 = { x: chX, y: chY };
      const mt = 1 - t;
      return {
        x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
        y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
      };
    } else {
      // Piecewise for callback
      if (t < 0.45) {
        const t2 = t / 0.45;
        const p0 = { x: chX, y: chY };
        const p1 = { x: chX, y: chY + 60 };
        const p2 = { x: shopperX + 40, y: shopperY };
        const p3 = { x: shopperX, y: shopperY };
        const mt = 1 - t2;
        return {
          x: mt * mt * mt * p0.x + 3 * mt * mt * t2 * p1.x + 3 * mt * t2 * t2 * p2.x + t2 * t2 * t2 * p3.x,
          y: mt * mt * mt * p0.y + 3 * mt * mt * t2 * p1.y + 3 * mt * t2 * t2 * p2.y + t2 * t2 * t2 * p3.y,
        };
      } else {
        const t2 = (t - 0.45) / 0.55;
        const p0 = { x: shopperX, y: shopperY };
        const p1 = { x: shopperX - 40, y: shopperY };
        const p2 = { x: crmX, y: crmY + 60 };
        const p3 = { x: crmX, y: crmY };
        const mt = 1 - t2;
        return {
          x: mt * mt * mt * p0.x + 3 * mt * mt * t2 * p1.x + 3 * mt * t2 * t2 * p2.x + t2 * t2 * t2 * p3.x,
          y: mt * mt * mt * p0.y + 3 * mt * mt * t2 * p1.y + 3 * mt * t2 * t2 * p2.y + t2 * t2 * t2 * p3.y,
        };
      }
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {/* Static paths */}
        <path d={sendPath} stroke="#2a8cf5" strokeWidth={1.5} fill="none" strokeDasharray="4 4" opacity={0.4} className="flow-path" />
        <path d={callbackPath} stroke="#06B6D4" strokeWidth={1.5} fill="none" strokeDasharray="4 4" opacity={0.3} className="flow-path" />

        {/* Labels */}
        <text x={crmX} y={crmY - 28} textAnchor="middle" fontSize={8} fill="#2a8cf5" fontFamily="Inter">CRM</text>
        <text x={chX} y={chY - 28} textAnchor="middle" fontSize={8} fill="#2a8cf5" fontFamily="Inter">Channel</text>
        <text x={shopperX} y={shopperY + 22} textAnchor="middle" fontSize={8} fill="#2a8cf5" fontFamily="Inter">Shopper</text>

        {/* Nodes */}
        {/* CRM node */}
        <circle cx={crmX} cy={crmY} r={18} fill="#FFFFFF" stroke="#2a8cf5" strokeWidth={1.5} />
        <text x={crmX} y={crmY + 4} textAnchor="middle" fontSize={11}>⚡</text>

        {/* Channel node */}
        <circle cx={chX} cy={chY} r={18} fill="#FFFFFF" stroke="#8B5CF6" strokeWidth={1.5} />
        <text x={chX} y={chY + 4} textAnchor="middle" fontSize={11}>📡</text>

        {/* Shopper node */}
        <circle cx={shopperX} cy={shopperY} r={18} fill="#FFFFFF" stroke="#06B6D4" strokeWidth={1.5} />
        <text x={shopperX} y={shopperY + 4} textAnchor="middle" fontSize={11}>👤</text>

        {/* Animated particles */}
        {particles.map((p) => {
          const pt = pointOnCubic(p.path, p.progress);
          return (
            <circle
              key={p.id}
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill={p.color}
              opacity={0.9 - p.progress * 0.4}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 space-y-1.5 w-full">
        <div className="flex items-center gap-2 text-[11px] font-inter text-gray-600">
          <div className="w-8 h-px bg-indigo-600 opacity-60" style={{ background: "repeating-linear-gradient(to right, #2a8cf5 0, #2a8cf5 4px, transparent 4px, transparent 8px)" }} />
          <span>Send API → Channel</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-inter text-gray-600">
          <div className="w-8 h-px opacity-60" style={{ background: "repeating-linear-gradient(to right, #06B6D4 0, #06B6D4 4px, transparent 4px, transparent 8px)" }} />
          <span>Callbacks → Receipt API</span>
        </div>
      </div>
    </div>
  );
}
