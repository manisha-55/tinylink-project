// app/code/[code]/page.tsx
import Link from "next/link";

async function getData(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || ""}/api/links/${code}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: { code: string } }) {
  const data = await getData(params.code);
  if (!data) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold">Not found</h1>
        <Link href="/" className="text-blue-600 underline">Back</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stats — {data.code}</h1>

      <div className="border rounded p-4 mb-4">
        <p><strong>Target:</strong> <a href={data.target_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{data.target_url}</a></p>
        <p><strong>Clicks:</strong> {data.clicks}</p>
        <p><strong>Created:</strong> {new Date(data.created_at).toLocaleString()}</p>
        <p><strong>Last clicked:</strong> {data.last_clicked ? new Date(data.last_clicked).toLocaleString() : "Never"}</p>
      </div>

      <Link href="/" className="text-blue-600 underline">← Back to Dashboard</Link>
    </div>
  );
}
