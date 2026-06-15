"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, timeAgo, CHANNEL_ICONS } from "@/lib/utils";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/customers?search=${debouncedSearch}&page=${page}&limit=15`)
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers);
        setTotal(data.total);
        setLoading(false);
      });
  }, [debouncedSearch, page]);

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="text-xs font-inter text-gray-500 uppercase tracking-widest mb-1">Database</div>
        <h1 className="font-syne font-bold text-3xl text-gray-900 tracking-tight">Customers</h1>
        <p className="text-gray-600 text-sm mt-1 font-inter">{total} shoppers in your base</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or city..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 font-inter placeholder:text-gray-400 focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-200 text-[10px] font-inter font-medium text-gray-500 uppercase tracking-widest bg-gray-50">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">City</div>
          <div className="col-span-2">Total Spend</div>
          <div className="col-span-2">Orders</div>
          <div className="col-span-2">Channels</div>
          <div className="col-span-1">Joined</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          </div>
        ) : (
          customers.map((c: any) => (
            <div
              key={c.id}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-gray-200 last:border-0 hover:bg-indigo-50 cursor-pointer transition-colors group"
            >
              <div className="col-span-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-syne font-bold text-white flex-shrink-0"
                    style={{ background: `hsl(${(c.name.charCodeAt(0) * 37) % 360}, 65%, 45%)` }}>
                    {c.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-inter font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{c.name}</div>
                    <div className="text-[10px] text-gray-500 font-inter truncate">{c.email}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-600 font-inter">{c.city}</div>
              <div className="col-span-2 flex items-center font-syne font-semibold text-sm text-gray-900">{formatCurrency(c.totalSpend)}</div>
              <div className="col-span-2 flex items-center text-sm text-gray-600 font-inter">{c.orders.length} orders</div>
              <div className="col-span-2 flex items-center gap-1">
                {c.channels.map((ch: string) => (
                  <span key={ch} className="text-base" title={ch}>{CHANNEL_ICONS[ch]}</span>
                ))}
              </div>
              <div className="col-span-1 flex items-center text-xs text-gray-500 font-inter">{timeAgo(c.joinedAt)}</div>
            </div>
          ))
        )}
      </div>

      {/* Expanded row */}
      {selected && (
        <div className="mt-4 rounded-xl p-5 border border-gray-200 bg-white shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-syne font-bold text-gray-900 text-base">{selected.name}</div>
              <div className="text-xs text-gray-500 font-inter mt-0.5">{selected.email} · {selected.phone}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selected.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 font-inter">{tag}</span>
              ))}
            </div>
          </div>
          <div className="font-inter text-xs text-gray-500 mb-2">Order History</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selected.orders.length === 0 ? (
              <div className="text-xs text-gray-400 font-inter">No orders yet.</div>
            ) : selected.orders.map((o: any) => (
              <div key={o.id} className="flex items-center justify-between text-xs font-inter py-1.5 border-b border-gray-200">
                <span className="text-gray-600">{new Date(o.date).toLocaleDateString("en-IN")}</span>
                <span className="text-gray-600">{o.items.join(", ")}</span>
                <span className="font-syne font-semibold text-pink-500">{formatCurrency(o.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-500 font-inter">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-indigo-300 flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:border-indigo-300 flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
