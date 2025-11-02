import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/baseurl";

export default function BookingFormModal({ open, onClose, property, initial }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: initial?.checkIn || "",
    checkOut: initial?.checkOut || "",
    adults: initial?.adults ?? 1,
    children: initial?.children ?? 0,
    note: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  if (!open) return null;

  const update = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const payload = {
        propertyId: property?._id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.adults) + Number(form.children),
        guestName: form.name,
        guestEmail: form.email,
        guestPhone: form.phone,
        note: form.note,
      };
      await axios.post(`${BASE_URL}/bookings`, payload);
      setMsg("Your booking request has been sent. We’ll contact you shortly.");
    } catch (err) {
      setMsg(
        err?.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Book “{property?.name}”</h3>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            required
            name="name"
            value={form.name}
            onChange={update}
            className="border rounded-lg px-3 py-2"
            placeholder="Full name"
          />
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            className="border rounded-lg px-3 py-2"
            placeholder="Email"
          />
          <input
            required
            name="phone"
            value={form.phone}
            onChange={update}
            className="border rounded-lg px-3 py-2"
            placeholder="Phone"
          />

          <input
            required
            type="date"
            name="checkIn"
            value={form.checkIn}
            onChange={update}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            type="date"
            name="checkOut"
            value={form.checkOut}
            onChange={update}
            className="border rounded-lg px-3 py-2"
          />

          <input
            required
            type="number"
            min="1"
            name="adults"
            value={form.adults}
            onChange={update}
            className="border rounded-lg px-3 py-2"
            placeholder="Adults"
          />
          <input
            required
            type="number"
            min="0"
            name="children"
            value={form.children}
            onChange={update}
            className="border rounded-lg px-3 py-2"
            placeholder="Children"
          />

          <textarea
            name="note"
            value={form.note}
            onChange={update}
            className="border rounded-lg px-3 py-2 col-span-1 sm:col-span-2"
            placeholder="Special requests (optional)"
            rows={3}
          />

          <div className="col-span-1 sm:col-span-2 flex items-center justify-between">
            <p className="text-slate-600 text-sm">
              Total guests: <b>{Number(form.adults) + Number(form.children)}</b>
            </p>
            <button
              disabled={busy}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold disabled:opacity-60"
            >
              {busy ? "Submitting..." : "Submit Booking"}
            </button>
          </div>
        </form>

        {!!msg && <p className="mt-4 text-sm text-slate-700">{msg}</p>}
      </div>
    </div>
  );
}
