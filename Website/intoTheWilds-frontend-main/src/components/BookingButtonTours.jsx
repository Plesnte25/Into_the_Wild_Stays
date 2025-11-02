// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { BASE_URL } from "../utils/baseurl";

// const UserDetailsForm = ({ property, tour, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     phone: "",
//     age: "",
//     specialRequirements: "",
//     startDate: "",
//     numberOfTourists: 1,
//     touristDetails: [
//       {
//         name: "",
//         age: "",
//       },
//     ],
//   });

//   const calculateTotalPrice = () => {
//     if (property) {
//       const totalDays = calculateTotalDays();
//       return totalDays * property.price;
//     } else if (tour) {
//       return tour.price * formData.numberOfTourists;
//     }
//     return 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleTouristDetailsChange = (index, field, value) => {
//     const newTouristDetails = [...formData.touristDetails];
//     newTouristDetails[index] = {
//       ...newTouristDetails[index],
//       [field]: value,
//     };
//     setFormData((prev) => ({
//       ...prev,
//       touristDetails: newTouristDetails,
//     }));
//   };

//   const handleNumberOfTouristsChange = (e) => {
//     const count = parseInt(e.target.value);
//     setFormData((prev) => ({
//       ...prev,
//       numberOfTourists: count,
//       touristDetails: Array(count)
//         .fill(0)
//         .map((_, i) => prev.touristDetails[i] || { name: "", age: "" }),
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Basic validation
//     if (!formData.fullName || !formData.phone) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     // Phone validation (simple check for 10 digits)
//     const phoneRegex = /^\d{10}$/;
//     if (!phoneRegex.test(formData.phone)) {
//       toast.error("Please enter a valid 10-digit phone number");
//       return;
//     }

//     // Validate tourist details
//     if (tour) {
//       const invalidTourists = formData.touristDetails.some(
//         (tourist) => !tourist.name || !tourist.age
//       );
//       if (invalidTourists) {
//         toast.error("Please fill details for all tourists");
//         return;
//       }
//     }

//     // If all validations pass, submit the form
//     const submissionData = {
//       ...formData,
//       totalPrice: calculateTotalPrice(),
//     };
//     onSubmit(submissionData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 z-[9999] overflow-y-auto">
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="bg-white w-full max-w-4xl rounded-lg relative">
//           {/* Close button */}
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 z-50 bg-white rounded-full p-2 shadow-lg"
//           >
//             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>

//           {/* Header */}
//           <div className="bg-[#0F2642] text-white p-6 rounded-t-lg">
//             <h2 className="text-2xl font-bold text-center">
//               Book Your {tour ? 'Tour' : 'Stay'}
//             </h2>
//             {tour && (
//               <p className="text-center mt-2 text-gray-200">
//                 {tour.name} - {tour.location}
//               </p>
//             )}
//           </div>

//           {/* Form Content */}
//           <div className="p-6 overflow-y-auto max-h-[70vh]">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Lead Contact Section */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h3 className="font-semibold text-lg mb-4 text-gray-800">Lead Contact Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="fullName" className="block text-gray-700 mb-2">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       id="fullName"
//                       name="fullName"
//                       value={formData.fullName}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2642]"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="phone" className="block text-gray-700 mb-2">
//                       Phone Number <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="tel"
//                       id="phone"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2642]"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Tour Specific Fields */}
//               {tour && (
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h3 className="font-semibold text-lg mb-4 text-gray-800">Tour Details</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label htmlFor="startDate" className="block text-gray-700 mb-2">
//                         Start Date <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         id="startDate"
//                         name="startDate"
//                         value={formData.startDate}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2642]"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label htmlFor="numberOfTourists" className="block text-gray-700 mb-2">
//                         Number of Tourists <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="number"
//                         id="numberOfTourists"
//                         name="numberOfTourists"
//                         min="1"
//                         value={formData.numberOfTourists}
//                         onChange={handleNumberOfTouristsChange}
//                         className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2642]"
//                         required
//                       />
//                     </div>
//                   </div>

//                   {/* Tourist Details */}
//                   <div className="mt-4">
//                     <h3 className="font-semibold text-lg mb-4 text-gray-800">Tourist Details</h3>
//                     {formData.touristDetails.map((tourist, index) => (
//                       <div key={index} className="grid grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
//                         <div>
//                           <label className="block text-gray-700 mb-2">
//                             Tourist {index + 1} Name <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             value={tourist.name}
//                             onChange={(e) => handleTouristDetailsChange(index, "name", e.target.value)}
//                             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2642]"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-gray-700 mb-2">
//                             Age <span className="text-red-500">*</span>
//                           </label>
//                           <input
//                             type="number"
//                             value={tourist.age}
//                             onChange={(e) => handleTouristDetailsChange(index, "age", e.target.value)}
//                             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2642]"
//                             required
//                           />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Special Requirements */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <label htmlFor="specialRequirements" className="block text-gray-700 mb-2">
//                   Special Requirements
//                 </label>
//                 <textarea
//                   id="specialRequirements"
//                   name="specialRequirements"
//                   value={formData.specialRequirements}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F2642]"
//                   rows="3"
//                   placeholder="Any special requests or requirements"
//                 />
//               </div>

//               {/* Price Summary */}
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="text-right">
//                   <p className="text-2xl font-bold text-[#0F2642]">
//                     Total Amount: ₹{calculateTotalPrice()}
//                   </p>
//                   {tour && (
//                     <p className="text-sm text-gray-600">
//                       (₹{tour.price} × {formData.numberOfTourists} tourists)
//                     </p>
//                   )}
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex justify-end space-x-4 pt-4">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-3 bg-[#0F2642] text-white rounded-md hover:bg-[#1a3b66] transition-colors"
//                 >
//                   Proceed to Payment
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const BookingButtonTours = ({ property, tour }) => {
//   const [loading, setLoading] = useState(false);
//   const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);
//   const [showLoginPopup, setShowLoginPopup] = useState(false);
//   const navigate = useNavigate();

//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user") || "null");

//   const loadRazorpayScript = async () => {
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => {};
//     document.body.appendChild(script);
//   };

//   React.useEffect(() => {
//     loadRazorpayScript();
//   }, []);

//   const handleProceed = () => {
//     if (!token || !user) {
//       setShowLoginPopup(true);
//       return;
//     }
//     setShowUserDetailsForm(true);
//   };

//   const LoginPopup = ({ onClose, onLogin }) => {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//         <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
//           <h2 className="text-2xl font-bold mb-6 text-center">
//             Login Required
//           </h2>
//           <p className="text-center mb-6">You need to log in to proceed.</p>
//           <div className="flex justify-between space-x-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={onLogin}
//               className="w-full px-4 py-2 bg-[#0F2642] text-white rounded hover:bg-blue-700"
//             >
//               Log In
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const handleUserDetailsSubmit = async (userDetails) => {
//     try {
//       setLoading(true);

//       const totalAmount = property
//         ? userDetails.totalPrice
//         : tour.price * userDetails.numberOfTourists;

//       const response = await axios.post(`${BASE_URL}/booking/new-booking`, {
//         startDate: userDetails.startDate,
//         amount: totalAmount,
//         user: user._id,
//         userDetails: userDetails,
//         tour: tour?._id,
//         property: property?._id,
//         touristDetails: tour ? userDetails.touristDetails : null,
//         numberOfTourists: tour ? userDetails.numberOfTourists : null,
//       });

//       initPayment(response.data.order, response.data.booking._id);
//       setShowUserDetailsForm(false);
//     } catch (error) {
//       console.log(error);
//       toast.error("Failed to create booking");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const initPayment = (data, bookingId) => {
//     const options = {
//       key: "rzp_test_S7O9aeETo3NXrl",
//       amount: data.amount,
//       currency: data.currency,
//       order_id: data.razorpayOrderId,
//       name: "Into The Wilds",
//       description: tour ? "Tour Booking Payment" : "Property Booking Payment",
//       prefill: {
//         name: user.name,
//         email: user.email,
//       },
//       notes: {
//         address: "Razorpay Corporate Office",
//       },
//       theme: {
//         color: "#3399cc",
//       },
//       handler: async (response) => {
//         try {
//           const verifyUrl = `${BASE_URL}/booking/verify-payment`;
//           const verifyData = {
//             razorpay_order_id: response.razorpay_order_id,
//             razorpay_payment_id: response.razorpay_payment_id,
//             razorpay_signature: response.razorpay_signature,
//             bookingId: bookingId,
//           };
//           try {
//             const res = await axios.post(verifyUrl, verifyData);
//             if (res.status === 200) {
//               toast.success("Payment Successful");
//             }
//           } catch (err) {
//             toast.error(err.response.data.message);
//           }
//         } catch (err) {
//           console.log(err);
//         }
//       },
//     };
//     const rzp1 = new window.Razorpay(options);
//     rzp1.open();
//   };

//   return (
//     <>
//       <div className="flex justify-center items-center p-4">
//         <button
//           onClick={handleProceed}
//           disabled={loading}
//           className={`
//             px-6 py-3 
//             text-white 
//             font-semibold 
//             text-lg 
//             transition-all 
//             duration-300 
//             ease-in-out 
//             shadow-lg 
//             hover:shadow-xl 
//             focus:outline-none 
//             focus:ring-2 
//             focus:ring-offset-2 
//             ${loading ? "bg-[#0F2642] cursor-not-allowed" : "bg-[#0F2642]"}
//           `}
//         >
//           {loading ? (
//             <div className="flex items-center">
//               <svg
//                 className="animate-spin h-5 w-5 mr-3"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Processing...
//             </div>
//           ) : (
//             "Book Now"
//           )}
//         </button>
//       </div>

//       {showLoginPopup && (
//         <LoginPopup
//           onClose={() => setShowLoginPopup(false)}
//           onLogin={() => {
//             setShowLoginPopup(false);
//             navigate("/login");
//           }}
//         />
//       )}

//       {showUserDetailsForm && (
//         <UserDetailsForm
//           property={property}
//           tour={tour}
//           onClose={() => setShowUserDetailsForm(false)}
//           onSubmit={handleUserDetailsSubmit}
//         />
//       )}
//     </>
//   );
// };

// export default BookingButtonTours;
