"use client";
import { useEffect, useState } from "react";
import { Plus, Users, X, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const FIELD_OPTIONS = [
  { value: "totalSpend", label: "Total Spend (₹)" },
  { value: "orderCount", label: "Order Count" },
  { value: "daysSinceLastOrder", label: "Days Since Last Order" },
];

const OPERATOR_OPTIONS: Record<string, { value: string; label: string }[]> = {
  totalSpend: [
    { value: "gt", label: "greater than" },
    { value: "gte", label: "at least" },
    { value: "lt", label: "less than" },
  ],
  orderCount: [
    { value: "eq", label: "exactly" },
    { value: "gte", label: "at least" },
    { value: "gt", label: "more than" },
  ],
  daysSinceLastOrder: [
    { value: "gte", label: "at least" },
    { value: "lt", label: "less than" },
    { value: "gt", label: "more than" },
  ],
};

const PALETTE = ["#2a8cf5", "#EC4899", "#FBBF24", "#06B6D4", "#8B5CF6", "#F43F5E"];

export default function Segments() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    color: PALETTE[0],
    rules: [{ field: "totalSpend", operator: "gt", value: "1000" }],
  });

  const loadSegments = () => {
    setLoading(true);
    fetch("/api/segments")
      .then((r) => r.json())
      .then((data) => {
        setSegments(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSegments();
  }, []);

  const addRule = () => {
    setForm({ ...form, rules: [...form.rules, { field: "orderCount", operator: "gte", value: "2" }] });
  };

  const removeRule = (i: number) => {
    setForm({ ...form, rules: form.rules.filter((_, idx) => idx !== i) });
  };

  const updateRule = (i: number, updates: Partial<{ field: string; operator: string; value: string }>) => {
    const rules = [...form.rules];
    rules[i] = { ...rules[i], ...updates };
    if (updates.field) rules[i].operator = OPERATOR_OPTIONS[updates.field][0].value;
    setForm({ ...form, rules });
  };

  const createSegment = async () => {
    if (!form.name || form.rules.length === 0) return;
    setCreating(true);
    const rules = form.rules.map((r) => ({ ...r, value: Number(r.value) }));
    await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rules }),
    });
    setCreating(false);
    setShowForm(false);
    setForm({ name: "", description: "", color: PALETTE[0], rules: [{ field: "totalSpend", operator: "gt", value: "1000" }] });
    loadSegments();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs font-inter text-gray-500 uppercase tracking-widest mb-1">Audiences</div>
          <h1 className="font-syne font-bold text-3xl text-gray-900 tracking-tight">Segments</h1>
          <p className="text-gray-600 text-sm mt-1 font-inter">Define who to talk to and when.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 from-indigo-500 to-indigo-600 hover:shadow-indigo-500/30 bg-gradient-to-r hover:shadow-lg text-white px-4 py-2.5 rounded-lg text-sm font-inter font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> New Segment
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {segments.map((seg: any) => (
            <div key={seg.id} className="rounded-xl p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-300 bg-white shadow-sm hover:shadow-md group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${seg.color}15`, border: `1px solid ${seg.color}30` }}>
                  <Users className="w-5 h-5" style={{ color: seg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-syne font-semibold text-gray-900 text-base mb-0.5">{seg.name}</div>
                  <div className="text-xs text-gray-600 font-inter mb-3">{seg.description}</div>

                  {/* Rules */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {seg.rules.map((rule: any, i: number) => (
                      <span key={i} className="text-[10px] font-inter px-2 py-1 rounded-md bg-gray-100 border border-gray-200 text-gray-600">
                        {rule.field} {rule.operator} {rule.value}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-syne font-bold text-xl" style={{ color: seg.color }}>{seg.customerCount}</span>
                      <span className="text-xs text-gray-500 font-inter ml-1">shoppers</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-inter">Created {timeAgo(seg.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Segment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <div className="font-syne font-bold text-gray-900 text-lg">New Segment</div>
                <div className="text-xs text-gray-600 font-inter mt-0.5">Define your audience with rules</div>
              </div>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-inter text-gray-600 mb-1.5">Segment Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. High-Value Loyalists"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-inter text-gray-600 mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of who's in this segment"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-inter text-gray-600 mb-2">Color</label>
                <div className="flex gap-2">
                  {PALETTE.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={cn("w-7 h-7 rounded-full transition-all", form.color === c ? "ring-2 ring-gray-900 ring-offset-2 scale-110" : "opacity-60 hover:opacity-100")}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-inter text-gray-600">Rules — all must match</label>
                  <button onClick={addRule} className="text-xs text-indigo-600 hover:text-indigo-700 font-inter flex items-center gap-1 transition-colors">
                    <Plus className="w-3 h-3" /> Add rule
                  </button>
                </div>
                <div className="space-y-2">
                  {form.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <select
                        value={rule.field}
                        onChange={(e) => updateRule(i, { field: e.target.value })}
                        className="flex-1 bg-transparent text-xs text-gray-900 font-inter focus:outline-none appearance-none"
                      >
                        {FIELD_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(i, { operator: e.target.value })}
                        className="flex-1 bg-transparent text-xs text-gray-900 font-inter focus:outline-none appearance-none"
                      >
                        {(OPERATOR_OPTIONS[rule.field] || []).map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                      <input
                        type="number"
                        value={rule.value}
                        onChange={(e) => updateRule(i, { value: e.target.value })}
                        className="w-20 bg-transparent text-xs text-gray-900 font-inter focus:outline-none text-right"
                      />
                      {form.rules.length > 1 && (
                        <button onClick={() => removeRule(i)} className="text-gray-400 hover:text-pink-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={createSegment}
                disabled={creating || !form.name || form.rules.length === 0}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-indigo-500/30 hover:shadow-lg text-white text-sm font-inter font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {creating ? "Creating..." : "Create Segment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
