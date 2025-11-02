// import React from "react";
// import Property1 from "./property-pages/Property1";

// const amenityData = [
//     {
//         name: 'Personalized Service',
//         info: 'Our dedicated staff is ready to cater to your every need, ensuring a stay that is tailored to your preferences. Experience personalized service that goes beyond expectations, making your time at IntoTheWildStays Resort truly unforgettable.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/02/DSC00301-1536x1024.jpg'
//     },
//     {
//         name: 'Spa Retreat',
//         info: 'Immerse yourself in the epitome of relaxation at our on-site spa. Indulge in rejuvenating therapies and massages designed to enhance your well-being, providing a holistic escape amidst the serene ambiance of IntoTheWildStays Resort.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/02/DSC00432-1536x1024.jpg'
//     },
//     {
//         name: 'Horse Riding Adventures',
//         info: 'Experience the thrill of exploring IntoTheWildStays’s scenic landscapes on horseback. Our horse riding activities offer a unique and exhilarating way to connect with nature, creating lasting memories for both beginners and experienced riders.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/05/2-1.png'
//     },
//     {
//         name: 'On-Site Restaurant',
//         info: 'Indulge your palate in a culinary journey at our on-site restaurant. Our diverse menu features local specialties and international delights, ensuring a gastronomic adventure that satisfies every taste bud.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/02/DSC00409-1536x1024.jpg'
//     },
//     {
//         name: 'Swimming Pool Oasis',
//         info: 'Relax and rejuvenate by our pristine swimming pool. Whether you prefer lounging under the sun or taking a refreshing dip, our pool area offers a tranquil retreat amidst the scenic surroundings of Desi Thath.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/02/4-2.png'
//     },
//     {
//         name: 'Kid-Friendly Zone',
//         info: 'Families are welcome at Desi Thath Resort, and our dedicated Kids Area ensures that the youngest members of your party have a delightful and safe space to play, explore, and create lasting memories.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/02/2-2.png'
//     },
//     {
//         name: 'Club Room Lounge',
//         info: 'Elevate your stay with access to our exclusive Club Room lounge. Enjoy a refined atmosphere, personalized services, and additional amenities, creating a luxurious retreat within your already exceptional experience.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/05/6.png'
//     },
//     {
//         name: 'Open Library Retreat',
//         info: 'Find solace in our Open Library, a quiet haven for book lovers. Surrounded by the tranquility of Desi Thath, this open-air library provides the perfect setting for literary exploration and intellectual contemplation.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/02/DSC00418-1536x1024.jpg'
//     },
//     {
//         name: '24x7 Room Service',
//         info: 'Our commitment to your comfort extends around the clock with 24×7 room service. Whether it’s a late-night craving or an early morning breakfast in bed, our attentive staff is ready to cater to your needs at any hour.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/02/desithathresort_377766564_18196334140279542_6364580146986830054_n.jpg'
//     },
//     {
//         name: 'Safari Adventures',
//         info: 'Embark on a thrilling safari adventure to explore the natural wonders that surround Desi Thath Resort. Witness the diverse wildlife and scenic landscapes, creating an unforgettable journey through the heart of nature.',
//         imgURL: 'https://desithath.in/wp-content/uploads/2024/05/7.png'
//     },
// ]

// const Amenities = () => {
//     return (
//       <>
//         <div>
//           <div className="bg-[url('https://sundaysforever.com/static/media/Barlowscottageimg14.9e6859ced0b73fc2614d.jpg')] bg-cover bg-center bg-fixed lg:py-24 py-16 flex flex-col items-center lg:gap-4 text-white">
//             <h1 className="text-6xl before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-green-400 relative inline-block">
//               <span className="relative">Welcome</span>
//             </h1>
//           </div>
//           <div>
//             <Property1 />
//           </div>
//           <div className="lg:mx-28 my-8 px-6">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {amenityData.map((card, index) => (
//                 <div
//                   key={index}
//                   className="w-full max-w-[400px] mx-auto my-8 rounded-lg bg-gradient-to-r from-green-100 to-green-300 shadow-lg shadow-[#091f3ccc] hover:shadow-xl hover:shadow-[#091f3ccc] cursor-pointer transition-all hover:-translate-y-2 duration-300"
//                 >
//                   <img className="rounded-t-lg" src={card.imgURL} alt={card.name} />
//                   <div className="flex flex-col items-center gap-2 px-6 py-4">
//                     <h1 className="text-xl lg:text-2xl font-bold">{card.name}</h1>
//                     <p className="text-center">{card.info}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   };
  

// export default Amenities;
