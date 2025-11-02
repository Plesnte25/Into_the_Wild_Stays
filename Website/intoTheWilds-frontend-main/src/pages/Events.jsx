import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { eventData } from "../data/eventData";
import ContactForm from "../components/ContactForm";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEvents(eventData);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-[85vh] overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[url('https://images.trvl-media.com/lodging/109000000/108380000/108370800/108370765/28b3dc50.jpg?impolicy=resizecrop&rw=1200&ra=fit')] bg-cover bg-center bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2642]/90 via-[#0F2642]/90 to-[#0F2642]/70 backdrop-blur-[2px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center"
        >
          <span className="text-white font-semibold text-sm sm:text-base md:text-lg tracking-wider mb-2 sm:mb-4">
            DISCOVER & EXPLORE
          </span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight px-4"
          >
            {/* Unforgettable <br className="hidden sm:block"/> */}
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
              Events
            </span>
          </motion.h1>
          <p className="text-white sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-xs sm:max-w-lg md:max-w-2xl mb-6 sm:mb-8 leading-relaxed px-4">
            Create unforgettable memories in nature&apos;s most breathtaking
            settings
          </p>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="bg-[#0F2642] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:bg-[#0F2642]/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Plan Your Event
          </button>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {events?.map((event) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              key={event.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="relative overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2642]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <div className="space-y-3 text-white">
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {event.duration}
                      </span>
                    </div>
                    <p className="text-lg font-medium">
                      Starting from Rs. {event.price}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#0F2642] mb-4">
                  {event.name}
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="flex-1 bg-[#0F2642] text-white px-4 py-2 rounded-full hover:bg-[#0F2642]/90 transition-colors duration-300"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="flex-1 border-2 border-teal-500 text-teal-500 px-4 py-2 rounded-full hover:bg-teal-50 transition-colors duration-300"
                  >
                    Talk to our Experts
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ContactForm
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default Events;
