import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaCalendar } from "react-icons/fa";
import heroImage1 from "../assets/guestdiary/img-2.jpg";
import heroImage2 from "../assets/banner/b1.jpeg";
import heroImage3 from "../assets/guestdiary/img-1.jpeg";
import heroImage4 from "../assets/banner/b4.jpeg";
import heroImage5 from "../assets/banner/b3.jpeg";
import BookingBar from "./BookingBar";
import React from "react";

const images = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage5];
const locations = ["Dhanolti", "Goa", "Tehri", "Majuli", "Rishikesh"];

const HomeHero = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
  });
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const guestDropdownRef = useRef(null);

  const toggleGuestDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeGuestDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleGuestChange = (type, delta) => {
    setSearchParams((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta), // Prevents negative values
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        guestDropdownRef.current &&
        !guestDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    // Store search parameters in sessionStorage
    sessionStorage.setItem("searchParams", JSON.stringify(searchParams));

    navigate("/properties"); // Navigate without URL parameters
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="relative h-[400px]  sm:h-[770px] sm:min-h-screen flex flex-col justify-between items-center overflow-hidden  md:pt-32  sm:pb-[106px]">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0 h-full md:h-full ">
        {images?.map((img, index) => (
          <motion.img
            key={index}
            src={img}
            alt={`Background ${index + 1}`}
            className={`absolute inset-0 w-full h-full  object-cover transition-opacity duration-1000  ${
              index === currentImageIndex
                ? " bg-black  opacity-70"
                : "opacity-0"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 1.5 }}
          />
        ))}
        <div className="absolute inset-0  bg-black bg-opacity-70  "></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10   w-full max-w-6xl mx-auto px-6 flex-1 flex flex-col justify-center">
        {/* Hero Content */}
        <motion.div
          className="text-center space-y-8 mt-20 sm:mt-0  sm:mb-20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight">
            <motion.span
              className="text-[#68E8F9] bg-clip-text "
              animate={{
                backgroundPosition: ["0%", "100%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              INTO THE WILD
            </motion.span>
            <br />
            <span className="drop-shadow-2xl">STAYS</span>
          </h1>
          <p className="text-lg md:text-2xl lg:text-3xl text-white max-w-3xl mx-auto leading-relaxed hidden md:block">
            Embark on a journey of discovery with our curated travel
            experiences. Find your perfect escape, where every destination tells
            a story.
          </p>
        </motion.div>
        <BookingBar onSearch={() => navigate("/properties")} />
      </div>
    </div>
  );
};

export default HomeHero;
