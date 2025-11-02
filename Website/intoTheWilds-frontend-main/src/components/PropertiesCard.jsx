import { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  MdOutlineBedroomParent,
  MdExplore,
} from "react-icons/md";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoPeople } from "react-icons/io5";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { BASE_URL } from "../utils/baseurl";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PropertiesCard = ({ selectedLocation = "All" }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/properties`);
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
      : properties.filter((property) => property.location === selectedLocation);

  const ShimmerCard = () => (
    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg animate-pulse rounded-2xl overflow-hidden">
      <div className="h-64 sm:h-72 md:h-80 bg-gray-200"></div>
      <div className="p-4 sm:p-6">
        <div className="h-6 bg-gray-200 rounded-full w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded-full w-full mb-3"></div>
        <div className="h-3 bg-gray-200 rounded-full w-2/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-10 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4">
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 2,
              },
            }}
            className="py-8"
          >
            {loading ? (
              [...Array(4)].map((_, index) => (
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
            ) : (
              filteredProperties.map((property, index) => (
                <SwiperSlide key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="group h-full"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 h-full">
                      <div className="relative h-64 sm:h-72 md:h-80">
                        <img
                          src={property.images[0]}
                          alt={property.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-bold">{property.rating}</span>
                            <span className="text-gray-600">({property.reviews})</span>
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm">
                            <FaMapMarkerAlt className="text-[#0F2642]" />
                            <span className="font-medium">{property.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">
                          {property.name}
                        </h2>

                        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
                          {property.description}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl text-sm">
                            <MdOutlineBedroomParent className="text-xl text-[#0F2642]" />
                            <span className="font-medium">
                              {property.bedroom} Bedroom{property.bedroom > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl text-sm">
                            <IoPeople className="text-xl text-[#0F2642]" />
                            <span className="font-medium">
                              {property.guest} Guest{property.guest > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                          <div>
                            <span className="text-xl sm:text-2xl font-bold text-[#0F2642]">
                              ₹{property.price}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">/night</span>
                          </div>
                          <Link
                            to={`/property/${property._id}`}
                            onClick={() => window.scrollTo(0, 0)}
                            className="px-4 sm:px-6 py-2.5 bg-[#0F2642] text-white text-sm rounded-full hover:bg-[#0F2642]/90 transition-colors duration-300 flex items-center gap-1.5"
                          >
                            <MdExplore />
                            Explore More
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))
            )}
          </Swiper>

          <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-all">
            <FaChevronLeft className="text-[#0F2642]" />
          </button>
          <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-all">
            <FaChevronRight className="text-[#0F2642]" />
          </button>
        </div>
      </div>
    </div>
  );
};

PropertiesCard.propTypes = {
  selectedLocation: PropTypes.string,
};

export default PropertiesCard;
