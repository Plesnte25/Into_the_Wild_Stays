import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../utils/baseurl";

import MediaGalleryModal from "../components/MediaGalleryModal";
import ImageViewerModal from "../components/ImageViewerModal";

import {
  FaLocationDot,
  FaStar,
  FaWifi,
  FaPersonSwimming,
  FaSquareParking,
  FaPaw,
  FaDoorOpen,
  FaLeaf,
  FaBed,
  FaMapLocationDot,
} from "react-icons/fa6";
import {
  MdOutlineBalcony,
  MdOutlineLocalLaundryService,
  MdOutlineRoomService,
  MdCottage,
  MdOutlineDownloadDone,
} from "react-icons/md";
import { PiBroomBold } from "react-icons/pi";
import { GiTowel } from "react-icons/gi";

/* ---------- Helpers ---------- */
function amenityIcon(label = "") {
  const k = label.toLowerCase();
  if (k.includes("wifi")) return <FaWifi className="text-teal-600" />;
  if (k.includes("add-on"))
    return <MdOutlineDownloadDone className="text-teal-600" />;
  if (k.includes("towel")) return <GiTowel className="text-teal-600" />;
  if (k.includes("location"))
    return <FaMapLocationDot className="text-teal-600" />;
  if (k.includes("pool")) return <FaPersonSwimming className="text-teal-600" />;
  if (k.includes("cottage")) return <MdCottage className="text-teal-600" />;
  if (k.includes("parking"))
    return <FaSquareParking className="text-teal-600" />;
  if (k.includes("pet")) return <FaPaw className="text-teal-600" />;
  if (k.includes("entrance")) return <FaDoorOpen className="text-teal-600" />;
  if (k.includes("balcony"))
    return <MdOutlineBalcony className="text-teal-600" />;
  if (k.includes("garden")) return <FaLeaf className="text-teal-600" />;
  if (k.includes("linen") || k.includes("bed"))
    return <FaBed className="text-teal-600" />;
  if (k.includes("laundry"))
    return <MdOutlineLocalLaundryService className="text-teal-600" />;
  if (k.includes("service") || k.includes("housekeep"))
    return <PiBroomBold className="text-teal-600" />;
  if (k.includes("chef"))
    return <MdOutlineRoomService className="text-teal-600" />;
  return <span className="h-2 w-2 rounded-full bg-teal-600 inline-block" />;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/* ---------- Page ---------- */
export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prop, setProp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Form
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [reviews, setReviews] = useState([]);

  /* Fetch property */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/properties/${id}`);
        const j = await r.json();
        if (!alive) return;
        setProp(j.property || j);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [id]);

  /* Fetch reviews (latest 15) */
  useEffect(() => {
    if (!prop?._id) return;
    let alive = true;
    (async () => {
      try {
        const r = await fetch(
          `${BASE_URL}/reviews?property=${prop._id}&limit=15&sort=-createdAt`
        );
        const j = await r.json();
        if (alive) setReviews(j.reviews || j || []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => (alive = false);
  }, [prop?._id]);

  const images = useMemo(() => prop?.images || [], [prop]);

  const openViewerAt = (i) => {
    setViewerIndex(i);
    setViewerOpen(true);
  };

  /* Nights and rooms calc (2 adults + 1 child per room) */
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return clamp((end - start) / (1000 * 60 * 60 * 24), 0, 365);
  }, [checkIn, checkOut]);

  const roomsNeeded = useMemo(() => {
    const a = Number(adults) || 0;
    const c = Number(children) || 0;
    const base = Math.ceil(a / 2); // 2 adults per room
    const extraChildRooms = Math.max(0, c - base); // 1 child per room; extra children add rooms
    return Math.max(1, base + extraChildRooms);
  }, [adults, children]);

  const totalAmount = useMemo(() => {
    const price = prop?.price || 0;
    return price * roomsNeeded * nights;
  }, [prop?.price, roomsNeeded, nights]);

  /* Loading / 404 */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[50vh] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-slate-300 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!prop) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        Property not found.
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Header gallery (never exceeds container) ===== */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main image */}
          <button
            type="button"
            onClick={() => openViewerAt(0)}
            className="col-span-2 w-full rounded-xl overflow-hidden"
            aria-label="Open main image"
          >
            <div className="aspect-square w-full">
              {images[0] && (
                <img
                  src={images[0]}
                  alt={prop.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </button>

          {/* Side thumbs */}
          <div className="hidden md:flex md:flex-col gap-4">
            <button
              type="button"
              onClick={() => openViewerAt(1)}
              className="w-full rounded-xl overflow-hidden"
              aria-label="Open image 2"
            >
              <div className="aspect-square">
                {images[1] && (
                  <img
                    src={images[1]}
                    alt="thumb-1"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="relative w-full rounded-xl overflow-hidden"
              aria-label="Open gallery grid"
            >
              <div className="aspect-square">
                {images[2] && (
                  <img
                    src={images[2]}
                    alt="thumb-2"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {!!images.length && (
                <span className="absolute bottom-8 right-8 bg-black/50 text-white text-lg px-3 py-1 rounded-xl">
                  +{images.length} Photos
                </span>
              )}
            </button>
          </div>

          {/* Mobile '+xx photos' badge over main image */}
          {!!images.length && (
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="relative bottom-10 right-8 md:hidden -mt-10 justify-self-end bg-black/70 text-white text-md px-3 py-1 rounded-full"
            >
              +{images.length} Photos
            </button>
          )}
        </div>

        {/* Title + meta */}
        <div className="mt-6">
          <h1 className="text-3xl lg:text-4xl font-extrabold">{prop.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              <FaLocationDot className="text-teal-600" /> {prop.location}
            </span>
            {typeof prop.rating === "number" && (
              <span className="inline-flex items-center gap-1">
                <FaStar className="text-amber-400" /> {prop.rating}{" "}
                {prop.reviews ? `(${prop.reviews})` : ""}
              </span>
            )}
            {prop.cottage && <span>🏡 Cottage</span>}
          </div>
        </div>

        {/* ===== Body: content (8) + sidebar (4) ===== */}
        <div className="mt-8 grid grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            {/* Description */}
            <Description text={prop.description} />

            {/* Amenities */}
            {Array.isArray(prop.amenities) && prop.amenities.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">
                  Amenities &amp; Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {prop.amenities.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 border border-slate-200 rounded-lg p-3"
                    >
                      {amenityIcon(a)}
                      <span className="text-slate-700">{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs */}
            {Array.isArray(prop.faqs) && prop.faqs.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-3">FAQs</h2>
                <FAQAccordion items={prop.faqs} />
              </section>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <section>
                {/* Review average header */}
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-semibold">What Guests Say</h2>

                  {/* Average rating summary */}
                  {(() => {
                    const avgRating =
                      reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                      reviews.length;
                    return (
                      <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-slate-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full shadow-sm">
                        <FaStar className="text-amber-400 text-lg" />
                        <span className="text-lg font-semibold text-slate-800">
                          {avgRating.toFixed(1)}
                        </span>
                        <span className="text-slate-600">
                          ★ from {reviews.length} reviews
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <ReviewsMarquee items={reviews} />
              </section>
            )}

            {/* Policies (side by side) */}
            {(prop.bookingPolicies?.length ||
              prop.cancellationPolicy?.length) && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-justify">
                {prop.bookingPolicies?.length ? (
                  <Card title="Booking Policies">
                    <ul className="list-disc list-outside space-y-3 text-slate-700 text-[0.85rem] leading-6">
                      {prop.bookingPolicies.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </Card>
                ) : (
                  <div />
                )}

                {prop.cancellationPolicy?.length ? (
                  <Card title="Cancellation Policy">
                    <ul className="list-disc list-outside space-y-3 text-slate-700 text-[0.85rem] leading-6">
                      {prop.cancellationPolicy.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </Card>
                ) : (
                  <div />
                )}
              </section>
            )}
          </div>

          {/* RIGHT side */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 p-6 shadow-md lg:top-24 bg-white overflow-hidden">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-extrabold">
                    ₹{(prop.price || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">/ night</div>
                </div>
                {nights > 0 && (
                  <div className="text-right text-sm text-slate-600">
                    <div>
                      Nights: <b>{nights}</b>
                    </div>
                    <div>
                      Rooms: <b>{roomsNeeded}</b>
                    </div>
                    <div>
                      Total: <b>₹{(totalAmount || 0).toLocaleString()}</b>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:items-start sm:justify-between min-w-0">
                <div className="flex-1 min-w-0">
                  <Labeled label="Check In">
                    <DatePicker
                      selected={checkIn}
                      onChange={setCheckIn}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      placeholderText="Select date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </Labeled>
                </div>
                <div className="flex-1 min-w-0">
                  <Labeled label="Check Out">
                    <DatePicker
                      selected={checkOut}
                      onChange={setCheckOut}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={checkIn || new Date()}
                      placeholderText="Select date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </Labeled>
                </div>
              </div>

              {/* Guests */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
                  <span className="font-medium">Guests</span>
                  <span className="text-teal-700 font-semibold">
                    {adults} Adult{adults > 1 ? "s" : ""}
                    {children > 0
                      ? ` & ${children} Child${children > 1 ? "ren" : ""}`
                      : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <GuestCounter
                    label="Adults (12+)"
                    value={adults}
                    min={1}
                    onChange={setAdults}
                  />
                  <GuestCounter
                    label="Children (0–11)"
                    value={children}
                    min={0}
                    onChange={setChildren}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Input
                  label="Full Name *"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your full name"
                  required
                />
                <Input
                  label="Email *"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder="Enter your email"
                  required
                />
                <Input
                  label="Phone *"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Enter your phone number"
                  required
                />
                <TextArea
                  label="Special Requests (Optional)"
                  value={note}
                  onChange={setNote}
                  placeholder="Any requests..."
                />
              </div>

              <button
                className="mt-5 w-full rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white py-3 font-semibold disabled:opacity-60 cursor-pointer"
                disabled={
                  !checkIn ||
                  !checkOut ||
                  !name ||
                  !email ||
                  !phone ||
                  nights <= 0
                }
                onClick={() => {
                  const bookingLoad = {
                    property: {
                      _id: prop._id,
                      name: prop.name,
                      price: prop.price,
                      images: prop.images,
                      location: prop.location,
                    },
                    checkin: checkIn ? checkIn.toISOString() : null,
                    checkout: checkOut ? checkOut.toISOString() : null,
                    adults,
                    children,
                    name: name,
                    email,
                    phone,
                    specialRequests: note,
                  };

                  sessionStorage.setItem(
                    "itw_booking",
                    JSON.stringify(bookingLoad)
                  );
                  navigate("/checkout", { state: { booking: bookingLoad } });
                }}
              >
                Proceed to Checkout
              </button>
            </div>

            {/* Map */}
            <Card title="Location">
              <p className="text-sm text-slate-600 mb-3">{prop.address}</p>
              <iframe
                className="w-full h-64 rounded-lg border-0"
                src={
                  prop.locationLink
                    ? prop.locationLink
                    : `https://www.google.com/maps?q=${encodeURIComponent(
                        prop.address || prop.name
                      )}&output=embed`
                }
                loading="lazy"
                allowFullScreen
                title="Google Map"
              />
            </Card>
          </aside>
        </div>
      </div>

      {/* Modals (full-screen overlay; do not affect layout width) */}
      {galleryOpen && (
        <MediaGalleryModal
          images={images}
          onClose={() => setGalleryOpen(false)}
          onPick={(i) => {
            setGalleryOpen(false);
            setViewerIndex(i);
            setViewerOpen(true);
          }}
        />
      )}
      {viewerOpen && (
        <ImageViewerModal
          images={images}
          startIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------- UI bits ---------- */
function Description({ text = "" }) {
  const [open, setOpen] = useState(false);
  const limit = 260;
  if (!text) return null;
  const tooLong = text.length > limit;
  return (
    <section>
      <p className="text-slate-700 leading-7 text-justify">
        {open || !tooLong ? text : `${text.slice(0, limit)}...`}
      </p>
      {tooLong && (
        <button
          className="mt-2 text-teal-600 font-semibold text-left"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl p-5 bg-white mb-10">
      {title && <h3 className="text-xl font-semibold mb-3">{title}</h3>}
      {children}
    </div>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full border rounded-lg px-3 py-2"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full border rounded-lg px-3 py-2"
      />
    </label>
  );
}

function GuestCounter({ label, value, onChange, min = 0 }) {
  const dec = () => onChange(Math.max(min, (Number(value) || 0) - 1));
  const inc = () => onChange((Number(value) || 0) + 1);

  return (
    <div>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div className="flex items-center border rounded-lg overflow-hidden">
        <button
          type="button"
          aria-label={`decrease ${label}`}
          onClick={dec}
          className="w-10 h-10 grid place-items-center text-lg select-none hover:bg-slate-50"
        >
          −
        </button>
        <div className="px-4 min-w-[3ch] text-center">{value}</div>
        <button
          type="button"
          aria-label={`increase ${label}`}
          onClick={inc}
          className="w-10 h-10 grid place-items-center text-lg select-none hover:bg-slate-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

function FAQAccordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="divide-y bg-white">
      {items.map((qa, i) => (
        <details
          key={i}
          open={open === i}
          onClick={(e) => {
            e.preventDefault();
            setOpen(open === i ? null : i);
          }}
          className="group"
        >
          <summary className="cursor-pointer list-none py-4 flex items-center justify-between">
            <span className="font-medium">{qa.question}</span>
            <span className="text-slate-400 group-open:rotate-180 transition-transform">
              ⌄
            </span>
          </summary>
          <div className="px-2 pb-5 -mt-2 text-slate-700">{qa.answer}</div>
        </details>
      ))}
    </div>
  );
}

function ReviewsMarquee({ items }) {
  if (!items?.length) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="flex gap-6 animate-[itwscroll_10s_linear_infinite] p-5">
        {[...items, ...items].map((r, i) => (
          <div
            key={i}
            className="min-w-[300px] max-w-[320px] bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 p-4 shadow-md flex flex-col justify-between"
          >
            {/* User header */}
            <div className="flex items-center gap-3 mb-2">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  r.user?.name || "Guest"
                )}&background=0D9488&color=fff`}
                alt="user"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">
                  {r.user?.name || "Anonymous"}
                </h4>
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  {Array.from({ length: 5 }, (_, idx) => (
                    <FaStar
                      key={idx}
                      className={
                        idx + 1 <= Math.floor(r.rating)
                          ? "fill-amber-400"
                          : idx + 0.5 <= r.rating
                          ? "fill-amber-400 opacity-70"
                          : "fill-slate-300"
                      }
                    />
                  ))}
                  <span className="ml-1 text-slate-600">
                    {r.rating?.toFixed?.(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            <p className="text-slate-700 text-sm italic leading-6">
              “{r.comment || r.text}”
            </p>

            {/* Timestamp */}
            <div className="mt-3 text-xs text-right text-slate-500">
              {r.createdAt
                ? (() => {
                    try {
                      return new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });
                    } catch (e) {
                      return "";
                    }
                  })()
                : ""}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes itwscroll {
          0% { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
      `}</style>
    </div>
  );
}
