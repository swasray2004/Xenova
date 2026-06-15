"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Users, Megaphone, ShoppingBag, ArrowRight, Zap } from "lucide-react";
import { formatCurrency, formatNumber, timeAgo, CHANNEL_COLORS, CHANNEL_ICONS } from "@/lib/utils";
import { ActiveView } from "@/app/page";
import SignalFlow from "./SignalFlow";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface DashboardProps {
  setActiveView: (view: ActiveView) => void;
}

const PERF_DATA = [
  { day: "Mon", sent: 120, delivered: 110, opened: 82 },
  { day: "Tue", sent: 95, delivered: 88, opened: 61 },
  { day: "Wed", sent: 180, delivered: 165, opened: 130 },
  { day: "Thu", sent: 60, delivered: 55, opened: 40 },
  { day: "Fri", sent: 220, delivered: 200, opened: 160 },
  { day: "Sat", sent: 310, delivered: 290, opened: 230 },
  { day: "Sun", sent: 140, delivered: 130, opened: 98 },
];

export default function Dashboard({ setActiveView }: DashboardProps) {
  const [stats, setStats] = useState({ customers: 0, campaigns: 0, sent: 0, orders: 0 });
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then((data) => {
        setCampaigns(data.slice(0, 3));
        const totalSent = data.reduce((s: number, c: any) => s + c.sentCount, 0);
        const totalOrders = data.reduce((s: number, c: any) => s + c.ordersGenerated, 0);
        setStats((prev) => ({ ...prev, campaigns: data.length, sent: totalSent, orders: totalOrders }));
      });
    fetch("/api/customers?limit=1")
      .then((r) => r.json())
      .then((data) => setStats((prev) => ({ ...prev, customers: data.total })));
  }, []);

  const metrics = [
    { label: "Total Customers", value: formatNumber(stats.customers), icon: Users, color: "#2a8cf5", delta: "+12 this week" },
    { label: "Campaigns Run", value: String(stats.campaigns), icon: Megaphone, color: "#EC4899", delta: "3 active" },
    { label: "Messages Sent", value: formatNumber(stats.sent), icon: Zap, color: "#FBBF24", delta: "Across all channels" },
    { label: "Orders Generated", value: String(stats.orders), icon: ShoppingBag, color: "#06B6D4", delta: "From campaigns" },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-inter text-gray-500 uppercase tracking-widest mb-1">Overview</div>
          <h1 className="font-syne font-bold text-3xl text-gray-900 tracking-tight">Good morning ✦</h1>
          <p className="text-gray-600 text-sm mt-1 font-inter">Your shoppers are waiting to hear from you.</p>
        </div>
        <button
          onClick={() => setActiveView("campaigns")}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-inter font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30"
        >
          <Zap className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map(({ label, value, icon: Icon, color, delta }) => (
          <div key={label} className="glass rounded-xl p-5 group hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <div className="font-syne font-bold text-2xl text-gray-900">{value}</div>
            <div className="text-xs font-inter text-gray-500 mt-0.5">{label}</div>
            <div className="text-[11px] font-inter mt-2" style={{ color }}>{delta}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-2 glass rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-syne font-semibold text-gray-900 text-base">7-Day Signal Overview</div>
              <div className="text-xs text-gray-500 font-inter mt-0.5">Messages sent, delivered & opened</div>
            </div>
            <div className="flex gap-4 text-xs font-inter">
              {[["Sent", "#2a8cf5"], ["Delivered", "#06B6D4"], ["Opened", "#EC4899"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={PERF_DATA}>
              <defs>
                <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a8cf5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2a8cf5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOpened" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#9CA3AF55", fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12, fontFamily: "Inter" }}
                labelStyle={{ color: "#1F2937" }}
              />
              <Area type="monotone" dataKey="sent" stroke="#2a8cf5" fill="url(#gradSent)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="delivered" stroke="#06B6D4" fill="url(#gradDelivered)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="opened" stroke="#EC4899" fill="url(#gradOpened)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Signal Flow */}
        <div className="glass rounded-xl p-5 shadow-sm">
          <div className="font-syne font-semibold text-gray-900 text-sm mb-1">Live Signal Flow</div>
          <div className="text-xs text-gray-500 font-inter mb-4">Channel callback loop</div>
          <SignalFlow />
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="glass rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="font-syne font-semibold text-gray-900">Recent Campaigns</div>
          <button
            onClick={() => setActiveView("campaigns")}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-inter hover:font-semibold"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {campaigns.map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ background: `${CHANNEL_COLORS[c.channel]}15` }}>
                {CHANNEL_ICONS[c.channel]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-inter font-medium text-gray-900 truncate">{c.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{c.segment?.name} · {timeAgo(c.createdAt)}</div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-sm font-syne font-semibold text-gray-900">{c.sentCount}</div>
                  <div className="text-[10px] text-gray-500 font-inter">Sent</div>
                </div>
                <div>
                  <div className="text-sm font-syne font-semibold text-pink-500">{c.openRate}%</div>
                  <div className="text-[10px] text-gray-500 font-inter">Opened</div>
                </div>
                <div>
                  <div className="text-sm font-syne font-semibold text-yellow-500">{c.ordersGenerated}</div>
                  <div className="text-[10px] text-gray-500 font-inter">Orders</div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-inter font-medium ${
                c.status === "sent" ? "bg-pink-100 text-pink-600" :
                c.status === "draft" ? "bg-gray-100 text-gray-600" :
                "bg-indigo-100 text-indigo-600"
              }`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
