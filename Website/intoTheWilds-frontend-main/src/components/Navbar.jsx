import { useState, useEffect } from "react";
import { Menu, X, User, Phone, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/IntotheWildStaysLogo.png";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

/* ----------------------- Property Listing Modal (unchanged) ----------------------- */
const PropertyListingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({ email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!re.test(email)) return "Please enter a valid email address";
    return "";
  };
  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    if (!phone) return "Phone number is required";
    if (!re.test(phone)) return "Please enter a valid 10-digit phone number";
    return "";
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (name === "email" || name === "phone") setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const validateForm = () => {
    if (currentStep === 2) {
      const emailError = validateEmail(formData.email);
      const phoneError = validatePhone(formData.phone);
      setErrors({ email: emailError, phone: phoneError });
      return !emailError && !phoneError;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (currentStep !== 3) {
      setCurrentStep((c) => c + 1);
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSuccess(true);
      setIsSubmitting(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => {
        onClose();
        setCurrentStep(1);
        setSuccess(false);
      }, 1600);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  const steps = [
    { title: "Personal Details", icon: "👤" },
    { title: "Contact Info", icon: "📞" },
    { title: "Property Details", icon: "🏠" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0F2642] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-yellow-500/30">
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="relative bg-gray-800 rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <button onClick={onClose} className="absolute right-0 top-4 text-white hover:text-yellow-300" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">List Your Property</h2>
            <p className="text-gray-300 text-center">Join our network of exclusive properties</p>

            <div className="flex justify-between mt-6 relative">
              {steps.map((s, i) => (
                <div key={i} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                    ${currentStep > i + 1 ? "bg-green-500 text-white" : currentStep === i + 1 ? "bg-yellow-500 text-[#0F2642]" : "bg-gray-700 text-gray-300"}`}>
                    {s.icon}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${currentStep === i + 1 ? "text-yellow-500" : "text-gray-300"}`}>
                    {s.title}
                  </span>
                </div>
              ))}
              <div className="absolute top-5 left-8 h-1 bg-gray-700 w-[260px] -z-0">
                <div className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">Full Name</label>
                    <input type="text" name="name" value={formData.name}
                      onChange={(e) => /^[a-zA-Z\s]*$/.test(e.target.value) && handleInputChange(e)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500" placeholder="Enter your full name" required />
                  </motion.div>
                )}
                {currentStep === 2 && (
                  <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-600"} bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500`} placeholder="Enter your email" required />
                      {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-400 mb-1">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-600"} bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500`} placeholder="Enter your phone number" required />
                      {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                    </div>
                  </motion.div>
                )}
                {currentStep === 3 && (
                  <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                    <label className="block text-sm font-medium text-yellow-400 mb-1">Property Details</label>
                    <textarea name="message" value={formData.message} onChange={handleInputChange} rows="4"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-yellow-500" placeholder="Tell us about your property..." required />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 justify-between pt-4">
                {currentStep > 1 && (
                  <button type="button" onClick={() => setCurrentStep((c) => c - 1)}
                    className="px-5 py-2 text-white border border-gray-500 rounded-lg hover:bg-gray-700">
                    Previous
                  </button>
                )}
                <button type="submit" disabled={isSubmitting}
                  className={`${currentStep === 1 ? "ml-auto" : ""} px-6 py-2 bg-yellow-500 text-[#0F2642] font-bold rounded-lg hover:bg-yellow-400 flex items-center`}>
                  {currentStep < 3 ? "Next" : isSubmitting ? "Submitting..." : "Submit Property"} {currentStep === 3 && <Send className="w-4 h-4 ml-2" />}
                </button>
              </div>
              {success && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-center text-green-500 bg-green-900/50 p-4 rounded-lg border border-green-500/30">
                Your property has been submitted successfully! We'll contact you soon.
              </motion.div>}
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ----------------------------------- Navbar ----------------------------------- */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset;
      setVisible(prevScrollPos > y || y < 10);
      setPrevScrollPos(y);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [prevScrollPos]);

  const toggleMenu = () => setIsOpen((s) => !s);

  return (
    <nav className={`w-full z-50 bg-black transition-all duration-300 ${visible ? "top-0" : "-top-32"} sticky`} style={{ position: "sticky" }}>
      {/* Top bar */}
      <div className="bg-[#0F2642] text-white">
        <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 md:gap-4">
            {/* Left: contact */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm md:text-base">
              <span className="flex items-center gap-2">
                <Phone className="text-yellow-300" size={16} />
                <a href="tel:+919761966485" className="hover:text-yellow-300">+91 (976)-196-6485</a>
                <span className="hidden sm:inline">;</span>
                <a href="tel:+919958838557" className="hidden sm:inline hover:text-yellow-300">+91 (995)-883-8557</a>
              </span>
              <span className="hidden md:inline-block">|</span>
              <span className="flex items-center gap-2">
                <Mail className="text-yellow-300" size={16} />
                <a href="mailto:intothewildstays@gmail.com" className="hover:text-yellow-300">
                  intothewildstays@gmail.com
                </a>
              </span>
            </div>

            {/* Right: social */}
            <div className="flex items-center justify-center md:justify-end gap-6">
              <a href="https://www.facebook.com/profile.php?id=61557269590045" target="_blank" rel="noopener noreferrer"
                 className="text-white hover:text-yellow-300 transition-transform duration-200 hover:scale-110" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebookF} className="text-sm sm:text-base" />
              </a>
              <a href="https://www.instagram.com/intothewildstays/profilecard/?igsh=cGt4dTRvenNvZ25h" target="_blank" rel="noopener noreferrer"
                 className="text-white hover:text-yellow-300 transition-transform duration-200 hover:scale-110" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagram} className="text-sm sm:text-base" />
              </a>
              <a href="https://wa.me/9761966485" target="_blank" rel="noopener noreferrer"
                 className="text-white hover:text-yellow-300 transition-transform duration-200 hover:scale-110" aria-label="WhatsApp">
                <FontAwesomeIcon icon={faWhatsapp} className="text-sm sm:text-base" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white text-black">
        <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <img src={logo} alt="Into the Wild" className="h-14 sm:h-16 md:h-20 lg:h-22 transition-all duration-300" />
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
              {[
                { to: "/properties", text: "Properties" },
                { to: "/tours", text: "Tours" },
                { to: "/events", text: "Events" },
                { to: "/blog", text: "Blog" },
                { to: "/about-us", text: "About Us" },
                { to: "/contact-us", text: "Contact Us" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-black hover:text-yellow-300 px-2 xl:px-3 py-2 text-sm md:text-base font-semibold transition">
                  {l.text}
                </Link>
              ))}

              <button
                onClick={() => setIsPropertyModalOpen(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500
                           text-black text-sm md:text-base px-3 md:px-5 lg:px-6 py-2 rounded-lg font-bold shadow-lg hover:shadow-yellow-500/20 transition">
                List Your Property
              </button>

              <Link to="/user-profile"
                    className="group flex items-center justify-center bg-[#0F2642] text-white px-5 py-2 rounded-full hover:bg-[#0F2642]/90 transition shadow-md">
                <User className="w-5 h-5 mr-2 group-hover:rotate-6 transition-transform" />
                <span className="font-extrabold">{token ? "Profile" : "Login"}</span>
              </Link>
            </div>

            {/* Mobile button */}
            <div className="lg:hidden">
              <button onClick={toggleMenu} className="p-2 rounded-full text-white hover:text-yellow-300" aria-label="Toggle menu">
                {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-0 bg-[#0F2642] z-50 flex flex-col items-center justify-center overflow-x-hidden">
            <button onClick={toggleMenu} className="absolute top-4 right-4 p-2 text-white hover:text-yellow-300 rounded-full">
              <X className="h-8 w-8" />
            </button>

            <div className="flex flex-col items-center space-y-6 text-center w-full px-8">
              {[
                { to: "/", text: "Home" },
                { to: "/properties", text: "Properties" },
                { to: "/tours", text: "Tours" },
                { to: "/events", text: "Events" },
                { to: "/blog", text: "Blog" },
                { to: "/about-us", text: "About Us" },
                { to: "/contact-us", text: "Contact Us" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-white text-2xl font-semibold hover:text-yellow-300"
                      onClick={() => setIsOpen(false)}>
                  {l.text}
                </Link>
              ))}

              <button onClick={() => { setIsPropertyModalOpen(true); setIsOpen(false); }}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-500
                           px-6 py-3 rounded-lg text-lg font-bold shadow-lg transition">
                List Your Property
              </button>

              <Link to="/user-profile"
                className="flex items-center justify-center bg-white text-[#0F2642] px-6 py-3 rounded-full hover:bg-yellow-300 transition"
                onClick={() => setIsOpen(false)}>
                <User className="w-5 h-5 mr-2" />
                <span className="font-semibold">{token ? "Profile" : "Login"}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <PropertyListingModal isOpen={isPropertyModalOpen} onClose={() => setIsPropertyModalOpen(false)} />
    </nav>
  );
}
