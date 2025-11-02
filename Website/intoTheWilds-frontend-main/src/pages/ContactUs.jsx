import { useState, useEffect } from "react";
import { Mails, Navigation, PhoneCall, Send } from "lucide-react";
import emailjs from "emailjs-com";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../utils/baseurl";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error on change
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if validation fails
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/contact`, formData);
      // console.log(response);
      toast.success("Message sent successfully");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("FAILED...", error);
      toast.error("Message failed to send");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="relative h-[90vh] overflow-hidden ">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.trvl-media.com/lodging/109000000/108380000/108370800/108370765/28b3dc50.jpg?impolicy=resizecrop&rw=1200&ra=fit')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2642]/90 via-[#0F2642]/90 to-[#0F2642]/70 backdrop-blur-[2px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 ">
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
              Let's Connect
            </span>
          </h1>
          <p className="text-xl font-semibold text-white max-w-2xl ">
            We're here to help turn your travel dreams into reality
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 space-y-8"
          >
            {/* Location Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-teal-500 rounded-lg">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Visit Us</h3>
              </div>
              <p className="text-gray-900">
                Into The Wild Stays,
                <br /> Near Ambar Eco park Dhanolti,
                <br /> 248001
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <PhoneCall className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Call Us</h3>
              </div>
              <div className="space-y-2">
                <a
                  href="tel:+919761966485"
                  className="block text-gray-900 hover:text-blue-500"
                >
                  +91 9761966485
                </a>
                <a
                  href="tel:+919958838557"
                  className="block text-gray-900 hover:text-blue-500"
                >
                  +91 9958838557
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Mails className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Email Us</h3>
              </div>
              <a
                href="mailto:intothewildstays@outlook.com"
                className="text-gray-900 hover:text-purple-500"
              >
                intothewildstays@gmail.com
              </a>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-3xl font-bold mb-8">Send us a Message</h2>
            <form onSubmit={sendEmail} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? "border-red-500" : "border-gray-800"
                    } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                    placeholder="Your Name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-800"
                    } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                    placeholder="example@gmail.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? "border-red-500" : "border-gray-800"
                  } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  placeholder="Enter Your Contact Number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Tell us what you're looking for..."
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 px-8 rounded-lg font-medium hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-green-600 font-medium"
                >
                  Message sent successfully!
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
