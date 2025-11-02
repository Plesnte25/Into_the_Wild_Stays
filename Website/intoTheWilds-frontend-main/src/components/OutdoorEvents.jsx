// import { useState } from "react";
// import { X, Mails, Navigation, PhoneCall, Send } from "lucide-react";
// import BookingButton from "./BookingButton";
// import emailjs from "emailjs-com";
// // Banner Images
// import Banner1 from "../assets/Outdoorevents/schoolcampbanner.png";
// import Banner2 from "../assets/Outdoorevents/dadnibanner.png";

// // Gallery Images 
// import Gallery1 from "../assets/Outdoorevents/oe1.jpeg";
// import Gallery2 from "../assets/Outdoorevents/oe2.jpeg";
// import Gallery3 from "../assets/Outdoorevents/oe3.jpeg";
// import Gallery4 from "../assets/Outdoorevents/oe4.jpeg";
// // Gallery Images 
// import Gallery5 from "../assets/Outdoorevents/oe5.jpeg";
// import Gallery6 from "../assets/Outdoorevents/oe6.jpeg";
// import Gallery7 from "../assets/Outdoorevents/oe7.jpeg";
// import Gallery8 from "../assets/Outdoorevents/oe8.jpeg";
// import Gallery9 from "../assets/Outdoorevents/oe9.jpeg";
// import Gallery10 from "../assets/Outdoorevents/oe10.jpeg";
// import Gallery11 from "../assets/Outdoorevents/oe11.jpeg";
// import Gallery12 from "../assets/Outdoorevents/oe12.jpeg";
// import Gallery13 from "../assets/Outdoorevents/oe13.jpeg";
// import Gallery14 from "../assets/Outdoorevents/oe14.jpeg";

// const ContactModal = ({ isOpen, onClose }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "", // Added phone field
//     message: ""
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const sendEmail = (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const serviceID = "service_8b79wnu";
//     const templateID = "template_434tezq";
//     const publicKey = "FU4ThIFcvqAz_SSAm";

//     emailjs.send(serviceID, templateID, formData, publicKey).then(
//       (response) => {
//         console.log("SUCCESS!", response.status, response.text);
//         setSuccess(true);
//         setIsSubmitting(false);
//         setFormData({ name: "", email: "", phone: "", message: "" });
//       },
//       (error) => {
//         console.error("FAILED...", error);
//         setIsSubmitting(false);
//       }
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
//       <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 bg-gray-100 p-2 hover:bg-gray-200 transition"
//         >
//           <X className="w-6 h-6 text-gray-700" />
//         </button>

//         <div className="grid grid-cols-1  border border-black">
          
//           <div className="p-8">
//             <h2 className="text-3xl font-bold mb-6 uppercase tracking-tight">
//               Talk to us
//             </h2>
//             <form onSubmit={sendEmail} className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block uppercase text-xs font-bold mb-2"
//                 >
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
//                   placeholder="Enter your name"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block uppercase text-xs font-bold mb-2"
//                 >
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
//                   placeholder="Enter your email"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="phone"
//                   className="block uppercase text-xs font-bold mb-2"
//                 >
//                   Phone
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
//                   placeholder="Enter your phone number"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="message"
//                   className="block uppercase text-xs font-bold mb-2"
//                 >
//                   Message
//                 </label>
//                 <textarea
//                   id="message"
//                   name="message"
//                   value={formData.message}
//                   onChange={handleInputChange}
//                   required
//                   rows="5"
//                   className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
//                   placeholder="Enter your message"
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full border border-black py-3 uppercase text-sm font-bold hover:bg-black hover:text-white transition duration-300 flex items-center justify-center space-x-2"
//               >
//                 {isSubmitting ? "Sending..." : "Send Message"}
//                 <Send className="w-4 h-4 ml-2" />
//               </button>

//               {success && (
//                 <p className="text-center mt-4 uppercase text-xs">
//                   Message sent successfully
//                 </p>
//               )}
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const EventModal = ({
//   isOpen,
//   onClose,
//   title,
//   details,
//   activities,
//   packageDetails,
//   placeholderImages,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
//       <div className="bg-white  w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 bg-gray-100  p-2 hover:bg-gray-200 transition"
//         >
//           <X className="w-6 h-6 text-gray-700" />
//         </button>

//         <div className="p-8">
//           <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>

//           {/* Event Details */}
//           <div className="mb-6">
//             <h3 className="text-2xl font-semibold mb-4">Event Description</h3>
//             <p className="mb-4 text-gray-700">{details}</p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-6">
//             {/* Activities */}
//             <div>
//               <h4 className="text-xl font-semibold mb-3">Activities</h4>
//               <ul className="list-disc pl-5 space-y-2">
//                 {activities.map((activity, index) => (
//                   <li key={index} className="text-gray-700">
//                     {activity}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Package Details */}
//             <div>
//               <h4 className="text-xl font-semibold mb-3">
//                 Package Information
//               </h4>
//               {packageDetails && (
//                 <div className="bg-gray-100 p-4 ">
//                   {packageDetails.map((detail, index) => (
//                     <p key={index} className="mb-2 text-gray-700">
//                       {detail}
//                     </p>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Gallery Images */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
//             {placeholderImages.map((image, index) => (
//               <img
//                 key={index}
//                 src={image}
//                 alt={`Gallery image ${index + 1}`}
//                 className="w-full h-60 object-cover"
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const EventCard = ({
//   title,
//   subtitle,
//   details,
//   activities,
//   packageDetails,
//   placeholderImages,
//   bannerImage,
// }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isContactModalOpen, setIsContactModalOpen] = useState(false);

//   return (
//     <div className="lg:px-32">
//       <div className="bg-white shadow-lg  overflow-hidden transform transition-all hover:scale-105 ">
//         {/* Card Header with Image */}
//         <div className="relative h-64 md:h-80 bg-gray-200 flex items-center justify-center">
//           <img
//             src={bannerImage}
//             alt={title}
//             className="absolute inset-0 w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 "></div>
//           {/* <div className="relative z-10 text-center text-white px-4">
//             <h2 className="text-3xl font-bold mb-2">{title}</h2>
//             <p className="text-xl font-light">{subtitle}</p>
//           </div> */}
//         </div>

//         {/* Details Button */}
//         <div className="flex flex-col justify-center items-center sm:flex-row gap-4 p-4 bg-gray-50">
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="px-6 my-4 py-2  text-white bg-[#43A181]  hover:bg-[#43A181] transition-colors"
//           >
//             View Event Details
//           </button>
//           {/* <BookingButton className="flex-1" /> */}
//           <button 
//             id="talk-to-us-button" 
//             onClick={() => setIsContactModalOpen(true)}
//             className="bg-[#0F2642] text-white px-6 py-2 text-lg hover:bg-[#0F2642] transition-all duration-300"
//           >
//             Talk to us
//           </button>
//         </div>
//       </div>

//       <EventModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         title={title}
//         details={details}
//         activities={activities}
//         packageDetails={packageDetails}
//         placeholderImages={placeholderImages}
//       />

//       <ContactModal 
//         isOpen={isContactModalOpen}
//         onClose={() => setIsContactModalOpen(false)}
//       />
//     </div>
//   );
// };

// const OutdoorEventsCards = () => {
//   const schoolCampDetails = {
//     title: "School Camp",
//     subtitle: "WORKSHOP | CAMPING | OUTDOOR ACTIVITIES",
//     details:
//       "An immersive outdoor experience designed to expose youth to nature, build character, and develop essential life skills through carefully crafted activities.",
//     activities: [
//       "Yoga & Zumba Workshop",
//       "Camping & Hiking Workshop",
//       "Art Workshop",
//       "Music Session and Bonfire",
//       "Projector Movie Night",
//       "Treasure Hunt and Fun Activities",
//     ],
//     packageDetails: [
//       "Contact: +91 99588 38557 | +91 9761966485",
//       "Focuses on safety, personality development, and outdoor learning",
//     ],
//     placeholderImages: [Gallery1, Gallery2, Gallery3, Gallery4, Gallery5, Gallery6, Gallery7, Gallery8, Gallery9, Gallery10, Gallery11, Gallery12, Gallery13, Gallery14],
//     bannerImage: Banner1,
//   };

//   const dadAndIDetails = {
//     title: "Dad & I",
//     subtitle: "BE A HERO OF YOUR KIDS",
//     details:
//       "A unique 2-day event that brings dads and children closer through outdoor adventures, team-building activities, and memorable experiences.",
//     activities: [
//       "Camping & Trekking Workshop",
//       "Cycling Workshop", 
//       "Yoga & Running Workshop",
//       "Team Bonding Activities",
//       "Live Music and Bonfire",
//     ],
//     packageDetails: [
//       "2N/3D - 6000rs per pair (Dad & Child)",
//       "3000 extra for another child",
//       "Includes stay, meals, workshops, and activities",
//     ],
//     placeholderImages: [],
//     bannerImage: Banner2,
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">
//         Outdoor Events
//       </h1>

//       <div className="grid md:grid-cols-2 gap-8">
//         <EventCard {...schoolCampDetails} />
//         <EventCard {...dadAndIDetails} />
//       </div>
//     </div>
//   );
// };

// export default OutdoorEventsCards;
