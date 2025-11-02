import { useState, useRef, useEffect } from "react";
import api from "../../lib/axios";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Calendar,
  MapPin,
  Users,
  Building2,
  Star,
  Image as ImageIcon,
} from "lucide-react";

const defaultSeason = () => ({
  name: "",
  startDate: "",
  endDate: "",
  price: "",
});

const toThumb = (url, { w = 360, h = 240 } = {}) => {
  if (!url || !/^https?:\/\/res\.cloudinary\.com/.test(url)) return url;
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto:eco,c_fill,w_${w},h_${h}/`
  );
};

export default function EditPropertyModal({
  initial = {},
  onClose,
  onSave,
  onAskDelete,
}) {
  const [form, setForm] = useState({
    _id: initial._id,
    name: initial.name || "",
    location: initial.location || "",
    addressLine: initial.addressLine || "",
    price: initial.price || "",
    occupancy: initial.occupancy || 2,
    description: initial.description || "",
    amenities: Array.isArray(initial.amenities) ? initial.amenities : [],
    policy: initial.policy || "",
    status: initial.status || "active",
    availability: initial.availability ?? true,
    images: Array.isArray(initial.images) ? initial.images : [],
    imagesPublicIds: Array.isArray(initial.imagesPublicIds)
      ? initial.imagesPublicIds
      : [],
    seasonalPricing: Array.isArray(initial.seasonalPricing)
      ? initial.seasonalPricing
      : [],
  });

  const [urlDraft, setUrlDraft] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("property");
  const [amenityInput, setAmenityInput] = useState("");

  const addUrl = () => {
    const u = urlDraft.trim();
    if (!u) {
      setUrlError(true);
      return;
    }
    setForm((s) => ({
      ...s,
      images: [...s.images, u],
      imagesPublicIds: [...s.imagesPublicIds, ""],
    }));
    setUrlDraft("");
    setUrlError(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!initial?._id) return;
      try {
        const { data } = await api.get(`/properties/${initial._id}`);
        if (cancelled) return;
        setForm((s) => ({
          ...s,
          name: data.name || s.name,
          location: data.location || s.location,
          addressLine: data.addressLine || s.addressLine,
          price: data.price || s.price,
          occupancy: data.occupancy || s.occupancy,
          description: data.description || s.description,
          amenities: Array.isArray(data.amenities)
            ? data.amenities
            : s.amenities,
          policy: data.policy || s.policy,
          status: data.status || s.status,
          availability: data.availability ?? s.availability,
          images: Array.isArray(data.images) ? data.images : s.images,
          imagesPublicIds: Array.isArray(data.imagesPublicIds)
            ? data.imagesPublicIds
            : s.imagesPublicIds,
          seasonalPricing: Array.isArray(data.seasonalPricing)
            ? data.seasonalPricing
            : s.seasonalPricing,
        }));
      } catch (e) {
        console.error("Failed to load full property", e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [initial?._id]);

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const isEditing = Boolean(form._id);
  const [saving, setSaving] = useState(false);

  const update = (key, val) => setForm((s) => ({ ...s, [key]: val }));

  const onChangeSeason = (idx, key, val) => {
    setForm((s) => {
      const next = [...s.seasonalPricing];
      next[idx] = { ...next[idx], [key]: val };
      return { ...s, seasonalPricing: next };
    });
  };

  const addSeason = () =>
    setForm((s) => ({
      ...s,
      seasonalPricing: [...s.seasonalPricing, defaultSeason()],
    }));

  const removeSeason = (idx) =>
    setForm((s) => ({
      ...s,
      seasonalPricing: s.seasonalPricing.filter((_, i) => i !== idx),
    }));

  const addImageFile = () => fileRef.current?.click();

  const onFilesPicked = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const q = form._id ? `?folder=itw/uploads/properties/${form._id}` : "";
        const { data } = await api.post(`/media/upload${q}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        const url = data?.asset?.url;
        const pid = data?.asset?.publicId;
        if (!url || !pid) throw new Error("Malformed /media/upload response");
        uploaded.push({ url, pid });
      }
      setForm((s) => ({
        ...s,
        images: [...s.images, ...uploaded.map((u) => u.url)],
        imagesPublicIds: [...s.imagesPublicIds, ...uploaded.map((u) => u.pid)],
      }));
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err.message || "Upload failed";
      alert(msg);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Drag and Drop functionality
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    setForm((s) => {
      const newImages = [...s.images];
      const newPublicIds = [...s.imagesPublicIds];

      const draggedImage = newImages[dragIndex];
      const draggedPublicId = newPublicIds[dragIndex];

      newImages.splice(dragIndex, 1);
      newPublicIds.splice(dragIndex, 1);

      newImages.splice(dropIndex, 0, draggedImage);
      newPublicIds.splice(dropIndex, 0, draggedPublicId);

      return {
        ...s,
        images: newImages,
        imagesPublicIds: newPublicIds,
      };
    });

    setDragIndex(null);
  };

  const setHeroImage = (index) => {
    if (index === 0) return;

    setForm((s) => {
      const newImages = [...s.images];
      const newPublicIds = [...s.imagesPublicIds];

      const heroImage = newImages[index];
      const heroPublicId = newPublicIds[index];

      newImages.splice(index, 1);
      newPublicIds.splice(index, 1);

      newImages.unshift(heroImage);
      newPublicIds.unshift(heroPublicId);

      return {
        ...s,
        images: newImages,
        imagesPublicIds: newPublicIds,
      };
    });
  };

  const removeImage = async (i) => {
    const publicId = form.imagesPublicIds?.[i];
    if (form._id && publicId) {
      try {
        await api.delete(`/properties/${form._id}/images`, {
          data: { publicId },
        });
      } catch (e) {
        console.error(e);
        alert("Failed to delete from server; local list will still update.");
      }
    }
    setForm((s) => ({
      ...s,
      images: s.images.filter((_, idx) => idx !== i),
      imagesPublicIds: s.imagesPublicIds.filter((_, idx) => idx !== i),
    }));
  };

  const addAmenity = () => {
    const amenity = amenityInput.trim();
    if (amenity && !form.amenities.includes(amenity)) {
      setForm((s) => ({
        ...s,
        amenities: [...s.amenities, amenity],
      }));
      setAmenityInput("");
    }
  };

  const removeAmenity = (index) => {
    setForm((s) => ({
      ...s,
      amenities: s.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addAmenity();
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      const submitData = {
        ...form,
        occupancy: Number(form.occupancy || 2),
        price: Number(form.price || 0),
        seasonalPricing: form.seasonalPricing.map((S) => ({
          ...S,
          price: Number(S.price || 0),
          startDate: S.startDate ? new Date(S.startDate) : null,
          endDate: S.endDate ? new Date(S.endDate) : null,
        })),
      };

      await onSave(submitData);
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Failed to save property. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "property", label: "Property", icon: Building2 },
    { id: "images", label: "Images", icon: ImageIcon },
  ];

  const commonAmenities = [
    "Swimming Pool",
    "WiFi",
    "Air Conditioning",
    "Parking",
    "Kitchen",
    "Pet Friendly",
    "Garden",
    "TV",
    "Hot Tub",
    "BBQ Grill",
    "Ocean View",
    "Mountain View",
    "Beach Access",
    "Private Entrance",
  ];

  const addCommonAmenity = (amenity) => {
    if (!form.amenities.includes(amenity)) {
      setForm((s) => ({
        ...s,
        amenities: [...s.amenities, amenity],
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2">
      <div className="flex h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Compact Sidebar */}
        <div className="hidden md:flex w-48 flex-shrink-0 bg-gradient-to-b from-slate-900 to-slate-800 p-3">
          <div className="flex flex-1 flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white">
                {isEditing ? "Edit Property" : "Add Property"}
              </h2>
            </div>

            <nav className="space-y-1 flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-amber-500 text-white shadow"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {isEditing && (
              <div className="pt-3">
                <button
                  onClick={() => onAskDelete(form)}
                  className="w-full flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Property
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {activeTab === "property" && "Property Details"}
                {activeTab === "images" && "Property Images"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "property" && (
              <div className="space-y-4">
                {/* Basic Information - Compact Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Property Name *
                    </label>
                    <input
                      className="h-8 w-full rounded border border-slate-300 px-2 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Property name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                      <input
                        className="h-8 w-full rounded border border-slate-300 pl-7 pr-2 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        placeholder="Location"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Price (₹/night) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="h-8 w-full rounded border border-slate-300 px-2 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                      value={form.price}
                      onChange={(e) => update("price", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Max Occupancy *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        className="h-8 w-full rounded border border-slate-300 pl-7 pr-2 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                        value={form.occupancy}
                        onChange={(e) => update("occupancy", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Availability - Compact Row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Status
                    </label>
                    <select
                      className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                      value={form.status}
                      onChange={(e) => update("status", e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <div className="relative flex items-center">
                      <input
                        id="avail"
                        type="checkbox"
                        className="peer h-3 w-3 cursor-pointer rounded border-slate-300 text-amber-500 focus:ring-1 focus:ring-amber-200"
                        checked={form.availability}
                        onChange={(e) =>
                          update("availability", e.target.checked)
                        }
                      />
                      <div className="pointer-events-none absolute inset-0 rounded ring-1 ring-transparent peer-focus:ring-amber-200"></div>
                    </div>
                    <label
                      htmlFor="avail"
                      className="text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Accepting bookings
                    </label>
                  </div>
                </div>

                {/* Address & Description */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Address Line
                    </label>
                    <input
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                      value={form.addressLine}
                      onChange={(e) => update("addressLine", e.target.value)}
                      placeholder="Full street address"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="Property description..."
                    />
                  </div>
                </div>

                {/* Amenities - Compact */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Amenities ({form.amenities.length})
                    </label>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <input
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type amenity + Enter"
                    />
                    <button
                      onClick={addAmenity}
                      className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {/* Quick amenities */}
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {commonAmenities.slice(0, 6).map((amenity) => (
                        <button
                          key={amenity}
                          onClick={() => addCommonAmenity(amenity)}
                          disabled={form.amenities.includes(amenity)}
                          className={`px-2 py-1 text-xs rounded border transition-all ${
                            form.amenities.includes(amenity)
                              ? "bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected amenities */}
                  <div className="flex flex-wrap gap-1 min-h-[40px] border border-slate-200 rounded p-2 bg-slate-50">
                    {form.amenities.length === 0 ? (
                      <p className="text-slate-500 text-xs">
                        No amenities added
                      </p>
                    ) : (
                      form.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-white rounded px-2 py-1 text-xs border border-slate-200"
                        >
                          <span>{amenity}</span>
                          <button
                            onClick={() => removeAmenity(index)}
                            className="text-slate-500 hover:text-red-500 ml-1"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Policies */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Policies
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                    value={form.policy}
                    onChange={(e) => update("policy", e.target.value)}
                    placeholder="Check-in/out, cancellation, house rules..."
                  />
                </div>

                {/* Seasonal Pricing - Compact */}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Seasonal Pricing
                      </h4>
                    </div>
                    <button
                      onClick={addSeason}
                      className="inline-flex items-center gap-1 rounded bg-amber-500 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-600 transition-all"
                    >
                      <Plus className="h-3 w-3" /> Add Season
                    </button>
                  </div>

                  {form.seasonalPricing?.length === 0 ? (
                    <div className="rounded border border-dashed border-slate-300 p-4 text-center">
                      <Calendar className="mx-auto h-5 w-5 text-slate-400" />
                      <p className="mt-1 text-slate-600 text-xs">
                        No seasonal pricing configured
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.seasonalPricing.map((s, idx) => (
                        <div
                          key={idx}
                          className="rounded border border-slate-200 bg-white p-3"
                        >
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-end">
                            <div className="sm:col-span-3">
                              <label className="block text-xs text-slate-700 mb-1">
                                Season
                              </label>
                              <input
                                placeholder="Summer"
                                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                                value={s.name}
                                onChange={(e) =>
                                  onChangeSeason(idx, "name", e.target.value)
                                }
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs text-slate-700 mb-1">
                                Start
                              </label>
                              <input
                                type="date"
                                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 cursor-pointer"
                                value={s.startDate?.slice(0, 10) || ""}
                                onChange={(e) =>
                                  onChangeSeason(
                                    idx,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                                onClick={(e) => e.target.showPicker()}
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-xs text-slate-700 mb-1">
                                End
                              </label>
                              <input
                                type="date"
                                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 cursor-pointer"
                                value={s.endDate?.slice(0, 10) || ""}
                                onChange={(e) =>
                                  onChangeSeason(idx, "endDate", e.target.value)
                                }
                                onClick={(e) => e.target.showPicker()}
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs text-slate-700 mb-1">
                                Price (₹)
                              </label>
                              <input
                                placeholder="0"
                                type="number"
                                min="0"
                                className="h-7 w-full rounded border border-slate-300 bg-white px-2 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                                value={s.price}
                                onChange={(e) =>
                                  onChangeSeason(idx, "price", e.target.value)
                                }
                              />
                            </div>
                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                onClick={() => removeSeason(idx)}
                                className="h-7 w-7 flex items-center justify-center rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                                title="Remove season"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-4">
                {/* Upload Section - Compact */}
                <div className="rounded border border-slate-200 bg-white p-3">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    Add Images
                  </h4>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            className={`h-8 w-full rounded border px-2 text-sm outline-none transition-all focus:ring-1 focus:ring-amber-200 ${
                              urlError
                                ? "border-red-300 focus:border-red-500"
                                : "border-slate-300 focus:border-amber-500"
                            }`}
                            placeholder="Paste image URL"
                            value={urlDraft}
                            onChange={(e) => {
                              setUrlDraft(e.target.value);
                              if (urlError) setUrlError(false);
                            }}
                          />
                          {urlError && (
                            <p className="mt-1 text-xs text-red-600">
                              Please enter a valid image URL
                            </p>
                          )}
                        </div>
                        <button
                          onClick={addUrl}
                          className="h-8 rounded bg-slate-800 px-3 text-xs font-semibold text-white hover:bg-slate-900 transition-all whitespace-nowrap"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={addImageFile}
                        disabled={uploading}
                        className="h-8 inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all"
                      >
                        <Upload className="h-3 w-3" />
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onFilesPicked}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Gallery */}
                {form.images.length === 0 ? (
                  <div className="rounded border-2 border-dashed border-slate-300 p-6 text-center">
                    <ImageIcon className="mx-auto h-6 w-6 text-slate-400" />
                    <p className="mt-1 text-slate-600 text-xs">
                      No images added yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Hero Image */}
                    {form.images[0] && (
                      <div className="rounded border-2 border-amber-500 bg-amber-50 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="font-semibold text-amber-800 text-xs">
                            Hero Image
                          </span>
                        </div>
                        <div className="flex gap-2 items-start">
                          <div className="relative flex-shrink-0 group">
                            <div className="h-16 w-20 overflow-hidden rounded bg-slate-100">
                              <img
                                src={toThumb(form.images[0], { w: 80, h: 64 })}
                                alt="Hero image"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              className="mb-1 h-6 w-full rounded border border-amber-300 bg-white px-1 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                              value={form.images[0]}
                              onChange={(e) =>
                                setForm((s) => {
                                  const imgs = [...s.images];
                                  imgs[0] = e.target.value;
                                  return { ...s, images: imgs };
                                })
                              }
                            />
                            <div className="flex gap-1">
                              <a
                                href={form.images[0]}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-1 py-0.5 text-xs text-slate-700 hover:bg-slate-50 transition-all"
                              >
                                View
                              </a>
                              <button
                                onClick={() => removeImage(0)}
                                className="inline-flex items-center gap-1 rounded border border-red-300 bg-red-50 px-1 py-0.5 text-xs text-red-700 hover:bg-red-100 transition-all"
                              >
                                <Trash2 className="h-2 w-2" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Images Grid */}
                    {form.images.length > 1 && (
                      <div className="rounded border border-slate-200 bg-white p-3">
                        <h5 className="font-semibold text-slate-900 text-xs mb-2">
                          Gallery Images ({form.images.length - 1})
                          <span className="text-slate-500 text-xs font-normal ml-1">
                            Drag to reorder • Click star to set as hero
                          </span>
                        </h5>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {form.images.slice(1).map((img, i) => {
                            const actualIndex = i + 1;
                            return (
                              <div
                                key={actualIndex}
                                draggable
                                onDragStart={(e) =>
                                  handleDragStart(e, actualIndex)
                                }
                                onDragOver={(e) =>
                                  handleDragOver(e, actualIndex)
                                }
                                onDrop={(e) => handleDrop(e, actualIndex)}
                                className="group relative rounded border border-slate-200 bg-white p-2 transition-all hover:shadow-sm cursor-move"
                              >
                                {/* Star button for hero image */}
                                <button
                                  onClick={() => setHeroImage(actualIndex)}
                                  className="absolute -top-1 -left-1 z-10 h-4 w-4 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 hover:bg-amber-50 hover:border-amber-200 transition-all"
                                  title="Set as hero image"
                                >
                                  <Star className="h-2 w-2 text-slate-400 hover:text-amber-500" />
                                </button>

                                {/* Remove button */}
                                <button
                                  onClick={() => removeImage(actualIndex)}
                                  className="absolute -top-1 -right-1 z-10 h-4 w-4 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all"
                                  title="Remove image"
                                >
                                  <Trash2 className="h-2 w-2 text-slate-400 hover:text-red-500" />
                                </button>

                                {/* Image thumbnail */}
                                <div className="aspect-video overflow-hidden rounded bg-slate-100 mb-1">
                                  <img
                                    src={toThumb(img, { w: 120, h: 80 })}
                                    alt={`Property image ${actualIndex + 1}`}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                  />
                                </div>

                                {/* URL input */}
                                <input
                                  className="h-5 w-full rounded border border-slate-300 bg-slate-50 px-1 text-xs outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 truncate"
                                  value={img}
                                  onChange={(e) =>
                                    setForm((s) => {
                                      const imgs = [...s.images];
                                      imgs[actualIndex] = e.target.value;
                                      return { ...s, images: imgs };
                                    })
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <button
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={saving || !form.name}
              onClick={submit}
              className="inline-flex items-center gap-1 rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
            >
              {saving ? (
                <>
                  <div className="h-2 w-2 animate-spin rounded-full border border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Property"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
