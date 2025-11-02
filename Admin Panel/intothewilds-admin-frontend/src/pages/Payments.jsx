import { useEffect, useState } from "react";
import api from "../lib/axios";

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const { data } = await api.get("/payments", {
          params: { limit: 100, sort: "createdAt_desc" },
        });
        const items = (data?.items || data || []).map((p) => ({
          id: p._id,
          provider: p.provider || "razorpay",
          paymentId: p.paymentId || p.id || "-",
          orderId: p.orderId || "-",
          amount: p.amount || 0,
          currency: p.currency || "INR",
          status: p.status || "created",
          createdAt: p.createdAt,
        }));
        if (on) setRows(items);
      } catch (e) {
        console.error(e);
        if (on) setRows([]);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, []);

  if (loading)
    return <div className="p-4 text-sm text-slate-500">Loading payments…</div>;
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Payments</h1>
        <div className="text-sm text-slate-500">Total: {rows.length}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>ID</Th>
              <Th>Provider</Th>
              <Th>Order</Th>
              <Th>Status</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <Td>{r.paymentId}</Td>
                <Td>{r.provider}</Td>
                <Td>{r.orderId}</Td>
                <Td>
                  <Badge status={r.status} />
                </Td>
                <Td>₹{Math.round(r.amount).toLocaleString("en-IN")}</Td>
                <Td>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString("en-IN")
                    : "-"}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
      {children}
    </th>
  );
}
function Td({ children }) {
  return (
    <td className="px-4 py-2 text-sm text-slate-800 whitespace-nowrap">
      {children}
    </td>
  );
}
function Badge({ status }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "captured"
      ? "bg-green-100 text-green-800"
      : s.includes("refund")
      ? "bg-orange-100 text-orange-800"
      : s === "failed"
      ? "bg-red-100 text-red-800"
      : "bg-slate-100 text-slate-800";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status || "—"}
    </span>
  );
}
