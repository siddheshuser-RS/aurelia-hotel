"use client";

import { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { API_BASE_URL, getApiErrorMessage, hotelApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

type LogItem = Awaited<ReturnType<typeof hotelApi.getRequestLog>>["items"][number];

function statusColor(status: number) {
  if (status >= 500) return "border-red-400/40 text-red-300";
  if (status >= 400) return "border-yellow-400/40 text-yellow-300";
  if (status >= 300) return "border-blue-400/40 text-blue-300";
  return "border-emerald-400/40 text-emerald-300";
}

export default function AdminRequestsPage() {
  const { ready } = useAdminAuth();
  const [items, setItems] = useState<LogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [capacity, setCapacity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    try {
      const data = await hotelApi.getRequestLog(200);
      setItems(data.items);
      setTotal(data.total);
      setCapacity(data.capacity);
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    if (autoRefresh) {
      timerRef.current = setInterval(load, 3000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ready, autoRefresh]);

  const onClear = async () => {
    if (!confirm("Clear in-memory request log?")) return;
    try {
      await hotelApi.clearRequestLog();
      load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  // Derived stats for the current visible window
  const stats = items.reduce(
    (acc, x) => {
      acc.total++;
      if (x.status >= 500) acc.errors++;
      else if (x.status >= 400) acc.client++;
      acc.totalMs += x.durationMs;
      return acc;
    },
    { total: 0, errors: 0, client: 0, totalMs: 0 }
  );

  const apiBase = API_BASE_URL.replace(/\/api$/, "");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">API Requests</h1>
          <p className="mt-1 text-sm text-white/60">
            Live in-memory log of every request hitting the backend (last {capacity} entries).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`${apiBase}/api/docs`} target="_blank" rel="noreferrer">
            <Button variant="ghost">Open Swagger UI ↗</Button>
          </a>
          <Button variant="ghost" onClick={() => setAutoRefresh((v) => !v)}>
            {autoRefresh ? "Pause" : "Resume"} auto-refresh
          </Button>
          <Button variant="ghost" onClick={load}>Refresh</Button>
          <Button variant="dark" onClick={onClear}>Clear</Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-white/50">Buffered</p>
          <p className="mt-1 font-heading text-3xl text-gold">{total}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-white/50">Visible</p>
          <p className="mt-1 font-heading text-3xl text-gold">{stats.total}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-white/50">4xx</p>
          <p className="mt-1 font-heading text-3xl text-yellow-300">{stats.client}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-white/50">5xx</p>
          <p className="mt-1 font-heading text-3xl text-red-300">{stats.errors}</p>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Method</th>
              <th className="px-3 py-2">Path</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">ms</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-white/50">
                  No requests captured yet — try hitting an endpoint.
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-white/5">
                <td className="px-3 py-2 text-white/70">
                  {new Date(it.ts).toLocaleTimeString()}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{it.method}</td>
                <td className="px-3 py-2 font-mono text-xs text-white/80">{it.path}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${statusColor(it.status)}`}>
                    {it.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-white/70">{it.durationMs}</td>
                <td className="px-3 py-2 text-white/60">{it.user ?? "—"}</td>
                <td className="px-3 py-2 text-white/40">{it.ip || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
