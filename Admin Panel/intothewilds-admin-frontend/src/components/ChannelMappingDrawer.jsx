import { useEffect, useMemo, useState } from "react";
import { ChannelAPI } from "../lib/ChannelApi";

export default function ChannelMappingDrawer({
  open,
  onClose,
  property,
  onChanged,
}) {
  const [accounts, setAccounts] = useState([]);
  const [mappings, setMappings] = useState([]);
  const propertyId = property?._id;

  useEffect(() => {
    if (!open || !propertyId) return;
    (async () => {
      try {
        const [accs, maps] = await Promise.all([
          ChannelAPI.listAccounts(),
          ChannelAPI.listMappings({ property: propertyId }),
        ]);
        setAccounts(Array.isArray(accs) ? accs : []);
        setMappings(Array.isArray(maps) ? maps : maps?.items ?? []);
      } catch {
        setAccounts([]);
        setMappings([]);
      }
    })();
  }, [open, propertyId]);

  const channels = useMemo(
    () => accounts.map((a) => a.channel).join(", "),
    [accounts]
  );

  async function addMapping() {
    if (!propertyId) return alert("Missing property id.");
    // For now we support only Go-MMT. Require at least one Go-MMT account.
    const gommtAccount = accounts.find((a) => a.provider === "gommt");
    if (!gommtAccount) {
      return alert(
        "No Go-MMT account found.\nPlease create one in Settings ▸ Channels first."
      );
    }
    try {
      const created = await ChannelAPI.createMapping({
        provider: "gommt",
        property: propertyId,
        account: gommtAccount._id,
        remote: { hotelId: "", roomTypeId: "", ratePlanId: "" },
        sync: {
          rates: true,
          availability: true,
          restrictions: true,
          content: false,
        },
      });
      setMappings((prev) => [...prev, created]);
      onChanged?.();
    } catch (e) {
      alert(e?.message || "Failed to create mapping");
    }
  }

  async function saveMapping(id, patch) {
    const updated = await ChannelAPI.updateMapping(id, patch);
    setMappings((prev) => prev.map((m) => (m._id === id ? updated : m)));
    onChanged?.();
  }

  async function removeMapping(id) {
    if (!confirm("Remove mapping? This will NOT delete it on the OTA.")) return;
    await ChannelAPI.deleteMapping(id);
    setMappings((prev) => prev.filter((m) => m._id !== id));
    onChanged?.();
  }

  async function syncNow(mapping, scope) {
    await ChannelAPI.syncProperty(
      mapping._id,
      scope ?? { rates: true, availability: true }
    );
    alert("Sync queued.");
  }

  async function preview(mappingId) {
    const res = await fetch(`/api/channels/mappings/${mappingId}/preview`, {
      credentials: "include",
    });
    const json = await res.json();
    if (!json.ok) return alert(json.message || "Preview failed");
    console.log("Mock Preview:", json.data);
    alert("Preview logged in console (open DevTools).");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-white shadow-2xl overflow-y-auto">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Channel Mapping – {property?.name}
          </h3>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-gray-600">
            Connected channels: {channels || "none (create accounts first)"}
          </div>

          <button
            className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            onClick={addMapping}
          >
            + Add mapping
          </button>

          {mappings.map((m) => (
            <div key={m._id} className="border rounded-lg p-4 space-y-3">
              <div className="text-sm font-medium">
                {m.account?.channel || m.provider}{" "}
                <span className="text-gray-400">
                  ({m.account?.name || m.account?._id || m.provider})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs">
                  Hotel/Property ID
                  <input
                    className="input"
                    defaultValue={m.remote?.hotelId || ""}
                    onBlur={(e) =>
                      saveMapping(m._id, {
                        remote: { ...m.remote, hotelId: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="text-xs">
                  Room Type ID
                  <input
                    className="input"
                    defaultValue={m.remote?.roomTypeId || ""}
                    onBlur={(e) =>
                      saveMapping(m._id, {
                        remote: { ...m.remote, roomTypeId: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="text-xs">
                  Rate Plan ID
                  <input
                    className="input"
                    defaultValue={m.remote?.ratePlanId || ""}
                    onBlur={(e) =>
                      saveMapping(m._id, {
                        remote: { ...m.remote, ratePlanId: e.target.value },
                      })
                    }
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={m.sync?.rates}
                    onChange={(e) =>
                      saveMapping(m._id, {
                        sync: { ...m.sync, rates: e.target.checked },
                      })
                    }
                  />{" "}
                  Rates
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={m.sync?.availability}
                    onChange={(e) =>
                      saveMapping(m._id, {
                        sync: { ...m.sync, availability: e.target.checked },
                      })
                    }
                  />{" "}
                  Availability
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={m.sync?.restrictions}
                    onChange={(e) =>
                      saveMapping(m._id, {
                        sync: { ...m.sync, restrictions: e.target.checked },
                      })
                    }
                  />{" "}
                  Restrictions
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  onClick={() =>
                    syncNow(m, { rates: true, availability: true })
                  }
                >
                  Sync now
                </button>
                {/* mock cta */}
                <button
                  className="px-3 py-2 bg-slate-100 rounded hover:bg-slate-200"
                  onClick={() => preview(m._id)}
                >
                  Preview
                </button>
                
                <button
                  className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  onClick={() => removeMapping(m._id)}
                >
                  Remove mapping
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
