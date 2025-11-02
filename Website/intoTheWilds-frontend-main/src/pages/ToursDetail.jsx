import { useParams } from "react-router-dom";
import { MapPin, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import toursData from "../data/tours.json";
import { useEffect, useState } from "react";
import validator from "validator";
import ContactForm from "../components/ContactForm";
import { Swiper, SwiperSlide } from "swiper/react";
import Modal from "react-modal"; // Import a library for the modal functionality
import Navbar from "../components/Navbar";
Modal.setAppElement("#root"); // Required for accessibility with React Modal
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "../index.css";
// import required modules
import { EffectFade, Navigation, Pagination, Autoplay } from "swiper/modules";
import { BASE_URL } from "../utils/baseurl";
import axios from "axios";
import { toast } from "react-toastify";

const ToursDetail = () => {
  const { id } = useParams();
  const tour = toursData.tours.find((t) => t.id === parseInt(id));
  const [showContactForm, setShowContactForm] = useState(false);

  const [expandedDay, setExpandedDay] = useState(null);

  const toggleAccordion = (dayKey) => {
    setExpandedDay(expandedDay === dayKey ? null : dayKey);
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [showForm, setShowForm] = useState(false);
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Check if the current screen width is less than 768px (mobile devices)
      if (window.innerWidth < 768) {
        setIsSmallDevice(true); // Set true for small devices
        console.log("Small device detected");
      } else {
        setIsSmallDevice(false); // Set false for larger devices
        console.log("Not a small device");
      }
    };

    // Run the check on component mount and on window resize
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY; // Current scroll position
      const windowHeight = window.innerHeight; // Height of the viewport
      const windowWidth = window.innerWidth; // Width of the viewport

      // Define scroll thresholds for different devices
      if (windowWidth >= 1025) {
        // For laptops and larger screens
        if (scrollPosition > 900 && scrollPosition < 1900) {
          setShowForm(true);
          console.log("Form is visible on laptops/desktops");
        } else {
          setShowForm(false);
          console.log("Form is hidden on laptops/desktops");
        }
      } else if (windowWidth >= 768 && windowWidth <= 1024) {
        // For tablets or medium-sized devices
        if (scrollPosition > 2000 && scrollPosition < 2700) {
          setShowForm(true);
          console.log("Form is visible on tablets/medium devices");
        } else {
          setShowForm(false);
          console.log("Form is hidden on tablets/medium devices");
        }
      } else {
        // For smaller devices, hide form by default
        setShowForm(false);
        //SetisSmallDevice(true);
        console.log("Form is hidden on mobile devices");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageSet, setImageSet] = useState([]); // To store the current set of images being viewed

  const openModal = (images, index) => {
    setImageSet(images); // Set the current array of images (combined days or specific day)
    setSelectedImage(images[index]);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageSet.length);
    setSelectedImage(imageSet[(currentIndex + 1) % imageSet.length]);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + imageSet.length) % imageSet.length
    );
    setSelectedImage(
      imageSet[(currentIndex - 1 + imageSet.length) % imageSet.length]
    );
  };
  const [reviews, setReviews] = useState([
    {
      name: "Vaibhav Shinde",
      date: "02/27/2024",
      title: "Wonderful Stay and Hospitality",
      stars: 4,
      sleep: 5,
      location: 4.5,
      service: 5,
      clean: 5,
      rooms: 5,
      content:
        "The entire experience was amazing! The staff was very friendly, and the service exceeded our expectations. Highly recommended!",
      likes: 3,
    },
    {
      name: "Shaikh Aamir",
      date: "02/27/2024",
      title: "Great Hotel with Excellent Service",
      stars: 4,
      sleep: 5,
      location: 4.5,
      service: 5,
      clean: 5,
      rooms: 5,
      content:
        "I loved my stay here. The rooms were clean, and the location was perfect for our needs. Would definitely visit again.",
      likes: 0,
    },
    {
      name: "Roshan Tambe",
      date: "09/12/2024",
      title: "Amazing Experience!",
      stars: 5,
      sleep: 5,
      location: 5,
      service: 5,
      clean: 4.5,
      rooms: 4,
      content:
        "The hotel offered everything we could have asked for. The food was great, and the service was exceptional.",
      likes: 0,
    },
  ]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    content: "",
    sleep: 0,
    location: 0,
    service: 0,
    clean: 0,
    rooms: 0,
  });
  const [tourFormData, setTourFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "", // This will be used to store the travel date
    message: "",
  });
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(""); // State to store error message
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      if (!validator.isEmail(value)) {
        setError("Invalid email address");
      } else {
        setError("Valid email");
      }
    }
    setTourFormData({ ...tourFormData, [name]: value });
  };
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dataToSend = {
      ...tourFormData,
      tourName: tour.name,
      // No need to format date since it's already in the correct format
    };

    try {
      const response = await axios.post(`${BASE_URL}/toursQuery`, dataToSend);
      // console.log(response);
      if (response.status === 200) {
        toast.success("Tours query sent successfully");
        setTourFormData({
          name: "",
          email: "",
          phone: "",
          date: "",
          message: "",
        }); // Reset form
      }
    } catch (error) {
      toast.error("Error sending tours query");
    } finally {
      setLoading(false); // Reset loading state after response
    }
  };

  // Handle star rating changes for each category
  const handleStarChange = (category, value) => {
    setFormData({ ...formData, [category]: value });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const overallStars = Math.round(
      (formData.sleep +
        formData.location +
        formData.service +
        formData.clean +
        formData.rooms) /
        5
    );

    const newReview = {
      ...formData,
      stars: overallStars,
      date: new Date().toLocaleDateString(),
      likes: 0,
    };

    setReviews([newReview, ...reviews]);
    setFormData({
      name: "",
      email: "",
      title: "",
      content: "",
      sleep: 0,
      location: 0,
      service: 0,
      clean: 0,
      rooms: 0,
    });
  };

  // Handle like button click
  let price = parseInt(tour.price) + 7999;
  // Calculate overall rating
  const overallRating =
    reviews.reduce((acc, review) => acc + review.stars, 1) / reviews.length ||
    0;

  const [likedReviews, setLikedReviews] = useState([]);

  // Function to handle like button click
  const handleLike = (index) => {
    // Prevent liking the same review more than once
    if (likedReviews.includes(index)) return;

    // Update the likes count in the reviews array
    reviews[index].likes += 1;

    // Add the index of the liked review to the state
    setLikedReviews((prev) => [...prev, index]);
  };
  if (!tour) {
    return <div>Tour not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50/30">
      {/* Hero Section */}
      <div className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={tour.imageUrl}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2642]/40 via-[#0F2642]/60 to-[#0F2642]/80" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6"
          >
            {tour.name}
          </motion.h1>
          <div className="flex flex-wrap justify-center gap-6 text-gray-200 mb-8">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{tour.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{tour.duration}</span>
            </div>
            <div className="flex items-center text-teal-400 font-semibold">
              Rs. {tour.price} per person
            </div>
          </div>
          <motion.button
            onClick={() => setShowContactForm(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            className="relative group bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 
                     text-white px-10 py-5 rounded-2xl text-lg font-medium
                     shadow-[0_10px_20px_rgba(0,0,0,0.1)] 
                     hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]
                     transition-all duration-500 overflow-hidden
                     border border-white/20 backdrop-blur-sm"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:translate-x-1 transition-transform duration-500">
              Talk to our Experts
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                          translate-x-[-100%] group-hover:translate-x-[100%] 
                          transition-transform duration-1000"
            />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 sm:p-6 w-full lg:w-4/5 mx-auto bg-gray-50 shadow-lg rounded-lg">
        {/* Main Image */}
        <div
          className="relative md:col-span-2 rounded-lg overflow-hidden shadow-md"
          style={{ height: "500px" }}
        >
          <img
            src={tour.firstImage}
            alt={tour.name}
            className="w-full h-full object-cover" // Ensures full height
          />
          <div className="absolute bottom-4 right-2 justify-center bg-black bg-opacity-25 rounded-lg transition-opacity duration-300 hover:bg-opacity-50"></div>
        </div>

        {/* Smaller Images */}
        <div className="grid grid-cols-2 gap-2">
          {tour.images.map((image, index) => (
            <div
              key={index}
              style={{ height: "240px" }}
              className="relative  rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-2 justify-center bg-black bg-opacity-25 transition-opacity duration-300 hover:bg-opacity-50"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Connect to Expert Button */}
      <div
        className="bg-white/80 backdrop-blur-sm py-8"
        id="specific-tag-start"
      >
        {/* <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.button
              onClick={() => setShowContactForm(true)}
              whileHover={{ scale: 1.05 }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Connect to an Expert
            </motion.button>
          </motion.div>
        </div> */}
      </div>

      <div className="space-y-4  lg:ml-24">
        {/* Title Section */}
        <h1 className="text-lg sm:text-xl md:text-2xl md:ml-72 font-bold text-gray-800 mb-4 uppercase text-center md:text-left">
          {(() => {
            const words = tour.name.split(" ");
            const firstLine = words.slice(0, 3).join(" ");
            const secondLine = words.slice(3).join(" ");
            return (
              <>
                <span>{firstLine}</span>
                {secondLine && <br />}
                <span>{secondLine}</span>
              </>
            );
          })()}
        </h1>

        {/* Badge and Itinerary Days */}
        <div className="w-full md:w-3/5 grid grid-cols-3 sm:flex sm:justify-around items-center p-6 bg-white border border-gray-300 rounded-lg gap-4">
          {/* Duration */}
          <div className="text-center">
            <div className="text-blue-500 text-2xl mb-2">🕒</div>
            <p className="text-sm font-bold text-gray-700">Duration</p>
            <p className="text-sm text-gray-500">{tour.duration}</p>
          </div>

          {/* Tour Type */}
          <div className="text-center">
            <div className="text-blue-500 text-2xl mb-2">👣</div>
            <p className="text-sm font-bold text-gray-700">Tour Type</p>
            <p className="text-sm text-gray-500">Specific Tour</p>
          </div>

          {/* Group Size */}
          <div className="text-center">
            <div className="text-blue-500 text-2xl mb-2">👥</div>
            <p className="text-sm font-bold text-gray-700">Group Size</p>
            <p className="text-sm text-gray-500">2 - 20 peoples</p>
          </div>

          {/* Languages */}
        </div>
      </div>

      {/* Languages */}

      {/* Content Section */}
      <div className="lg:max-w-8xl mx-auto py-16 lg:ml-24 ">
        <div className="space-y-16">
          <div className="flex gap-12">
            <div className="p-6 shadow-lg md:w-3/5 lg:w-3/5 border border-gray-200 rounded-lg">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center uppercase">
                Trip Highlights
              </h1>
              {tour.highlights?.map((item, index) => (
                <h2
                  key={index}
                  className="  font-semibold mb-3 pl-4 border-l-4 border-blue-500"
                >
                  {item}
                </h2>
              ))}
            </div>
            {showForm && (
              <div className="relative  lg:flex">
                {/* Other content */}
                <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md lg:ml-10 fixed top-32">
                  {/* Header Section */}
                  <h2 className="text-lg font-semibold text-gray-800">
                    {tour.location}
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-2xl font-bold text-gray-800">
                      INR {tour.price}
                    </span>
                    <span className="line-through text-gray-500 text-sm">
                      INR {price}
                    </span>
                    <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded">
                      SAVE INR 7,999
                    </span>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleQuerySubmit} className="space-y-4 mt-6">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name*"
                        name="name"
                        value={tourFormData.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-800 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email*"
                        name="email"
                        value={tourFormData.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-800 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                      {error && <p>Write a valid email</p>}
                    </div>
                    <div className="flex space-x-2">
                      <select className="w-1/4 border border-gray-800 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500">
                        <option value="+91">+91</option>
                      </select>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d{10}"
                        maxLength={10}
                        name="phone"
                        value={tourFormData.phone}
                        onChange={handleChange}
                        onInput={(e) => {
                          e.target.value = e.target.value.replace(/\D/g, ""); // removes non-digits
                        }}
                        placeholder="Your Phone*"
                        className="w-3/4 border border-gray-800 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                        title="Please enter a valid 10-digit phone number"
                        required
                      />
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="date"
                        name="date" // Change to 'date' to match the state
                        value={tourFormData.date}
                        onChange={handleChange}
                        placeholder="Travel Date*"
                        className="w-full border border-gray-800 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                        min={new Date().toISOString().split("T")[0]} // Set today's date as the minimum
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Message..."
                        name="message"
                        value={tourFormData.message}
                        onChange={handleChange}
                        className="w-full border border-gray-800 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                        rows="3"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full group bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 
                      text-white px-4 py-2 rounded-2xl text-lg font-medium
                      shadow-[0_10px_20px_rgba(0,0,0,0.1)] 
                      hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]
                      transition-all duration-500 overflow-hidden
                      border border-white/20 backdrop-blur-sm"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-3 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                          Sending...
                        </div>
                      ) : (
                        "Send Enquiry"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          <section>
            <div className="space-y-6 mx-2 md:w-3/5 lg:w-3/5">
              <h2 className="text-2xl lg:text-2xl font-bold text-gray-800 mb-4 text-center uppercase">
                Itinerary
              </h2>
              {tour.itinerary?.map((item, index) => (
                <div key={index}>
                  {item.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 mb-4 border border-gray-500"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleAccordion(`${index}-${dayIndex}`)}
                      >
                        <h3 className="text-black font-semibold">
                          <span className="bg-gradient-to-r from-[#05dce3] to-[#05dce3] text-white font-bold px-2 py-1 rounded-md shadow-md mr-2">
                            {day.day.slice(0, 5)}
                          </span>
                          {day.day.slice(5)}
                        </h3>

                        <span
                          className={`transform transition-transform duration-300 ${
                            expandedDay === `${index}-${dayIndex}`
                              ? "rotate-180"
                              : ""
                          }`}
                        >
                          ⌄
                        </span>
                      </div>
                      {expandedDay === `${index}-${dayIndex}` && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <div className="text-sm sm:text-lg leading-relaxed text-gray-800 mb-4 bg-gray-50 p-3 sm:p-4 rounded-lg shadow-inner">
                            {Array.isArray(day.description) ? (
                              <ul className="space-y-2 sm:space-y-3 text-[#0F2642]">
                                {day.description.map((desc, descIndex) => (
                                  <li
                                    key={descIndex}
                                    className="flex items-start text-sm sm:text-base leading-normal"
                                  >
                                    <span className="mr-2 sm:mr-3 flex-shrink-0 text-blue-500">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M8.146 11.854a.5.5 0 0 1-.708-.708L10.293 8 7.438 5.146a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3z"
                                        />
                                      </svg>
                                    </span>
                                    <span>{desc}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm sm:text-base md:text-lg text-[#0F2642] leading-normal">
                                {day.description}
                              </p>
                            )}
                          </div>

                          {/* Horizontal Image Row */}
                          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                            {Object.values(day.images).map(
                              (image, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className="w-40 h-40 sm:w-52 sm:h-52"
                                >
                                  <img
                                    className="w-full h-full object-cover rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
                                    src={image}
                                    alt={`Day ${dayIndex + 1} Image ${
                                      imgIndex + 1
                                    }`}
                                    onLoad={() => {
                                      // Trigger re-render or animation recalculation here if needed
                                    }}
                                    onClick={() =>
                                      openModal(
                                        Object.values(day.images),
                                        imgIndex
                                      )
                                    }
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Popup Modal */}

              <Modal
                isOpen={!!selectedImage}
                onRequestClose={closeModal}
                className="fixed inset-0 flex"
                overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
              >
                {!selectedImage}

                {/* Modal */}
                {selectedImage && (
                  <div className="relative flex items-center justify-center w-full h-full bg-black bg-opacity-90 z-50">
                    {/* Main Close Button */}
                    <button
                      onClick={closeModal}
                      className="absolute   top-40 right-4 text-white text-3xl font-bold hover:text-gray-300 z-50"
                      aria-label="Close"
                    >
                      ✕
                    </button>

                    {/* Modal Content */}
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-full max-h-full object-contain"
                    />

                    {/* Navigation Icons */}
                    <div
                      className="absolute top-1/2 left-6 transform -translate-y-1/2 text-white hover:text-gray-300 cursor-pointer text-6xl z-50"
                      onClick={handlePrev}
                    >
                      ‹
                    </div>
                    <div
                      className="absolute top-1/2 right-6 transform -translate-y-1/2 text-white hover:text-gray-300 cursor-pointer text-6xl z-50"
                      onClick={handleNext}
                    >
                      ›
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          </section>

          <img
            src="https://media1.thrillophilia.com/end_of_trip_desktop.png"
            alt="End of Trip"
            className="w-full h-auto object-cover"
            id="specific-tag"
          />

          {/* Inclusions & Exclusions */}
          <div className="grid md:grid-cols-2 gap-12 mx-2">
            {/* Inclusions Section */}
            <section>
              <h2 className="text-3xl font-bold text-[#0F2642] mb-8">
                Inclusions
              </h2>
              <div className="space-y-4">
                {tour.inclusions?.map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    key={index}
                    className="flex items-center space-x-3 bg-teal-50 p-4 rounded-xl border border-teal-200"
                  >
                    {/* Check Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-teal-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-lg text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Exclusions Section */}
            <section>
              <h2 className="text-3xl font-bold text-[#0F2642] mb-8">
                Exclusions
              </h2>
              <div className="space-y-4">
                {tour.exclusions?.map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    key={index}
                    className="flex items-center space-x-3 bg-red-50 p-4 rounded-xl border border-red-200"
                  >
                    {/* Cross Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span className="text-lg text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Connect to Expert Button */}
          {/* <section className="text-center">
            <motion.button
              onClick={() => setShowContactForm(true)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Connect to an Expert
            </motion.button>
          </section> */}

          {/* Contact Methods */}

          <section className="mx-2">
            <h2 className="text-3xl font-bold text-[#0F2642] mb-8">
              Contact Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href={`tel:${tour.contact_methods?.phone}`}
                className="flex items-center space-x-4 bg-blue-50/80 backdrop-blur-sm p-6 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Phone className="w-6 h-6 text-blue-600" />
                <span className="text-lg text-gray-700">
                  {tour.contact_methods?.phone
                    .replace(/-/g, "")
                    .replace(/(\+\d{2})(\d{5})(\d{5})/, "$1 $2 $3") ||
                    "Not available"}
                </span>
              </a>
              <a
                href={`mailto:${tour.contact_methods?.email}`}
                className="flex items-center space-x-4 bg-purple-50/80 backdrop-blur-sm p-6 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Mail className="w-6 h-6 text-purple-600" />
                <span className="text-lg text-gray-700">
                  {tour.contact_methods?.email || "Not available"}
                </span>
              </a>
              {/* <a
                href={`https://wa.me/${tour.contact_methods?.whatsapp}`}
                className="flex items-center space-x-4 bg-green-50/80 backdrop-blur-sm p-6 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6 text-green-600" />
                <span className="text-lg text-gray-700">
                  {tour.contact_methods?.whatsapp
                    ? `${tour.contact_methods?.whatsapp}`
                    : "Not available"}
                </span>
              </a> */}
            </div>
          </section>

          {/* Rules & Policy */}
          <section className="mx-2 ">
            <h2 className="text-3xl font-bold text-[#0F2642] mb-8">
              Rules & Policy
            </h2>
            <div className="grid gap-4">
              {tour.rules_and_policy?.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className="flex items-center space-x-4 bg-white/80 backdrop-blur-sm p-6 shadow-md border border-gray-200 rounded-lg"
                >
                  <span className="h-3 w-3 rounded-full bg-[#0F2642] flex-shrink-0" />
                  <span className="text-lg text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
        <section>
          <div className="p-2 mt-2 bg-gray-50 min-h-screen">
            {/* Overall Rating and Reviews Section */}
            <div className="max-w-9xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating Section */}
              <div
                className="col-span-2 bg-white rounded-lg shadow-lg p-6"
                // style={{ width: "362px" }}
              >
                <h2 className="text-2xl font-bold mb-6">Reviews Summary</h2>
                <div className="flex items-center mb-8">
                  <div className="text-6xl font-bold text-blue-600">
                    {overallRating.toFixed(1)}
                  </div>
                  <div className="ml-4 p-2">
                    {/* Determine Rating Category */}
                    <div className="text-xl font-bold text-[#02d190]">
                      {overallRating >= 4.5
                        ? "Excellent"
                        : overallRating >= 3.5
                        ? "Good"
                        : overallRating >= 2.5
                        ? "Average"
                        : overallRating >= 1.5
                        ? "Below Average"
                        : "Poor"}
                    </div>
                    <div className="text-gray-500">
                      Based on {reviews.length} review
                      {reviews.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                {/* Visualization Bars */}
                <div className="space-y-6">
                  {["Sleep", "Location", "Service", "Clean", "Rooms"].map(
                    (category, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-24 text-gray-600">{category}</div>
                        <div className="flex-grow bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#02d190] h-2"
                            style={{
                              width: `${
                                (reviews.reduce(
                                  (sum, review) =>
                                    sum + review[category.toLowerCase()],
                                  0
                                ) /
                                  reviews.length) *
                                20
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="ml-4 text-gray-600">
                          {(
                            reviews.reduce(
                              (sum, review) =>
                                sum + review[category.toLowerCase()],
                              0
                            ) / reviews.length || 0
                          ).toFixed(1)}{" "}
                          / 5
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Write a Review Section */}
              <div className="col-span-2 bg-white rounded-lg shadow-lg p-4">
                <button className="text-blue-600  text-2xl font-bold  mb-2">
                  Write a review
                </button>
                <div id="reviewForm">
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Name *"
                        className="border p-1 rounded-md w-full"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email *"
                        className="border p-1 rounded-md w-full"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Title *"
                      className="border p-1 rounded-md w-full"
                      required
                    />
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Content *"
                      className="border p-1 rounded-md w-full"
                      rows="2"
                      required
                    ></textarea>
                    <div className="grid grid-cols-2 gap-2">
                      {["Sleep", "Location", "Service", "Clean", "Rooms"].map(
                        (category, index) => (
                          <div key={index}>
                            <label className="block mb-1">{category}</label>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <span
                                  key={value}
                                  onClick={() =>
                                    handleStarChange(
                                      category.toLowerCase(),
                                      value
                                    )
                                  }
                                  className={`cursor-pointer text-2xl ${
                                    formData[category.toLowerCase()] >= value
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  &#9733;
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    <button
                      type="submit"
                      className="group bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 
                     text-white font
                     shadow-[0_10px_20px_rgba(0,0,0,0.1)] 
                     hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] py-1 px-3 rounded-md"
                    >
                      Post Review
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Display Reviews Section */}
            <div className="max-w-9xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 space-y-4">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{review.name}</h3>
                      <span className="text-gray-500">{review.date}</span>
                    </div>
                    <div className="text-yellow-400 flex">
                      {Array(review.stars)
                        .fill()
                        .map((_, i) => (
                          <span key={i}>&#9733;</span>
                        ))}
                    </div>
                  </div>
                  <h4 className="font-bold">{review.title}</h4>
                  <p className="text-gray-700">{review.content}</p>
                  <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <div>
                      Sleep: {review.sleep}
                      <span className="text-yellow-400 text-2xl">&#9733;</span>
                    </div>
                    <div>
                      Location: {review.location}
                      <span className="text-yellow-400 text-2xl">&#9733;</span>
                    </div>
                    <div>
                      Service: {review.service}
                      <span className="text-yellow-400 text-2xl">&#9733;</span>
                    </div>
                    <div>
                      Clean: {review.clean}
                      <span className="text-yellow-400 text-2xl">&#9733;</span>
                    </div>
                    <div>
                      Rooms: {review.rooms}
                      <span className="text-yellow-400 text-2xl">&#9733;</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleLike(index)}
                      className={`flex items-center ${
                        likedReviews.includes(index)
                          ? "text-blue-600"
                          : "text-gray-500"
                      } hover:text-blue-600`}
                      disabled={likedReviews.includes(index)}
                    >
                      {review.likes} likes
                      <FontAwesomeIcon
                        icon={faThumbsUp}
                        className="ml-1 text-lg"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      {isSmallDevice && (
        <div className="relative  lg:flex">
          {/* Other content */}
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md ">
            {/* Header Section */}
            <h2 className="text-lg font-semibold text-gray-800">
              {tour.location}
            </h2>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-2xl font-bold text-gray-800">
                INR {tour.price}
              </span>
              <span className="line-through text-gray-500 text-sm">
                INR {price}
              </span>
              <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded">
                SAVE INR 7,999
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleQuerySubmit} className="space-y-4 mt-6">
              <div>
                <input
                  type="text"
                  placeholder="Full Name*"
                  name="name"
                  value={tourFormData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email*"
                  name="email"
                  value={tourFormData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex space-x-2">
                <select className="w-1/4 border border-gray-300 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500">
                  <option value="+91">+91</option>
                </select>
                <input
                  type="text"
                  pattern="\d{10}"
                  name="phone"
                  value={tourFormData.phone}
                  onChange={handleChange}
                  placeholder="Your Phone*"
                  className="w-3/4 border border-gray-300 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                  title="Please enter a valid 10-digit phone number"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <input
                  type="date"
                  name="date" // Change to 'date' to match the state
                  value={tourFormData.date}
                  onChange={handleChange}
                  placeholder="Travel Date*"
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                  min={new Date().toISOString().split("T")[0]} // Set today's date as the minimum
                />
              </div>
              <div>
                <textarea
                  placeholder="Message..."
                  name="message"
                  value={tourFormData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-orange-500 focus:border-orange-500"
                  rows="3"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full group bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 
                text-white px-4 py-2 rounded-2xl text-lg font-medium
                shadow-[0_10px_20px_rgba(0,0,0,0.1)] 
                hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]
                transition-all duration-500 overflow-hidden
                border border-white/20 backdrop-blur-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Sending...
                  </div>
                ) : (
                  "Send Enquiry"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add ContactForm Modal */}
      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        isTour={true}
      />
    </div>
  );
};

export default ToursDetail;
