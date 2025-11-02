import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import heroImage4 from "../assets/banner/b4.jpeg";

const PropertyListingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone))
      return "Please enter a valid 10-digit phone number";
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when user starts typing
    if (name === "email" || name === "phone") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    if (currentStep === 2) {
      const emailError = validateEmail(formData.email);
      const phoneError = validatePhone(formData.phone);

      setErrors({
        email: emailError,
        phone: phoneError,
      });

      return !emailError && !phoneError;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (currentStep !== 3) {
      setCurrentStep((curr) => curr + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setIsSubmitting(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => {
        onClose();
        setCurrentStep(1);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending property listing query", error);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: "Personal Details",
      icon: "👤",
    },
    {
      title: "Contact Info",
      icon: "📞",
    },
    {
      title: "Property Details",
      icon: "🏠",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white max-w-2xl w-full overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2642] to-[#1a3b66] p-6 relative border-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:bg-white/20 p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2">
            List Your Property
          </h2>
          <p className="text-white/80">
            Join our network of exclusive properties
          </p>

          {/* Progress Steps */}
          <div className="flex justify-between mt-6 relative px-6 border-4 border-red-500">
            {/* Line Behind Icons */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/30 z-0">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `calc(${
                    ((currentStep - 1) / (steps.length - 1)) * 100
                  }%)`,
                }}
              />
            </div>

            {/* Step Icons */}
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center z-10 -mx-1"
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center text-xl border-2 border-white
          ${
            currentStep > index
              ? "bg-green-500"
              : currentStep === index + 1
              ? "bg-yellow-400"
              : "bg-white/30"
          } transition-all duration-300
          ${index === 0 ? "rounded-l-full" : ""}
          ${index === steps.length - 1 ? "rounded-r-full" : ""}
        `}
                >
                  {step.icon}
                </div>
                <span className="text-white/90 text-sm mt-2 text-center w-24">
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          <div>
            {/* Progress Line */}
            <div className="absolute top-5 left-0 h-0.5 bg-white/30 w-full -z-0">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only letters and spaces
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      handleInputChange(e);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F2642] focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-[#0F2642] focus:border-transparent transition-all`}
                  placeholder="Enter your email address"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-[#0F2642] focus:border-transparent transition-all`}
                  placeholder="Enter your phone number"
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Details
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F2642] focus:border-transparent transition-all"
                  placeholder="Tell us about your property..."
                  required
                ></textarea>
              </div>
            </motion.div>
          )}

          <div className="flex gap-4 justify-between pt-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((curr) => curr - 1)}
                className="px-6 py-2 text-[#0F2642] border-2 border-[#0F2642] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="submit"
                className="ml-auto px-6 py-2 bg-[#0F2642] text-white rounded-lg hover:bg-[#0F2642]/90 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto px-6 py-2 bg-[#0F2642] text-white rounded-lg hover:bg-[#0F2642]/90 transition-colors flex items-center"
              >
                {isSubmitting ? "Submitting..." : "Submit Property"}
              </button>
            )}
          </div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-green-600 bg-green-50 p-4 rounded-lg"
            >
              Your property has been submitted successfully! We'll contact you
              soon.
            </motion.div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

const ListYourProperties = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative py-10 bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-30" />

      <div className="container mx-auto px-6 lg:px-32">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:w-1/2 space-y-10"
          >
            <div className="space-y-6 ml-4 md:ml-0 text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-teal-100/50 text-teal-700 font-semibold tracking-wider rounded-full"
              >
                BECOME A HOST
              </motion.span>
              <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-[#0F2642] to-teal-600 bg-clip-text text-transparent">
                List Your Property With Us
              </h2>
            </div>
            <p className="text-xl bg-gray-100 hover:shadow-md p-4 rounded-3xl text-gray-900 leading-relaxed font-normal">
              Join our exclusive network of property owners and connect with
              thousands of travelers seeking unique stays. We provide
              comprehensive support to help you manage your property efficiently
              and maximize your rental income.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mx-auto max-w-3xl">
              {[
                {
                  title: "Global Reach",
                  desc: "Connect with travelers worldwide",
                  icon: "🌍",
                },
                {
                  title: "Expert Support",
                  desc: "Professional management assistance",
                  icon: "👥",
                },
                {
                  title: "Smart Pricing",
                  desc: "Competitive commission structure",
                  icon: "💰",
                },
                {
                  title: "Easy Management",
                  desc: "Intuitive host dashboard",
                  icon: "⚡",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 text-center rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-white/50"
                >
                  <span className="text-2xl mb-3 block">{benefit.icon}</span>
                  <h3 className="font-bold text-base text-[#0F2642] mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-900 font-normal text-sm">
                    {benefit.desc}
                  </p>
                </motion.div>
              ))}
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex justify-center lg:justify-start"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-[#0F2642] to-teal-700 text-white rounded-2xl hover:shadow-2xl transition-all duration-500 shadow-lg text-lg font-medium group"
              >
                List Your Property Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>

          {/* Right image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 transform rotate-6 rounded-[2rem] blur-sm" />
              <motion.img
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5 }}
                src={heroImage4}
                alt="Luxury property"
                className="relative rounded-[2rem] shadow-2xl w-full h-[700px] object-cover hover:shadow-3xl transition-all duration-500"
              />
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Property Listing Modal */}
      <PropertyListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default ListYourProperties;
