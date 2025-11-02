import { motion } from "framer-motion";
import {
  ArrowRight,
  Users,
  Home,
  Mountain,
  Music,
  Palette,
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

import Image3 from "../assets/itw_rep/itwrep_page-0009.jpg";
import Image4 from "../assets/itw_rep/itwrep_page-0010.jpg";
import Image5 from "../assets/itw_rep/itwrep_page-0011.jpg";
import Image6 from "../assets/itw_rep/itwrep_page-0012.jpg";
import Image7 from "../assets/itw_rep/itwrep_page-0013.jpg";

const AboutUs = () => {
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
              About Us
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-xl text-white max-w-2xl "
          >
            Meet the passionate team behind your extraordinary experiences
          </motion.p>
        </motion.div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-teal-600 font-medium text-4xl">
                OUR STORY
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0F2642]">
                Creating Memories in Nature&apos;s Embrace
              </h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Welcome to Into the Wild Stays, At Into the Wild Stays, we strive
              to offer more than just accommodations; we create memorable
              escapes in nature's embrace. Nestled in serene, offbeat locations,
              our boutique homestays and cottages provide the perfect blend of
              comfort, tranquility, and adventure. Our philosophy revolves
              around crafting personalized experiences that connect our guests
              with the beauty of the wilderness. With heartfelt hospitality and
              thoughtful service, we ensure every stay feels like a home away
              from home. Come, escape the chaos, and immerse yourself in the
              unforgettable charm of Into the Wild Stays!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Home className="w-6 h-6" />,
                  text: "Boutique Homestays",
                },
                {
                  icon: <Mountain className="w-6 h-6" />,
                  text: "Adventure Experiences",
                },
                { icon: <Users className="w-6 h-6" />, text: "Expert Guides" },
                {
                  icon: <Palette className="w-6 h-6" />,
                  text: "Cultural Immersion",
                },
              ]?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-[#0F2642]"
                >
                  <div className="p-2 bg-teal-100 rounded-lg">{item.icon}</div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 transform rotate-6 rounded-3xl" />
            <img
              src={Image2}
              alt="Our Story"
              className="relative rounded-3xl shadow-xl"
            />
          </motion.div>
        </div>
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
              Our Team
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[
              { name: "Aakash", role: "Co-Owner", img: ImageA },
              { name: "Vikky", role: "Co-Owner", img: ImageV },
              { name: "Deepak Rana", role: "Mountain Guide", img: ImageD },
              { name: "Vasu", role: "Music Artist", img: ImageVa },
              { name: "Veer", role: "Outdoor Instructor", img: ImageVe },
              {
                name: "Anshi",
                role: "Art & Craft Instructor",
                img: Imageanshi,
              },
              { name: "Arvind", role: "Senior Mountaineer", img: Imagearvind },
              { name: "Astha Doval", role: "Cyclist", img: Imageastha },
              { name: "Raghav", role: "Cycling Instructor", img: Imageraghav },
              { name: "Sonam Rana", role: "Kayak Instructor", img: Imagesonam },
            ]?.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white">
                      {member.name}
                    </h3>
                    <p className="text-teal-400">{member.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
     
    </div>
  );
};

export default AboutUs;
