import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function ImageViewerModal({
  images = [],
  startIndex = 0,
  onClose,
  panelClass = "max-w-6xl w-[92vw]",
}) {
  const [index, setIndex] = useState(
    Math.min(Math.max(startIndex || 0, 0), Math.max(images.length - 1, 0))
  );
  const overlayRef = useRef(null);
  const startXRef = useRef(null);

  const has = images && images.length > 0;
  const current = useMemo(() => (has ? images[index] : ""), [has, images, index]);

  // lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  // close on overlay
  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  // keys
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []); // eslint-disable-line

  // swipe
  const onTouchStart = (e) => (startXRef.current = e.touches?.[0]?.clientX ?? null);
  const onTouchEnd = (e) => {
    if (startXRef.current == null) return;
    const delta =
      (e.changedTouches?.[0]?.clientX ?? startXRef.current) - startXRef.current;
    if (Math.abs(delta) > 40) (delta > 0 ? prev : next)();
    startXRef.current = null;
  };

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  if (!has) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={onOverlayClick}
      className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      <div className={`relative bg-white rounded-2xl shadow-2xl ${panelClass}`}>
        {/* compact close + counter */}
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="text-slate-600 text-sm">
            {index + 1} / {images.length}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md p-1.5
                       text-slate-600 hover:text-black hover:bg-slate-100"
          >
            <IoMdClose className="text-2xl" />
          </button>
        </div>

        {/* image area */}
        <div
          className="relative p-5 pt-2 select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative mx-auto max-h-[75vh]">
            {/* arrows */}
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10
                         p-2 rounded-full text-slate-700 hover:text-black"
            >
              <IoIosArrowBack className="text-4xl" />
            </button>

            <img
              src={current}
              alt={`image-${index + 1}`}
              className="block max-h-[75vh] w-full rounded-xl object-contain bg-slate-50"
              loading="eager"
            />

            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                         p-2 rounded-full text-slate-700 hover:text-black"
            >
              <IoIosArrowForward className="text-4xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
