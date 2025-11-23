"use client";

import { useEffect, useState } from "react";

type LinkItem = {
  id: number;
  code: string;
  target_url: string;
  clicks: number;
  last_clicked: string | null;
  created_at: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [code, setCode] = useState("");
  const [toast, setToast] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadLinks();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data);
    } catch (e) {
      setToast({ type: "error", text: "Failed to load links." });
    } finally {
      setLoading(false);
    }
  }

  function validateCode(c: string) {
    return /^[A-Za-z0-9]{6,8}$/.test(c);
  }

  function validateUrl(u: string) {
    try {
      const parsed = new URL(u);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!validateUrl(targetUrl)) {
      setToast({ type: "error", text: "Please enter a valid URL (http/https)." });
      return;
    }
    if (code && !validateCode(code)) {
      setToast({ type: "error", text: "Custom code must be 6-8 alphanumeric characters." });
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_url: targetUrl, code }),
      });

      if (res.status === 409) {
        setToast({ type: "error", text: "Custom code already exists." });
      } else {
        const data = await res.json();
        if (res.status === 200) {
          setToast({ type: "info", text: "URL already exists — showing existing short link." });
          setLinks((prev) => (prev.find((p) => p.id === data.id) ? prev : [data, ...prev]));
        } else if (res.status === 201) {
          setToast({ type: "success", text: "Short link created." });
          setLinks((prev) => [data, ...prev]);
        } else {
          setToast({ type: "error", text: data?.error || "Failed to create." });
        }
      }
      setTargetUrl("");
      setCode("");
    } catch (err) {
      setToast({ type: "error", text: "Network error while creating." });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(linkCode: string) {
    if (!confirm("Delete this link?")) return;
    try {
      const res = await fetch(`/api/links/${linkCode}`, { method: "DELETE" });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.code !== linkCode));
        setToast({ type: "success", text: "Link deleted." });
      } else {
        setToast({ type: "error", text: "Delete failed." });
      }
    } catch {
      setToast({ type: "error", text: "Network error." });
    }
  }

  function copyLink(codeStr: string) {
    const s = `${window.location.origin}/${codeStr}`;
    navigator.clipboard.writeText(s);
    setToast({ type: "success", text: "Copied to clipboard." });
  }

  const filtered = links.filter((l) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return l.code.toLowerCase().includes(q) || l.target_url.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">TinyLink</h1>
          <p className="text-sm text-gray-600">Shorten links, view stats, manage links.</p>
        </header>

        {/* Toast */}
        {toast && (
          <div className={`p-3 rounded mb-4 ${toast.type === "error" ? "bg-red-100 text-red-800" : toast.type === "success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
            {toast.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="flex-1 border px-3 py-2 rounded"
              placeholder="https://example.com/very/long/url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              aria-label="Target URL"
            />
            <input
              className="w-48 border px-3 py-2 rounded"
              placeholder="Custom code (6-8)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-label="Custom code"
            />
            <button
              disabled={formLoading}
              type="submit"
              className={`px-4 py-2 rounded ${formLoading ? "bg-gray-400" : "bg-black text-white"}`}
            >
              {formLoading ? "Creating..." : "Create"}
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-2">Codes: 6–8 letters/numbers. If URL exists, existing link will be returned.</div>
        </form>

        {/* Search */}
        <div className="flex items-center justify-between mb-4">
          <input className="border px-3 py-2 rounded w-full sm:w-1/2" placeholder="Search by code or URL" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="text-sm text-gray-500 ml-2">{filtered.length} links</div>
        </div>

        {/* Table / List */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Code</th>
                <th className="text-left px-4 py-2">Target URL</th>
                <th className="text-left px-4 py-2">Clicks</th>
                <th className="text-left px-4 py-2">Last clicked</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-4">No links found.</td></tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.code} className="border-t">
                    <td className="px-4 py-2">{l.code}</td>
                    <td className="px-4 py-2 max-w-xl truncate" title={l.target_url}>
                      <a href={l.target_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{l.target_url}</a>
                    </td>
                    <td className="px-4 py-2">{l.clicks}</td>
                    <td className="px-4 py-2">{l.last_clicked ? new Date(l.last_clicked).toLocaleString() : "-"}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => copyLink(l.code)} className="text-sm underline">Copy</button>
                      <a href={`/code/${l.code}`} className="text-sm underline">Stats</a>
                      <button onClick={() => handleDelete(l.code)} className="text-sm text-red-600 underline">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
