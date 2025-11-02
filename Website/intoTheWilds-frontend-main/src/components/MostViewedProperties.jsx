import { useState } from "react";
import { motion } from "framer-motion";
import { MdOutlineBedroomParent, MdExplore } from "react-icons/md";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoPeople } from "react-icons/io5";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { BASE_URL } from "../utils/baseurl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const MostViewedProperties = () => {
  const [selectedLocation, setSelectedLocation] = useState("All");
  const locations = ["All", "Dhanolti", "Tehri", "Assam", "Goa"];
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/properties`
        );
        setProperties(response.data.properties);
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties =
    selectedLocation === "All"
      ? properties
      : properties?.filter(
        (property) => property?.location === selectedLocation
      );

  const ShimmerCard = () => (
    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg animate-pulse rounded-2xl overflow-hidden">
      <div className="h-48 sm:h-56 md:h-64 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded-full w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded-full w-2/3 mb-3"></div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="h-8 bg-gray-200 rounded-xl"></div>
          <div className="h-8 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <section className="py-12 px-4 lg:px-8 bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-cyan-800 to-emerald-800 bg-clip-text text-transparent">
            Explore
          </span>{" "}
          Properties
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {locations?.map((location) => (
            <motion.button
              key={location}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-5 py-2 rounded-full font-medium transition-all text-sm
                ${selectedLocation === location
                  ? "bg-[#0F2642] text-white shadow-lg"
                  : "bg-white/80 hover:bg-[#0F2642] hover:text-white"
                }
              `}
              onClick={() => setSelectedLocation(location)}
            >
              {location}
            </motion.button>
          ))}
        </div>

        {/* <div className=" backdrop-blur-sm rounded-xl p-4"> */}
        <div className="relative">
          <div className="relative px-10">
            {" "}
            {/* Added horizontal padding */}
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next",
              }}
              // pagination={{ clickable: true }}
              autoplay={{ delay: 5000 }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="py-8"
            >
              {loading
                ? [...Array(4)]?.map((_, index) => (
                  <SwiperSlide key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                    >
                      <ShimmerCard />
                    </motion.div>
                  </SwiperSlide>
                ))
                : filteredProperties?.map((property, index) => (
                  <SwiperSlide key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      className="group h-full"
                    >
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 h-full">
                        <div className="relative h-48 sm:h-56 md:h-64">
                          <img
                            src={property?.images[0]}
                            alt={property?.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-bold">
                                {property?.rating}
                              </span>
                              <span className="text-gray-600">
                                ({property?.reviews})
                              </span>
                            </div>
                          </div>

                          <div className="absolute bottom-3 left-3">
                            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
                              <FaMapMarkerAlt className="text-[#0F2642]" />
                              <span className="font-medium">
                                {property?.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <h2 className="text-lg font-bold mb-2 text-gray-800 line-clamp-1">
                            {property?.name}
                          </h2>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {property?.description}
                          </p>

                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg text-sm">
                              <MdOutlineBedroomParent className="text-lg text-[#0F2642]" />
                              <span className="font-medium">
                                {property?.bedroom} Bed
                                {property?.bedroom > 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg text-sm">
                              <IoPeople className="text-lg text-[#0F2642]" />
                              <span className="font-medium">
                                {property?.guest} Guest
                                {property?.guest > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                            <div className="text-center bg-gray-50 p-2 rounded-lg">
                              <span className="text-xl font-bold text-[#0F2642]">
                                ₹{property?.price}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                /night
                              </span>
                            </div>
                            <Link
                              to={`/property/${property?._id}`}
                              onClick={() => window.scrollTo(0, 0)}
                              className="w-full py-2 bg-[#0F2642] text-white text-sm rounded-lg hover:bg-[#0F2642]/90 transition-colors duration-300 flex items-center justify-center gap-1.5"
                            >
                              <MdExplore />
                              Explore More
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
            </Swiper>
            <button style={{height:"5px", width:"5px"}} className="swiper-button-prev absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full shadow-lg hover:bg-white transition-all">
              <FaChevronLeft className="text-[#0F2642] text-sm"   />
            </button>
            <button style={{height:"5px", width:"5px"}} className="swiper-button-next absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full shadow-lg hover:bg-white transition-all">
              <FaChevronRight className="text-[#0F2642] text-sm" />
            </button>

          </div>
        </div>
      </div>
      {/* </div> */}
    </section>
  );
};

export default MostViewedProperties;
