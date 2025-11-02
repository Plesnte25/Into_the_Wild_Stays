import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import toursData from "../data/tours.json";
import { useNavigate } from "react-router-dom";
import ContactForm from "../components/ContactForm";
// import BookingButtonTours from "../components/BookingButtonTours";
import Image3 from "../assets/itw_rep/itwrep_page-0009.jpg";
import Image4 from "../assets/itw_rep/itwrep_page-0010.jpg";
import Image5 from "../assets/itw_rep/itwrep_page-0011.jpg";
import Image6 from "../assets/itw_rep/itwrep_page-0012.jpg";
import Image7 from "../assets/itw_rep/itwrep_page-0013.jpg";

const Tours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    setTours(toursData.tours);
  }, []);

  const navigateToTour = (tour) => {
    navigate(`/tours/${tour.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50/30">
      <div className="relative h-[85vh] overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[url('https://images.trvl-media.com/lodging/109000000/108380000/108370800/108370765/28b3dc50.jpg?impolicy=resizecrop&rw=1200&ra=fit')] bg-cover bg-center bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2642]/90 via-[#0F2642]/90 to-[#0F2642]/70 backdrop-blur-[2px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight px-4"
          >
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
              Tours
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mb-8 sm:mb-10 lg:mb-12 leading-relaxed px-4"
          >
            Embark on extraordinary journeys that will create memories to last a
            lifetime
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {tours?.map((tour, index) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              key={tour.id}
              className="group bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500"
            >
              <div className="relative">
                <div className="h-[250px] sm:h-[300px] md:h-[400px] overflow-hidden">
                  <img
                    src={tour.imageUrl}
                    alt={tour.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2642] via-[#0F2642]/60 to-transparent opacity-90" />
                <div className="absolute bottom-0 p-4 sm:p-6 md:p-8 w-full">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">
                    {tour.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-sm sm:text-base text-gray-200">
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
                </div>
              </div>
              <div className="p-6 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigateToTour(tour)}
                  className="w-full sm:w-auto bg-[#0F2642] text-white px-8 py-3 rounded-full text-base font-medium hover:bg-[#0F2642]/90 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Explore Details
                </button>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full sm:w-auto border-2 border-teal-500 text-teal-500 px-8 py-3 rounded-full text-base font-medium hover:bg-teal-50 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Talk to our Experts
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="py-24 bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[Image3, Image4, Image5, Image6, Image7]?.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-3xl overflow-hidden shadow-xl ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ContactForm
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        isTour={true}
      />
    </div>
  );
};

export default Tours;
