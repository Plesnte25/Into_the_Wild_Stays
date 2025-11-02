import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import { Pencil, Eye, Pause, Play, Loader2, X } from "lucide-react";

import EditPropertyModal from "../components/admin/EditPropertyModal";
import ConfirmDialog from "../components/admin/ConfirmDialog";
import ChannelMappingDrawer from "../components/ChannelMappingDrawer";

export default function Property() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // property object
  const [confirm, setConfirm] = useState(null); // {id, name}
  const [query, setQuery] = useState("");

  const [mappingOpen, setMappingOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);

  function openMappingDrawer(property) {
    setCurrentProperty(property);
    setMappingOpen(true);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
    );
  }, [items, query]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/properties");
      setItems(data?.items || data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onSave = async (payload) => {
    // Create or update based on presence of _id
    try {
      if (payload._id) {
        const { data } = await api.put(`/properties/${payload._id}`, payload);
        setItems((prev) => prev.map((p) => (p._id === payload._id ? data : p)));
      } else {
        const { data } = await api.post(`/properties`, payload);
        setItems((prev) => [data, ...prev]);
      }
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to save property.");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/properties/${id}`);
      setItems((prev) => prev.filter((p) => p._id !== id));
      setConfirm(null);
      setEditing(null);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to delete property.");
    }
  };

  const togglePause = async (id, current) => {
    try {
      const { data } = await api.patch(`/properties/${id}/status`, {
        status: current === "Paused" ? "Active" : "Paused",
      });
      setItems((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (e) {
      console.error(e);
      alert("Could not update status.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Properties</h2>
          <p className="text-sm text-slate-500">Central inventory</p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Search by name or location..."
            className="h-10 w-64 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 focus:border-slate-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setEditing({})}
            className="h-10 rounded-md bg-teal px-4 text-white hover:bg-teal/90 transition-colors"
          >
            Add Property
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-12 border-b bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Occupancy</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No properties.</div>
        ) : (
          filtered.map((p) => (
            <div
              key={p._id}
              className="grid grid-cols-12 items-center border-b px-4 py-3 text-sm last:border-b-0"
            >
              <div className="col-span-4 truncate font-medium text-slate-800">
                {p.name}
              </div>
              <div className="col-span-2">{p.location}</div>
              <div className="col-span-2">
                ₹{p.price?.toLocaleString?.() ?? p.price}
              </div>
              <div className="col-span-1">{p.occupancy || 2}</div>
              <div className="col-span-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                    p.status === "Active"
                      ? "bg-teal-100 text-teal-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {p.status || "Active"}
                </span>
              </div>

              {/* Enlarged action buttons */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  title="Channel Mapping"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-light-grey hover:bg-teal/10 hover:border-teal/30 transition-colors"
                  onClick={() => openMappingDrawer(p)}
                >
                  <Eye className="h-4.5 w-4.5" />
                </button>
                <button
                  title="Edit"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-light-grey hover:bg-teal/10 hover:border-teal/30 transition-colors"
                  onClick={() => setEditing(p)}
                >
                  <Pencil className="h-4.5 w-4.5" />
                </button>
                <button
                  title={p.status === "Paused" ? "Resume" : "Pause"}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-light-grey hover:bg-teal/10 hover:border-teal/30 transition-colors"
                  onClick={() => togglePause(p._id, p.status)}
                >
                  {p.status === "Paused" ? (
                    <Play className="h-4.5 w-4.5" />
                  ) : (
                    <Pause className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT / CREATE */}
      {editing && (
        <EditPropertyModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onAskDelete={(prop) => setConfirm({ id: prop._id, name: prop.name })}
        />
      )}

      {/* CONFIRM DELETE */}
      {confirm && (
        <ConfirmDialog
          title="Delete property?"
          description={
            <>
              You are about to permanently delete <b>{confirm.name}</b>. This
              action cannot be undone.
            </>
          }
          confirmText="Delete"
          confirmTone="danger"
          onCancel={() => setConfirm(null)}
          onConfirm={() => onDelete(confirm.id)}
        />
      )}

      {/* CHANNEL MAPPING DRAWER */}
      <ChannelMappingDrawer
        open={mappingOpen}
        onClose={() => setMappingOpen(false)}
        property={currentProperty}
        onChanged={() => {
          // Optinally refetch state if needed
          fetchAll();
        }}
      />
    </div>
  );
}
