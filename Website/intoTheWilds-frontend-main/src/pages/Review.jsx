import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  Home,
  Mountain,
  Music,
  Palette,
  ImageOff,
} from "lucide-react";

import Image2 from "../assets/itw_rep/itwrep_page-0008.jpg";

import ImageA from "../assets/team/AkashCoowner.jpg";
import ImageV from "../assets/team/VikkyCoowner.jpg";
import ImageD from "../assets/team/DeepakRanaMountainGuide.jpg";
import ImageVa from "../assets/team/VasuMusicArtist.jpg";
import ImageVe from "../assets/team/VeerOutdoorinstructor.jpg";
import Imageanshi from "../assets/team/AnshiArt&Craftinstructor.jpg";
import Imagearvind from "../assets/team/ArvindSeniorMountaineer.jpg";
import Imageastha from "../assets/team/AsthaDovalCyclist.jpg";
import Imageraghav from "../assets/team/RaghavCycling Instructor.jpg";
import Imagesonam from "../assets/team/SonamRanaKayakinstructor.jpg";
import { useState, useEffect } from "react";
import { Mails, Navigation, PhoneCall, Send, Star } from "lucide-react";
import emailjs from "emailjs-com";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../utils/baseurl";
import { useLocation } from "react-router-dom";
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Image3 from "../assets/itw_rep/itwrep_page-0009.jpg";
import Image4 from "../assets/itw_rep/itwrep_page-0010.jpg";
import Image5 from "../assets/itw_rep/itwrep_page-0011.jpg";
import Image6 from "../assets/itw_rep/itwrep_page-0012.jpg";
import Image7 from "../assets/itw_rep/itwrep_page-0013.jpg";
const Review = () => {
  const location = useLocation();
  const state = location.state;
  console.log(state);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    message: "",
    user: "",
    property: "",
    image: "",
    reviewId: ""
  });

  const [reviews, setReviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!state || !state.user || !state.property || !state.bookingId) return;

    const fetchInitialData = async () => {
      try {
        const [userRes, reviewRes] = await Promise.all([
          axios.get(`${BASE_URL}/user/${state.user.id}`, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${BASE_URL}/reviews/booking/${state.bookingId}`)
        ]);

        const userData = userRes.data;
        const review = reviewRes.data.review;

        setFormData((prev) => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          user: state.user.id,
          property: state.property._id,
          booking: state.bookingId,
          message: review?.comment || "",
          rating: review?.rating || 0,
          image: review?.image || "",
          reviewId: review?._id || ""
        }));
      } catch (err) {
        console.error("Error fetching user or review:", err);

        // Still show user info even if review not found
        try {
          const userRes = await axios.get(`${BASE_URL}/user/${state.user.id}`, {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          const userData = userRes.data;
          setFormData((prev) => ({
            ...prev,
            name: userData.name,
            email: userData.email,
            user: state.user.id,
            property: state.property._id,
            booking: state.bookingId
          }));
        } catch (err2) {
          console.error("Fallback user fetch failed:", err2);
        }
      }
    };

    fetchInitialData();
  }, [state]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/reviews/`);
        setReviews(res.data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const reviewPayload = {
        user: formData.user,
        property: formData.property,
        booking: state.bookingId,
        comment: formData.message,
        rating: formData.rating,
        image: formData.image
      };

      if (formData.reviewId) {
        await axios.put(`${BASE_URL}/reviews/${formData.reviewId}`, reviewPayload);
        toast.success("Review updated successfully");
      } else {
        await axios.post(`${BASE_URL}/reviews/`, reviewPayload);
        toast.success("Review submitted successfully");
      }

    } catch (error) {
      console.error("Error sending review:", error);
      toast.error("Message failed to send");
    } finally {
      setIsSubmitting(false);
    }
  };
 const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2, // Show 2 reviews at a time
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768, // Tablet & Mobile
        settings: {
          slidesToShow: 1, // Show 1 review at a time on small screens
        },
      },
    ],
  };
  const StarRating = ({ rating, setRating }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => setRating(star)}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
    </div>
  );

  if (!state || !state.user || !state.property) {
    return <div>Missing info. Please go back and try again.</div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50/30">
      {/* Hero Section */}
      <div className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.trvl-media.com/lodging/109000000/108380000/108370800/108370765/28b3dc50.jpg?impolicy=resizecrop&rw=1200&ra=fit')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2642]/90 via-[#0F2642]/90 to-[#0F2642]/70 backdrop-blur-[2px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white font-semibold text-lg md:text-xl tracking-wider mb-4"
          >
            WELCOME TO INTO THE WILD STAYS
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6"
          >
            {/* Turning <br /> */}
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
              Review Us
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-xl text-white max-w-2xl "
          >
            We’d love to hear about your experience with us—what stood out and how we did!
          </motion.p>
        </motion.div>
      </div>

      {/* Story Section */}
<div className="max-w-7xl mx-auto px-6 py-24">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-gray-800'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            placeholder="Your Name"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-800'
            } focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
            placeholder="example@gmail.com"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
      </div>

      <div className="w-full px-4 py-3 rounded-lg border border-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
        <input type="file" accept="image/*" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarRating
          rating={formData.rating}
          setRating={(value) => setFormData({ ...formData, rating: value })}
        />
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
    </form>
  </motion.div>
</div>


      {/* Team Section */}
      <div className="bg-[#0F2642] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            {/* <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-teal-400 font-medium"
            >
              OUR TEAM
            </motion.span> */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent"
            >
              Some of our clients reviews
            </motion.h2>
          </div>

          <Slider {...settings} className="w-full">
            {reviews?.map((review, index) => (
              <div key={index} className="p-2">
                <div
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full flex flex-col sm:flex-row items-start gap-4"
                  style={{ height: "360px" }}
                >
                  {/* User Info + Comment + Rating */}
                  <div className="flex flex-col sm:w-1/2 w-full">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={review.user?.avatar || "https://www.gravatar.com/avatar/"}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {review.user?.name || "Anonymous"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 text-sm sm:text-md text-justify sm:text-left">
                      {review.comment}
                    </p>

                    <div className="flex items-center space-x-1">
                      {[...Array(review.rating)].map((_, star) => (
                        <span key={star} className="text-yellow-500 text-xl">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Show image only if valid */}
                  <div className="flex justify-center items-center sm:w-1/2 w-full h-full">
                    <img
                      src={
                        review.image && typeof review.image === "string" && review.image.trim() !== ""
                          ? review.image
                          : "https://ui-avatars.com/api/?name=Review&background=random"
                      }
                      alt="Review"
                      className="rounded-lg object-cover w-full h-full max-h-[300px]"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.pexels.com/photos/32108586/pexels-photo-32108586.jpeg";
                      }}
                    />
                  </div>



                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Gallery Section */}
     
    </div>
  );
};

export default Review;
