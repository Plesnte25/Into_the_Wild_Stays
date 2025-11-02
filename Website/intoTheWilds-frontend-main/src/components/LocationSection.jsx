// LocationSection.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaGlobe, FaCompass } from "react-icons/fa";

/**
 * NOTE:
 *  - Replace these image URLs with your own assets later.
 *  - Kept names exactly as in your UI: Dhanolti, Goa, Tehri, Majuli
 */
const LOCATIONS = [
  {
    name: "Dhanolti",
    img: "https://images.unsplash.com/photo-1675246394260-4b311cb3862d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1031",
    description: "Serene Himalayan retreat with cedar forests and quiet trails.",
    elevation: "2,200 m",
    temperature: "15°C",
  },
  {
    name: "Goa",
    img: "https://plus.unsplash.com/premium_photo-1697729701846-e34563b06d47?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    description: "Vibrant coastline, golden beaches and laid-back cafés.",
    elevation: "Sea level",
    temperature: "28°C",
  },
  {
    name: "Tehri",
    img: "https://images.unsplash.com/photo-1596599623428-87dbae5e7816?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VGVocml8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=500",
    description: "Lakeside vistas, paragliding & sweeping mountain views.",
    elevation: "1,600 m",
    temperature: "20°C",
  },
  {
    name: "Majuli",
    img: "https://images.unsplash.com/photo-1735566993787-20572d53001b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=990",
    description: "World’s largest river island—culture, satras and sunsets.",
    elevation: "90 m",
    temperature: "25°C",
  },
];

const LocationSection = () => {
  const navigate = useNavigate();
  const items = useMemo(() => LOCATIONS, []);

  const goToLocation = (name) => {
    // Route to properties page with location filter as query param
    navigate(`/properties?location=${encodeURIComponent(name)}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100 py-16 sm:py-20 md:py-24">
      <div className="absolute inset-0 pointer-events-none backdrop-blur-[2px] bg-white/15" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-900 to-cyan-900 bg-clip-text text-transparent">
              Explore
            </span>{" "}
            <span className="text-gray-800">Destinations</span>
          </h2>
          <p className="mt-4 text-gray-700 font-medium max-w-2xl mx-auto">
            Discover extraordinary places that promise unforgettable experiences
            and breathtaking landscapes.
          </p>
        </motion.div>

        {/* Circles */}
        <div className="grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-4 place-items-center">
          {items.map((loc, i) => (
            <motion.button
              key={loc.name}
              type="button"
              onClick={() => goToLocation(loc.name)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goToLocation(loc.name)}
              title={`See properties in ${loc.name}`}
              aria-label={`See properties in ${loc.name}`}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ scale: 1.04, rotate: -0.5 }}
              whileTap={{ scale: 0.98 }}
              className="relative group w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden outline-none ring-0 focus:ring-4 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-white"
              style={{ clipPath: "circle(50% at 50% 50%)" }}
            >
              {/* Image */}
              <img
                src={loc.img}
                alt={loc.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* dark gradient for baseline legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Static label */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-white/90 text-gray-900 font-extrabold text-lg shadow">
                  {loc.name}
                </span>
              </div>

              {/* Hover glass card (slides up) */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/70 p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{loc.name}</h3>
                  <FaMapMarkerAlt className="text-cyan-700" />
                </div>
                <p className="mt-1 text-sm text-gray-700 leading-snug">{loc.description}</p>
                <div className="mt-3 flex items-center justify-between text-gray-800 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <FaGlobe className="text-emerald-700" />
                    {loc.elevation}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <FaCompass className="text-cyan-700" />
                    {loc.temperature}
                  </span>
                </div>
                <div className="mt-3 text-right">
                  <span className="inline-block text-cyan-700 font-semibold">
                    View properties →
                  </span>
                </div>
              </motion.div>

              {/* subtle ring on hover */}
              <div className="absolute inset-0 rounded-full ring-0 group-hover:ring-4 ring-white/70 transition-all duration-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
