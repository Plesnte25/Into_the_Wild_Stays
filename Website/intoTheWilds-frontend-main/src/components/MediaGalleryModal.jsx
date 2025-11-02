import React, { useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";

export default function MediaGalleryModal({
  images = [],
  onClose,
  onPick,                // (index) => void
  panelClass = "max-w-6xl w-[92vw]",
}) {
  const overlayRef = useRef(null);

  // lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      <div className={`relative bg-white rounded-2xl shadow-2xl ${panelClass}`}>
        {/* compact close */}
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex items-center justify-center
                     rounded-md p-1.5 text-slate-600 hover:text-black hover:bg-slate-100"
        >
          <IoMdClose className="text-2xl" />
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <div className="text-sm text-slate-600">{images.length} Photos</div>
        </div>

        {/* Grid */}
        <div className="p-5 pt-2 max-h-[75vh] overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPick?.(i)}
                className="aspect-[16/11] w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <img
                  src={src}
                  alt={`photo-${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
