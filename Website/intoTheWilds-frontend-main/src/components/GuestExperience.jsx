import { useEffect, useRef, useState } from "react";
import { Play, Pause, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

import guestExp1 from "../assets/guest4.mp4";
import guestExp2 from "../assets/Video-14~2.mp4";
import guestExp3 from "../assets/guest-exp.mp4";
import guestExp4 from "../assets/Video-822~2.mp4";

const GuestExperience = () => {
  const videoRefs = useRef([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const videos = [
    { src: guestExp1, title: "Wilderness Retreat" },
    { src: guestExp3, title: "Serene Landscapes" },
    { src: guestExp2, title: "Adventure Moments" },
    { src: guestExp4, title: "Into The Wilds Stays" },
  ];

  const handleTimeUpdate = (e) => {
    const progress = (e.target.currentTime / e.target.duration) * 100;
    setProgress(progress);
  };

  useEffect(() => {
    videoRefs.current.forEach((videoRef) => {
      if (videoRef) {
        videoRef.volume = 0.15;
        videoRef.addEventListener("timeupdate", handleTimeUpdate);
      }
    });

    return () => {
      videoRefs.current.forEach((videoRef) => {
        if (videoRef) {
          videoRef.removeEventListener("timeupdate", handleTimeUpdate);
        }
      });
    };
  }, []);

  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      if (isPlaying) currentVideo.pause();
      else currentVideo.play();
      setIsPlaying(!isPlaying);
    }
  };

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    setIsPlaying(false);
    setProgress(0);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(false);
    setProgress(0);
  };

  const selectVideo = (index) => {
    setCurrentVideoIndex(index);
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen   bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100    relative overflow-hidden">
      <div className=" mx-auto px-6 my-10">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl font-bold text-center mb-12"
        >
          <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent ">
            Our <span className="text-gray-800 ">Story</span>
          </span>
        </motion.h1>

        <div className="grid lg:grid-cols-12 gap-6 items-center">
          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-2 border-2 bg-white border-cyan-400 rounded-2xl my-6 md:mx-10 p-8 shadow-xl hover:shadow-2xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-800 to-cyan-800 bg-clip-text text-transparent">
                Welcome to Our Company
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-900 font-medium">
                At{" "}
                <span className="font-bold bg-gradient-to-r from-cyan-800 to-cyan-800 bg-clip-text  text-transparent ">
                  Into The Wild Stays
                </span>{" "}
                We offer more than just accommodations. We create memorable
                escapes in nature&apos;s embrace. Nestled in serene, offbeat
                locations, our boutique homestays and cottages provide the
                perfect blend of comfort, tranquility, and adventure.
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[15px] leading-relaxed text-gray-900 font-medium"
            >
              Our philosophy revolves around crafting personalized experiences
              that connect guests with the beauty of the wilderness. With
              heartfelt hospitality and thoughtful service, we ensure every stay
              feels like a home away from home.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg leading-relaxed font-medium text-cyan-800 italic "
            >
              Come, escape the chaos, and immerse yourself in the unforgettable
              charm of{" "}
              <span className="font-bold bg-gradient-to-r from-cyan-800 to-cyan-800 bg-clip-text text-transparent">
                Into the Wild Stays!
              </span>
            </motion.p>
          </motion.div>

          {/* Video Player Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 relative h-[60vh] rounded-3xl overflow-hidden shadow-2xl group"
          >
            <video
              ref={(el) => {
                videoRefs.current[currentVideoIndex] = el;
              }}
              src={videos[currentVideoIndex].src}
              muted
              className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
              onEnded={nextVideo}
            />

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
                className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400"
              />
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-row items-center space-x-6 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevVideo}
                className="bg-transparent text-gray-800 p-2 hover:bg-white transition-all duration-300"
              >
                <ChevronLeft size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="bg-transparent text-gray-800 p-4 hover:bg-white transition-all duration-300"
              >
                {isPlaying ? (
                  <Pause size={24} className="text-teal-600" />
                ) : (
                  <Play size={24} className="text-teal-600 ml-0.5" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextVideo}
                className="bg-transparent text-gray-800 p-2 hover:bg-white transition-all duration-300"
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Slider Section */}
        <div className="mt-12 flex justify-center space-x-4">
          {videos.map((video, index) => (
            <div
              key={index}
              className={`w-24 h-24 border-2 rounded-xl overflow-hidden cursor-pointer ${
                index === currentVideoIndex
                  ? "border-teal-600"
                  : "border-gray-300"
              }`}
              onClick={() => selectVideo(index)}
            >
              <video
                src={video.src}
                className="w-full h-full object-cover"
                muted
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestExperience;
