import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaBed,
  FaUsers,
  FaStar,
} from "react-icons/fa";
import { BASE_URL } from "../utils/baseurl";
import TourBanner from "@/components/TourBanner";
import BookingBar from "@/components/BookingBar";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const LOCATIONS = ["Dhanolti", "Goa", "Majuli", "Rishikesh", "Tehri"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/properties`);
        setProperties(res.data.properties);
        setFiltered(res.data.properties);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilter = (loc) => {
    setActiveLocation(loc);
    if (!loc) return setFiltered(properties);
    setFiltered(properties.filter((p) => p.location === loc));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100">
      {/* Hero Section with Booking Bar */}
      <div className="relative h-[56vh] md:h-[64vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-transparent" />

        <div className="relative z-10 max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-10 h-full flex flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-3"
          >
            Find Your Next <span className="text-cyan-400">Perfect Stay</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-gray-200 text-base md:text-lg max-w-2xl"
          >
            Explore our handpicked selection of unique stays in breathtaking
            locations.
          </motion.p>

          {/* Booking Bar */}
          <BookingBar onSearch={() => navigate("/properties")} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[95rem] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-12 flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Location Filter */}
        <aside className="relative lg:w-[18rem] w-full lg:w-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="sticky top-28 bg-white/90 backdrop-blur-lg border border-gray-200 shadow-lg rounded-2xl p-5 lg:p-6"
          >
            <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2 mb-4">
              <FaMapMarkerAlt className="text-cyan-600" /> Location
            </h3>
            <ul className="flex flex-col gap-3">
              {LOCATIONS.map((loc) => (
                <li key={loc}>
                  <button
                    onClick={() => handleFilter(loc)}
                    className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      activeLocation === loc
                        ? "bg-cyan-600 text-white shadow"
                        : "bg-gray-100 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                    }`}
                  >
                    {loc}
                  </button>
                </li>
              ))}
              <button
                onClick={() => handleFilter(null)}
                className="mt-4 w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-cyan-600 transition"
              >
                Clear Filter
              </button>
            </ul>
          </motion.div>
        </aside>

        {/* Property Cards */}
        <motion.div
          className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow animate-pulse h-[28rem]"
                />
              ))
            : filtered.map((property, i) => (
                <Link
                  key={property._id || i}
                  to={`/properties/${property._id}`}
                  className="block"
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
                      <img
                        src={property.images?.[0]}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow flex items-center gap-1 text-sm font-medium">
                        <FaStar className="text-yellow-400" />
                        {property.rating}{" "}
                        <span className="text-gray-500 text-xs">
                          ({property.reviews})
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col min-h-[14rem]">
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1 group-hover:text-cyan-700 transition-colors">
                          {property.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {property.description.length > 120
                            ? property.description.substring(0, 120) + "..."
                            : property.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-flex items-center bg-cyan-50 text-cyan-700 px-3 py-1 rounded-md text-xs font-medium">
                            <FaMapMarkerAlt className="mr-1 text-cyan-500" />
                            {property.location}
                          </span>
                          <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-medium">
                            <FaBed className="mr-1 text-blue-500" />
                            {property.bedroom} Rooms
                          </span>
                          <span className="inline-flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-xs font-medium">
                            <FaUsers className="mr-1 text-purple-500" />
                            {property.guest} Guests
                          </span>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-gray-800">
                            ₹{property.price}
                          </p>
                          <p className="text-xs text-gray-500">
                            per night / cottage
                          </p>
                        </div>
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-[#0F2642] text-white hover:bg-[#163257] transition">
                          View Details
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
        </motion.div>
      </div>
      <TourBanner />
    </div>
  );
};

export default Properties;
