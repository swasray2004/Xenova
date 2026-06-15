"use client";
import { useEffect, useState } from "react";
import { Plus, Zap, Send, ChevronRight, Loader2, Sparkles, X, Check } from "lucide-react";
import { cn, CHANNEL_COLORS, CHANNEL_ICONS, timeAgo } from "@/lib/utils";

type Channel = "whatsapp" | "sms" | "email" | "rcs";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    segmentId: "",
    channel: "whatsapp" as Channel,
    message: "",
    goal: "",
  });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/campaigns").then((r) => r.json()),
      fetch("/api/segments").then((r) => r.json()),
    ]).then(([c, s]) => {
      setCampaigns(c);
      setSegments(s);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Poll for live stats when campaigns are sending
  useEffect(() => {
    if (!campaigns.some((c) => c.status === "sending")) return;
    const t = setInterval(loadData, 2000);
    return () => clearInterval(t);
  }, [campaigns]);

  const getAISuggestions = async () => {
    if (!form.segmentId || !form.channel) return;
    setLoadingAI(true);
    setAiSuggestions([]);
    const res = await fetch("/api/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segmentId: form.segmentId, channel: form.channel, campaignGoal: form.goal }),
    });
    const data = await res.json();
    setAiSuggestions(data.suggestions || []);
    setLoadingAI(false);
  };

  const createCampaign = async () => {
    if (!form.name || !form.segmentId || !form.message) return;
    setCreating(true);
    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setCreating(false);
    setShowForm(false);
    setForm({ name: "", segmentId: "", channel: "whatsapp", message: "", goal: "" });
    setAiSuggestions([]);
    loadData();
  };

  const sendCampaign = async (campaignId: string) => {
    setSending(campaignId);
    await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId }),
    });
    setSending(null);
    loadData();
    // Keep polling
    setTimeout(loadData, 3000);
    setTimeout(loadData, 8000);
    setTimeout(loadData, 20000);
  };

  const channels: Channel[] = ["whatsapp", "sms", "email", "rcs"];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-inter text-gray-500 uppercase tracking-widest mb-1">Outreach</div>
          <h1 className="font-syne font-bold text-3xl text-gray-900 tracking-tight">Campaigns</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 from-indigo-500 to-indigo-600 hover:shadow-indigo-500/30 bg-gradient-to-r hover:shadow-lg text-white px-4 py-2.5 rounded-lg text-sm font-inter font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Campaign list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c: any) => (
            <div key={c.id} className="rounded-xl p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-300 bg-white shadow-sm hover:shadow-md">
              <div className="flex items-start gap-4">
                {/* Channel icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${CHANNEL_COLORS[c.channel]}15`, border: `1px solid ${CHANNEL_COLORS[c.channel]}30` }}>
                  {CHANNEL_ICONS[c.channel]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-syne font-semibold text-gray-900 text-base">{c.name}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-inter font-medium",
                      c.status === "sent" ? "bg-pink-50 text-pink-600" :
                      c.status === "sending" ? "bg-indigo-50 text-indigo-600" :
                      c.status === "draft" ? "bg-gray-100 text-gray-600" : ""
                    )}>
                      {c.status === "sending" && <span className="inline-block mr-1 animate-pulse">●</span>}
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-inter mb-3">
                    {c.segment?.name || c.segmentId} · Created {timeAgo(c.createdAt)}
                    {c.sentAt && ` · Sent ${timeAgo(c.sentAt)}`}
                  </div>

                  {/* Message preview */}
                  <div className="text-xs font-inter text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-4 border border-gray-200 italic">
                    "{c.message.slice(0, 100)}{c.message.length > 100 ? "..." : ""}"
                  </div>

                  {/* Stats */}
                  {c.sentCount > 0 && (
                    <div className="flex gap-6">
                      {[
                        { label: "Sent", val: c.sentCount, color: "#A78BFA" },
                        { label: "Delivered", val: c.deliveredCount, color: "#34D399" },
                        { label: "Opened", val: `${c.openRate}%`, color: "#60A5FA" },
                        { label: "Clicked", val: `${c.clickRate}%`, color: "#FBBF24" },
                        { label: "Failed", val: c.failedCount, color: "#F43F5E" },
                        { label: "Orders", val: c.ordersGenerated, color: "#FB923C" },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="text-center">
                          <div className="font-syne font-bold text-base" style={{ color }}>{val}</div>
                          <div className="text-[10px] text-gray-500 font-inter">{label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Delivery bar */}
                  {c.sentCount > 0 && (
                    <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div className="h-full bg-pink-400/70 transition-all duration-1000" style={{ width: `${c.deliveryRate}%` }} />
                        <div className="h-full bg-red-300/60" style={{ width: `${c.failedCount / c.sentCount * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  {c.status === "draft" && (
                    <button
                      onClick={() => sendCampaign(c.id)}
                      disabled={sending === c.id}
                      className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 px-4 py-2 rounded-lg text-sm font-inter font-medium transition-all disabled:opacity-60"
                    >
                      {sending === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sending === c.id ? "Sending..." : "Send Now"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <div className="font-syne font-bold text-gray-900 text-lg">New Campaign</div>
                <div className="text-xs text-gray-600 font-inter mt-0.5">Reach your shoppers intelligently</div>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-inter text-gray-600 mb-1.5">Campaign Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Summer Win-Back"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-colors"
                />
              </div>

              {/* Segment + Channel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-inter text-gray-600 mb-1.5">Segment</label>
                  <select
                    value={form.segmentId}
                    onChange={(e) => setForm({ ...form, segmentId: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-inter focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-colors appearance-none"
                  >
                    <option value="">Select segment</option>
                    {segments.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.customerCount})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-inter text-gray-600 mb-1.5">Channel</label>
                  <div className="flex gap-2">
                    {channels.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => setForm({ ...form, channel: ch })}
                        className={cn("flex-1 py-2.5 rounded-lg text-lg transition-all border",
                          form.channel === ch
                            ? "border-2"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                        style={form.channel === ch ? {
                          borderColor: CHANNEL_COLORS[ch],
                          background: `${CHANNEL_COLORS[ch]}10`
                        } : {}}
                        title={ch}
                      >
                        {CHANNEL_ICONS[ch]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal (for AI) */}
              <div>
                <label className="block text-xs font-inter text-gray-600 mb-1.5">Campaign Goal <span className="text-indigo-600/60">(for AI assist)</span></label>
                <input
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g. bring back lapsed shoppers with a discount"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-colors"
                />
              </div>

              {/* AI Suggest Button */}
              <button
                onClick={getAISuggestions}
                disabled={!form.segmentId || loadingAI}
                className="flex items-center gap-2 w-full justify-center py-2.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-inter font-medium transition-all disabled:opacity-40"
              >
                {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loadingAI ? "Generating messages..." : "✦ AI: Suggest messages"}
              </button>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-inter text-gray-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" /> AI-generated options — click to use
                  </div>
                  {aiSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setForm({ ...form, message: s })}
                      className={cn("w-full text-left text-xs font-inter px-3 py-2.5 rounded-lg border transition-all",
                        form.message === s
                          ? "border-indigo-300 bg-indigo-50 text-gray-900"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-gray-900"
                      )}
                    >
                      {form.message === s && <Check className="w-3 h-3 text-indigo-600 inline mr-1.5" />}
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-inter text-gray-600 mb-1.5">Message <span className="text-gray-400">— use {"{{name}}"} for first name</span></label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Write your message here..."
                  rows={3}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={createCampaign}
                disabled={creating || !form.name || !form.segmentId || !form.message}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-indigo-500/30 hover:shadow-lg text-white text-sm font-inter font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {creating ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
