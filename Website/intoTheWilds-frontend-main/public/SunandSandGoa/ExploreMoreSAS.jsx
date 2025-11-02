import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from "react-icons/fa";
import img1 from "../assets/SunandSandGoa/50PM.jpeg";
import img2 from "../assets/SunandSandGoa/51PM.jpeg";
import img3 from "../assets/SunandSandGoa/34.52PM2.jpeg";
import img4 from "../assets/SunandSandGoa/52PM.jpeg";
import { MapPin, Mountain } from "lucide-react";
import BookingButton from "./BookingButton";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10,
    },
  },
};
const handleBookNow = () => {
  // You can replace this with actual booking logic
  // For now, it will scroll to the top or open a booking modal
  window.scrollTo({ top: 0, behavior: "smooth" });
  // Alternatively, you could trigger a booking modal
  // openBookingModal();
};

const galleryImages = [img1, img2, img3, img4];

const property = {
    checkInDate: "2024-12-01",
    checkOutDate: "2024-12-03",
    price: 11000,
  }
;

const faqs = [
  {
    question:
      "Can I book only one or two rooms, or do I need to book the entire Home?",
    answer:
      "No, you cannot book just one room. You would need to book the entire cottage.",
  },
  {
    question: "Is parking available onsite or nearby?",
    answer: "Free parking is available onsite for up to 2 cars.",
  },
  {
    question: "Is the Property suitable for a day picnic?",
    answer:
      "Yes, the home has a garden/lawn area within the premises that could be used for outdoor picnic activities. Meals will be provided on site at an additional charge (per person, per meal). Please note that the maximum capacity for an overnight stay is 4 people.",
  },
  {
    question: "Is property pet friendly?",
    answer:
      "We’re happy to welcome your furry friends at the Villa! Please bring a pet bed along, as pets aren’t allowed on guest beds or any linen. Enjoy a comfortable stay for you and your pet in the heart of nature!",
  },
];

const bookingPolicies = [
  "Check in: 1 PM check out: 11 AM",
  "Guests are requested to shut the windows and doors during the evening as the property may be prone to insects and bugs.",
  "Guests are not allowed to spill food or drinks over the upholstery or they will be charged at checkout.",
  "Please be mindful and keep the noise to a minimum after 10 PM.",
  "Passport, Aadhar, Driving License, and Govt. ID are accepted as ID proof(s).",
  "The property allows private parties or events.",
];

const refundAndReschedulingPolicy = [
  "Refunds would be processed in 14 working days.",
  "Booking can be rescheduled till 15 days prior to arrival date depending upon availability.",
  "₹1000 plus applicable taxes will be charged for rescheduling.",
  "Rescheduling can only be done for the same property.",
  "If the tariff on the rescheduled date is higher than the initial booking date, the difference is payable.",
];

const thingsToKnow = [
  "The full payment must be made for your booking to be confirmed.",
  "Only guests accounted for are allowed at the property.",
  "Any damage to the property caused by guests will be charged as per the actual cost of repair or replacement.",
  "Any commercial activity is strictly prohibited.",
  "Guests are requested to treat the home with care.",
  "Consider this as a homestay in the mountains, not a typical hotel stay.",
];

const cancellationPolicy = [
  "Cancellation 12 days prior to arrival date: 15% will be charged.",
  "Cancellation 07 days prior to arrival date: 50% will be charged.",
  "Cancellation less than a week: Full retention would be applicable.",
  "Credit/Debit card cancellations will be charged 5% extra.",
  "Cancellation policy for long weekends and special days: Cancellation 07 days prior to arrival date: 50% will be charged. Cancellation less than a week: Full retention would be applicable.",
];

const amenities = [
  "Essentials",
  "Towels and toiletries",
  "Add-on experience",
  "Private entrance",
  "Serene location.",
  "Pet friendly",
  "In-house chef/caretaker ",
  "Cozy linens",
  "Bluetooth sound system ",
  "Wi-Fi ",
  "Private cottage ",
  "Garden",
  "Breakfast",
];

const ExploreMoreSAS = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top
  }, []);

  return (
    <div className="min-h-screen bg-yellow-100/50 px-4 sm:px-6 lg:px-32 py-48 sm:py-20 lg:py-40 text-black">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-12">
        {/* Hero Section */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight text-center lg:text-left">
            Sun N Sand: Premium Cottages in the Heart of Nature
            <br />
            <span className="text-green-700">Goa</span>
          </h1>

          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-base sm:text-xl text-gray-700 font-medium">
              Goa
            </span>
          </div>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 sm:mb-8 text-center lg:text-left">
            Welcome to Sun N Sand, a serene 4BHK villa nestled in the heart of
            Candolim, Goa Perfect for families and friends, this spacious villa
            offers a private pool, lush garden, and stunning beach views
            Experience the charm of Goa with the comfort and privacy of a home
            away from home. Relax, unwind, and create unforgettable memories in
            this idyllic coastal retreat
          </p>

          <div className="flex justify-center lg:justify-start">
            {/* <button
              onClick={handleBookNow}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Book Now
            </button> */}
            <BookingButton property={property} />
          </div>
        </div>

        {/* Gallery Section */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {galleryImages?.map((image, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden  shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="mt-12 sm:mt-16 bg-opacity-15 backdrop-blur-lg p-6 md:p-8 mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 border-b border-gray-300 pb-4">
          Property Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <div className="bg-gray-100/50 p-4 rounded-lg shadow-sm flex items-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h1m4 0h1m-6 3v-16"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Cottages</p>
              <p className="text-gray-600">6 Premium Cottages</p>
            </div>
          </div>

          <div className="bg-gray-100/50 p-4 rounded-lg shadow-sm flex items-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Guest Capacity</p>
              <p className="text-gray-600">4 persons per cottage</p>
            </div>
          </div>

          <div className="bg-gray-100/50 p-4 rounded-lg shadow-sm flex items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Maximum Capacity</p>
              <p className="text-gray-600">24 persons</p>
            </div>
          </div>

          <div className="bg-gray-100/50 p-4 rounded-lg shadow-sm flex items-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Price Per Cottage</p>
              <p className="text-gray-600">₹5000 per cottage</p>
            </div>
          </div>

          <div className="bg-gray-100/50 p-4 rounded-lg shadow-sm flex items-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Location</p>
              <a
                href="https://www.google.com/maps/place/Me:nam+Homestay+(Majuli)"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          </div>

          <div className="bg-gray-100/50 p-4 rounded-lg shadow-sm flex items-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h1m4 0h1m-6 3v-16"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Address</p>
              <p className="text-gray-600">
                Sunrise Alpine Stay, Mountain View Road
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Things to Do Section */}
      <div className="mt-12 sm:mt-16 bg-white bg-opacity-10 backdrop-blur-lg p-6 sm:p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          Things to Do at Sunrise Alpine Stay
        </h2>
        <ul className="list-disc ml-4 sm:ml-6 space-y-2 sm:space-y-3">
          <li>Boating: Glide along the serene Brahmaputra River.</li>
          <li>
            Mask Making: Discover Majuli's traditional art of handmade masks.
          </li>
          <li>
            Pottery Village: Visit local artisans crafting pottery by hand.
          </li>
          <li>Apong Making: Learn to make Apong, Assam's unique rice beer.</li>
          <li>
            Weaving: Watch intricate weaving techniques by local craftsmen.
          </li>
          <li>
            Village Walk: Stroll through picturesque villages, meeting locals
            and experiencing daily life.
          </li>
        </ul>
      </div>

      {/* FAQs Section */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          FAQs
        </h2>
        <div className="space-y-4 sm:space-y-6">
          {faqs?.map((faq, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-lg p-4 sm:p-6 rounded-lg shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl"
              onClick={() => toggleFaq(index)}
            >
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-medium">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <FaArrowAltCircleUp className="text-base sm:text-xl" />
                ) : (
                  <FaArrowAltCircleDown className="text-base sm:text-xl" />
                )}
              </div>
              {openIndex === index && (
                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Section */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          Amenities
        </h2>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 sm:p-8 rounded-lg shadow-xl">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {amenities?.map((amenity, index) => (
              <li
                key={index}
                className="text-black flex items-center space-x-2"
              >
                <span className="inline-block w-2.5 h-2.5 bg-teal-400 rounded-full"></span>
                <span className="text-sm sm:text-base">{amenity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Booking Policies Section */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          Booking Policies
        </h2>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 sm:p-8 rounded-lg shadow-xl">
          <ul className="list-disc ml-4 sm:ml-6 space-y-2 sm:space-y-3">
            {bookingPolicies?.map((policy, index) => (
              <li key={index} className="text-black text-sm sm:text-base">
                {policy}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cancellation Policy Section */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          Cancellation Policy
        </h2>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 sm:p-8 rounded-lg shadow-xl">
          <ul className="list-disc ml-4 sm:ml-6 space-y-2 sm:space-y-3">
            {cancellationPolicy?.map((policy, index) => (
              <li key={index} className="text-black text-sm sm:text-base">
                {policy}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    // <div className="min-h-screen bg-gradient-to-br from-[#091F3C] to-[#3C8D99] px-6 lg:px-32 py-40 text-white">
    //   <motion.button
    //     initial={{ opacity: 0, scale: 0.8 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     whileHover={{ scale: 1.05 }}
    //     whileTap={{ scale: 0.95 }}
    //     transition={{
    //       type: "spring",
    //       stiffness: 300,
    //       damping: 10,
    //     }}
    //     onClick={handleBookNow}
    //     className="fixed bottom-6 right-6 z-50 bg-white text-green-900
    //              px-6 py-3 rounded-full shadow-2xl
    //              hover:bg-white transition-colors duration-300
    //              flex items-center space-x-2
    //              "
    //     style={{
    //       boxShadow: "0 10px 25px rgba(0, 255, 0, 0.3)",
    //       backdropFilter: "blur(10px)",
    //     }}
    //   >
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       width="24"
    //       height="24"
    //       viewBox="0 0 24 24"
    //       fill="none"
    //       stroke="currentColor"
    //       strokeWidth="2"
    //       strokeLinecap="round"
    //       strokeLinejoin="round"
    //       className="mr-2"
    //     >
    //       <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    //       <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    //     </svg>
    //     Book Now
    //   </motion.button>
    //   <motion.div
    //     variants={containerVariants}
    //     initial="hidden"
    //     animate="visible"
    //     className="flex items-center justify-center w-full px-4"
    //   >
    //     <motion.div
    //       variants={containerVariants}
    //       className="flex items-center justify-center text-4xl font-bold tracking-wide mb-6 text-green-800 bg-green-50 p-6 rounded-xl shadow-lg border-2 border-green-100 max-w-2xl w-full"
    //     >
    //       <motion.div variants={itemVariants} className="flex items-center">
    //         <MapPin
    //           className="mr-4 text-green-600 transition-transform hover:scale-110"
    //           size={48}
    //         />
    //         <span className="text-center flex-grow">location: Goa</span>
    //         <Mountain
    //           className="ml-4 text-green-600 transition-transform hover:scale-110"
    //           size={48}
    //         />
    //       </motion.div>
    //     </motion.div>
    //   </motion.div>

    //   {/* Hero Section */}
    //   <motion.h1
    //     initial={{ opacity: 0, y: -50 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 0.8 }}
    //     className="text-center text-4xl font-bold tracking-wide mb-6"
    //   >
    //     Sunrise Alpine Stay: Premium Cottages in the Heart of Nature
    //   </motion.h1>
    //   <motion.p
    //     initial={{ opacity: 0, y: 30 }}
    //     animate={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 1 }}
    //     className="text-center text-lg max-w-3xl mx-auto mb-12"
    //   >
    //     Welcome to Sunrise Alpine Stay, where luxury meets nature. Experience
    //     our premium cottages set against breathtaking mountain vistas, offering
    //     the perfect blend of comfort and natural beauty. Each stay is crafted to
    //     provide an unforgettable escape from city life.
    //   </motion.p>

    //   {/* Gallery Section */}
    //   <motion.div
    //     className="mb-16"
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //   >
    //     <h2 className="text-3xl font-bold text-center mb-8">Gallery</h2>
    //     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    //       {galleryImages.map((image, index) => (
    //         <motion.div
    //           key={index}
    //           initial={{ scale: 0.8, opacity: 0 }}
    //           whileInView={{ scale: 1, opacity: 1 }}
    //           transition={{ duration: 0.5, delay: index * 0.2 }}
    //           className="relative overflow-hidden rounded-lg shadow-lg"
    //         >
    //           <img
    //             src={image}
    //             alt={`Gallery ${index + 1}`}
    //             className="object-cover w-full h-64 transition-transform duration-300 hover:scale-105"
    //           />
    //         </motion.div>
    //       ))}
    //     </div>
    //   </motion.div>

    //   {/* Property Details */}
    //   <motion.div
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //     className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-lg mb-16 shadow-xl"
    //   >
    //     <h2 className="text-2xl font-semibold text-center mb-4">
    //       Property Details
    //     </h2>
    //     <ul className="list-disc ml-6 space-y-3">
    //       <li>Cottages: 6 Premium Cottages</li>
    //       <li>Guest Capacity: 4 persons per cottage</li>
    //       <li>Maximum Capacity: 24 persons</li>
    //       <li>Price Per Cottage: ₹5000</li>
    //       <li>
    //         Location:{" "}
    //         <a href="#" className="text-blue-300 underline">
    //           View on Google Maps
    //         </a>
    //       </li>
    //       <li>Address: Sunrise Alpine Stay, Mountain View Road</li>
    //     </ul>
    //   </motion.div>

    //   {/* Amenities Section */}
    //   <motion.div
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //     className="mb-16"
    //   >
    //     <h2 className="text-3xl font-bold text-center mb-8">Amenities</h2>
    //     <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-lg shadow-xl">
    //       <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    //         {amenities.map((amenity, index) => (
    //           <motion.li
    //             key={index}
    //             initial={{ opacity: 0, y: 20 }}
    //             whileInView={{ opacity: 1, y: 0 }}
    //             transition={{ duration: 0.5, delay: index * 0.2 }}
    //             className="text-gray-300 flex items-center space-x-2"
    //           >
    //             <span className="inline-block w-2.5 h-2.5 bg-teal-400 rounded-full"></span>
    //             <span>{amenity}</span>
    //           </motion.li>
    //         ))}
    //       </ul>
    //     </div>
    //   </motion.div>

    //   {/* FAQs Section */}
    //   <motion.div
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //     className="mb-16"
    //   >
    //     <h2 className="text-3xl font-bold text-center mb-8">FAQs</h2>
    //     <div className="space-y-6">
    //       {faqs.map((faq, index) => (
    //         <motion.div
    //           key={index}
    //           initial={{ scale: 0.95, opacity: 0 }}
    //           whileInView={{ scale: 1, opacity: 1 }}
    //           transition={{ duration: 0.5, delay: index * 0.2 }}
    //           className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg shadow-xl cursor-pointer"
    //           onClick={() => toggleFaq(index)}
    //         >
    //           <div className="flex justify-between items-center">
    //             <span className="text-lg font-medium">{faq.question}</span>
    //             {openIndex === index ? (
    //               <FaArrowAltCircleUp className="text-xl" />
    //             ) : (
    //               <FaArrowAltCircleDown className="text-xl" />
    //             )}
    //           </div>
    //           {openIndex === index && (
    //             <motion.p
    //               initial={{ opacity: 0, y: -20 }}
    //               animate={{ opacity: 1, y: 0 }}
    //               transition={{ duration: 0.3 }}
    //               className="mt-4 text-gray-300"
    //             >
    //               {faq.answer}
    //             </motion.p>
    //           )}
    //         </motion.div>
    //       ))}
    //     </div>
    //   </motion.div>

    //   {/* Booking Policies */}
    //   <motion.div
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //     className="mb-16"
    //   >
    //     <h2 className="text-3xl font-bold text-center mb-8">
    //       Booking Policies
    //     </h2>
    //     <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-lg shadow-xl">
    //       <ul className="list-disc ml-6 space-y-3">
    //         {bookingPolicies.map((policy, index) => (
    //           <motion.li
    //             key={index}
    //             initial={{ opacity: 0, x: -20 }}
    //             whileInView={{ opacity: 1, x: 0 }}
    //             transition={{ duration: 0.5, delay: index * 0.2 }}
    //             className="text-gray-300"
    //           >
    //             {policy}
    //           </motion.li>
    //         ))}
    //       </ul>
    //     </div>
    //   </motion.div>

    //   {/* Cancellation Policy */}
    //   <motion.div
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //     className="mb-16"
    //   >
    //     <h2 className="text-3xl font-bold text-center mb-8">
    //       Cancellation Policy
    //     </h2>
    //     <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-lg shadow-xl">
    //       <ul className="list-disc ml-6 space-y-3">
    //         {cancellationPolicy.map((policy, index) => (
    //           <motion.li
    //             key={index}
    //             initial={{ opacity: 0, x: -20 }}
    //             whileInView={{ opacity: 1, x: 0 }}
    //             transition={{ duration: 0.5, delay: index * 0.2 }}
    //             className="text-gray-300"
    //           >
    //             {policy}
    //           </motion.li>
    //         ))}
    //       </ul>
    //     </div>
    //   </motion.div>

    //   {/* Refund and Rescheduling Policy */}
    //   <motion.div
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //     className="mb-16"
    //   >
    //     <h2 className="text-3xl font-bold text-center mb-8">
    //       Refund and Rescheduling Policy
    //     </h2>
    //     <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-lg shadow-xl">
    //       <ul className="space-y-4 text-lg">
    //         {refundAndReschedulingPolicy.map((policy, index) => (
    //           <motion.li
    //             key={index}
    //             initial={{ opacity: 0, translateY: 10 }}
    //             whileInView={{ opacity: 1, translateY: 0 }}
    //             transition={{ duration: 0.5, delay: index * 0.2 }}
    //             className="flex items-start gap-3"
    //           >
    //             <span className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></span>
    //             <span className="text-gray-300">{policy}</span>
    //           </motion.li>
    //         ))}
    //       </ul>
    //     </div>
    //   </motion.div>

    //   {/* Things to Know */}
    //   <motion.div
    //     initial={{ opacity: 0 }}
    //     whileInView={{ opacity: 1 }}
    //     transition={{ duration: 0.8 }}
    //     className="mb-16"
    //   >
    //     <h2 className="text-3xl font-bold text-center mb-8">Things to Know</h2>
    //     <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-lg shadow-xl">
    //       <ul className="space-y-4 text-lg">
    //         {thingsToKnow.map((thing, index) => (
    //           <motion.li
    //             key={index}
    //             initial={{ opacity: 0, translateY: 10 }}
    //             whileInView={{ opacity: 1, translateY: 0 }}
    //             transition={{ duration: 0.5, delay: index * 0.2 }}
    //             className="flex items-start gap-3"
    //           >
    //             <span className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></span>
    //             <span className="text-gray-300">{thing}</span>
    //           </motion.li>
    //         ))}
    //       </ul>
    //     </div>
    //   </motion.div>
    // </div>
  );
};

export default ExploreMoreSAS;
