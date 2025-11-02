import { useParams } from "react-router-dom";
import { eventData } from "../data/eventData";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ContactForm from "../components/ContactForm";

const EventDetail = () => {
  const { id } = useParams();
  const event = eventData.find((e) => e.id === parseInt(id));
  const [showContactForm, setShowContactForm] = useState(false);

  const phoneNumber = "9761966485";
  const getWhatsAppLink = () => {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile
      ? `whatsapp://send?phone=${phoneNumber}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleContactClick = () => {
    setShowContactForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50/30">
      <div className="relative h-[80vh]">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0F2642]/60 to-[#0F2642]/90 backdrop-blur-[2px]" />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 text-white"
        >
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-teal-300 bg-clip-text text-transparent">
              {event.name}
            </h1>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-lg sm:text-xl font-light tracking-wide mb-6 sm:mb-8">
              <span className="flex items-center space-x-2 bg-white/10 px-3 sm:px-4 py-1 sm:py-2 rounded-full backdrop-blur-sm">
                {event.location}
              </span>
              <span className="flex items-center space-x-2 bg-white/10 px-3 sm:px-4 py-1 sm:py-2 rounded-full backdrop-blur-sm">
                {event.duration}
              </span>
              <span className="flex items-center space-x-2 bg-teal-500/20 px-3 sm:px-4 py-1 sm:py-2 rounded-full backdrop-blur-sm text-teal-300">
                Rs. {event.price} per person
              </span>
            </div>
            <motion.button
              onClick={handleContactClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              }}
              className="relative group bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-400 
                       text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg font-medium
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
        </motion.div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm py-8"></div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-[#0F2642]">
                About This Event
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {event.description}
              </p>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-[#0F2642]">
                Activities
              </h2>
              <ul className="space-y-4">
                {event.activities?.map((activity, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 text-lg group"
                  >
                    <span className="h-2 w-2 mt-2 mr-3 bg-teal-500 rounded-full group-hover:scale-150 transition-transform duration-300" />
                    {activity}
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-[#0F2642]">
                Package Details
              </h2>
              <ul className="space-y-4">
                {event.packageDetails?.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start text-gray-700 text-lg group"
                  >
                    <span className="h-2 w-2 mt-2 mr-3 bg-teal-500 rounded-full group-hover:scale-150 transition-transform duration-300" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-3xl font-bold mb-6 text-[#0F2642]">
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {event.galleryImages?.map((image, index) => (
                  <motion.div
                    key={index}
                    className="relative overflow-hidden rounded-2xl group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F2642]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="sticky top-8 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-8 text-[#0F2642]">
                Contact Information
              </h3>
              <div className="space-y-6">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="tel:+919761966485"
                  className="flex items-center text-gray-700 hover:text-teal-600 bg-gray-50 p-4 rounded-2xl transition-colors duration-300"
                >
                  <Phone className="w-6 h-6 mr-4" />
                  +91 97619 66485
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href="mailto:intothewildstays@gmail.com"
                  className="flex items-center text-gray-700 hover:text-teal-600 bg-gray-50 p-4 rounded-2xl transition-colors duration-300"
                >
                  <Mail className="w-6 h-6 mr-4" />
                  intothewildstays@gmail.com
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href={getWhatsAppLink()}
                  target="_blank"
                  className="flex items-center text-gray-700 hover:text-teal-600 bg-gray-50 p-4 rounded-2xl transition-colors duration-300"
                >
                  <MessageCircle className="w-6 h-6 mr-4" />
                  WhatsApp
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
      />
    </div>
  );
};

export default EventDetail;
