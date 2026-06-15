"use client";
import { LayoutDashboard, Megaphone, Users, Filter, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { ActiveView } from "@/app/page";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NAV_ITEMS = [
  { id: "dashboard" as ActiveView, label: "Overview", icon: LayoutDashboard },
  { id: "campaigns" as ActiveView, label: "Campaigns", icon: Megaphone },
  { id: "segments" as ActiveView, label: "Segments", icon: Filter },
  { id: "customers" as ActiveView, label: "Customers", icon: Users },
];

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-[220px] flex-shrink-0 h-screen flex flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <div className="font-syne font-bold text-gray-900 text-sm tracking-wide">XENOVA</div>
            <div className="text-[10px] text-gray-500 font-inter tracking-widest uppercase">Mini CRM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-[10px] font-inter font-medium text-gray-400 uppercase tracking-widest px-3 mb-3">Navigation</div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter transition-all duration-200 group",
              activeView === id
                ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", activeView === id ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")} />
            <span className="font-medium">{label}</span>
            {activeView === id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
            )}
          </button>
        ))}

        {/* AI Campaign Studio */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <div className="text-[10px] font-inter font-medium text-gray-400 uppercase tracking-widest px-3 mb-3">AI Tools</div>
          <Link
            href="/campaign-studio"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-inter transition-all duration-200 group bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 hover:border-pink-300 hover:from-pink-100 hover:to-purple-100 text-pink-600 hover:text-pink-700"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0 text-pink-500 group-hover:text-pink-600" />
            <span className="font-medium">Campaign Studio</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-[11px] font-syne font-bold text-white">
            M
          </div>
          <div>
            <div className="text-xs font-inter font-medium text-cream">Marketer</div>
            <div className="text-[10px] text-cream-dim/50">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
