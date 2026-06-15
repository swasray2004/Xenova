"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Campaigns from "@/components/Campaigns";
import Customers from "@/components/Customers";
import Segments from "@/components/Segments";

export type ActiveView = "dashboard" | "campaigns" | "customers" | "segments";

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        {activeView === "dashboard" && <Dashboard setActiveView={setActiveView} />}
        {activeView === "campaigns" && <Campaigns />}
        {activeView === "customers" && <Customers />}
        {activeView === "segments" && <Segments />}
      </main>
    </div>
  );
}
