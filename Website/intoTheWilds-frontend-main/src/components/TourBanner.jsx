import { FaWhatsapp } from "react-icons/fa";

const TourBanner = () => {
  return (
    <section className="mt-16 mb-10">
      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-cyan-50 via-blue-50 to-emerald-50 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {[
              "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&q=80&w=800",
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800",
            ].map((src, i) => (
              <div
                key={i}
                className="relative h-32 sm:h-40 md:h-56 overflow-hidden group"
              >
                <img
                  src={src}
                  alt={`highlight-${i}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>

          <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                Ready for your next getaway?
              </h3>
              <p className="text-gray-600 mt-1">
                Browse our curated stays or message us for personalized
                recommendations.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://wa.me/9761966485"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow inline-flex items-center gap-2"
              >
                <FaWhatsapp className="text-xl" />
                Chat on WhatsApp
              </a>
              <a
                href="/properties"
                className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow"
              >
                Explore All Properties
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourBanner;
