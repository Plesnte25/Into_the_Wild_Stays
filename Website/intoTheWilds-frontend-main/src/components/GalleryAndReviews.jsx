// import { useState } from "react";
import { Quote, Star, Link as LinkIcon } from "lucide-react";
import Image2 from "../assets/guestdiary/img-1.jpeg";
import Image3 from "../assets/guestdiary/img-2.jpg";
import Image4 from "../assets/guestdiary/img-3.jpeg";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const testData = [
  {
    type: "review",
    name: "Tushar Bhagwane",
    review:
      "I had a fantastic stay at this hotel! The rooms were spacious, clean, and well-equipped. The staff were incredibly friendly and went above and beyond.",
    location: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a-/ALV-UjVxxwRteERrs8ChY1SwQcY-cczJTbr37ZC34xirdvxZ1V02hV0=w75-h75-p-rp-mo-br100",
  },
  {
    type: "image",
    imgSrc: Image2,
    caption: "Take a deep breath and find peace among the peaks",
  },
  {
    type: "review",
    name: "Hrishabh Vashishtha", 
    review:
      "Into the Wild is an absolute gem! The interiors are cozy, the location is stunning, and the peaceful surroundings make it a perfect retreat.",
    location: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a-/ALV-UjVVWoTorW_xMCcGxT-K1pMEkyr6BiZRst_xtZZ4nATKp6PVafjl=w75-h75-p-rp-mo-ba2-br100",
  },
  {
    type: "image",
    imgSrc: Image3,
    caption: "Mountain views that will take your breath away",
  },
  {
    type: "review",
    name: "Manish Rathore",
    review:
      "Amazing stay at Into the Wild! Spacious cottage, stunning views, and delicious food. The staff was friendly and accommodating.",
    location: "Dhanaulti, Uttarakhand", 
    img: "https://lh3.googleusercontent.com/a-/ALV-UjWAyMr0qVH4_8n21vsJraxjHqz_wEyldxnY2MHklO0JqjjGCfsw=w75-h75-p-rp-mo-br100",
  },
  {
    type: "image",
    imgSrc: Image4,
    caption: "Serene moments in the mountains",
  },
  {
    name: "Achyut Pandey",
    review:
      "Beautiful place to spend time with family and friends. Spacious cottages and a blissful valley view from the watchtower. Highly recommended!",
    address: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a-/ALV-UjUiPYj94ra9LMSK_zdaPBiWGKgJ4tiRClMczHtXnkUHZZ8KlkDt=w75-h75-p-rp-mo-br100",
    rating: 5,
  },
  {
    name: "Arvind Nagar",
    review:
      "The location and view are worth every penny. Wonderful hospitality, and Uncle ji took great care of us like family. Will definitely come back soon!",
    address: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a-/ALV-UjXcVgO6RVm6QTkIEvCG4fDM4693d-jm2kS5Eji3CbgzhzcTVZLy=w75-h75-p-rp-mo-ba2-br100",
    rating: 5,
  },
  {
    name: "Shivam Mishra",
    review:
      "Amazing stay with stunning views from the windows. The food, especially honey chilli potatoes and momos, was delicious. Highly recommended!",
    address: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a-/ALV-UjVtHJlom4jAmFJh851wQLMKq_OWJHGUSw7S8qRq9SLF_pPd5oq2=w75-h75-p-rp-mo-br100",
    rating: 5,
  },
  {
    name: "Anjali Sharma",
    review:
      "A very beautiful and cozy cottage with an amazing mountain view. Perfect for a hill station staycation!",
    address: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a/ACg8ocJ8AxiaJuwlIiaehLvnIF99LgA7h-U99sgupo9LNOEKOmlGqg=w75-h75-p-rp-mo-br100",
    rating: 5,
  },
  {
    name: "Rajat Sharma",
    review:
      "Located near Eco Park, this stay is vibrant and spacious. Modern cottages with a close-to-nature feel. Loved the hospitality and food!",
    address: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a-/ALV-UjWfhfXkPNVUNWGSMayOR9RqYcyoEH8iKKWKAtHxLbqAzpNDbJ85Ow=w75-h75-p-rp-mo-ba2-br100",
    rating: 5,
  },
  {
    name: "Msc Bill",
    review:
      "Dhanaulti is beautiful, and Into the Wild homestay is the best place to stay. Amazing rooms and services!",
    address: "Dhanaulti, Uttarakhand",
    img: "https://lh3.googleusercontent.com/a/ACg8ocJFqMHTOoRlhOUZiHy71cfy-oExqTTSauzFrHgX2S5kqC6g5Q=w75-h75-p-rp-mo-br100",
    rating: 5,
  },
];

const GalleryAndReviews = () => {
  return (
    <div className=" bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100 py-20  lg:px-32">
      {/* <div className="absolute inset-0 backdrop-blur-md bg-white/40"></div> */}

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center ">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-cyan-900 to-emerald-900 bg-clip-text text-transparent">
              Guest <span className="text-black">Diary</span>
            </span>
          </motion.h1>
          <p className="text-black text-lg font-semibold max-w-2xl mx-auto">
            Discover what our guests have to say about their memorable
            experiences with us
          </p>
        </div>

        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          loop={true} // Enable looping
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ clickable: true }}
          navigation={false}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="mySwiper"
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testData?.map((item, index) => (
            <SwiperSlide key={index} className="py-12 pl-4 pr-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {item.type === "image" ? (
                  <div className="relative overflow-hidden rounded-3xl h-[450px]">
                    <img
                      src={item.imgSrc}
                      alt={item.caption || `Gallery item ${index + 1}`}
                      className="w-full h-full object-cover  transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-xl font-semibold leading-relaxed">
                          {item.caption}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 h-[520px] flex flex-col bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl border-2 border-[#0F2642]/10 hover:border-[#0F2642]/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <Quote className="w-12 h-12 text-[#0F2642] opacity-80" />
                      <div className="flex space-x-1 text-amber-400">
                        {[...Array(5)]?.map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-current" />
                        ))}
                      </div>
                    </div>

                    <p className="italic text-gray-700 text-lg flex-grow leading-relaxed mb-6">
                      &ldquo;{item.review.length > 125 ? `${item.review.substring(0, 125)}...`: item.review}&rdquo;
                    </p>

                    <div className="mt-auto">
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-[#0F2642]/10 shadow-lg"
                        />
                        <div>
                          <p className="md:text-xl text-[15px] font-semibold text-gray-800">
                            {item.name}
                          </p>
                          <div className="flex items-center text-[#0F2642] text-sm mt-1">
                            <LinkIcon className="w-4 h-4 mr-2" />
                            {item.location || item.address}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#0F2642]/10">
                        <span className="text-sm font-medium text-[#0F2642] flex items-center">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Verified Stay
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default GalleryAndReviews;
