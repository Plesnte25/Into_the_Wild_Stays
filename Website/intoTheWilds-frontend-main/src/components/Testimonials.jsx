import { useRef, useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { motion } from "framer-motion";
import VideoTestimonial1 from "../assets/testimon-v-main1.mp4";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
const Testimonials = () => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // intersection-observer
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play();
          setIsPlaying(true);
        } else {
          el.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setProgress((v.currentTime / v.duration) * 100 || 0);
  };
  const seekBy = (sec) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + sec), v.duration);
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100  px-8 rounded-3xl">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl md:text-7xl font-bold  text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="bg-gradient-to-r from-cyan-800 to-emerald-800 bg-clip-text text-transparent">
            Guest
          </span>{" "}
          Experience
        </motion.h1>
        <div className="mt-32">
          <div className="max-w-5xl mx-auto relative rounded-[2rem] overflow-hidden shadow-2xl group">
            <video
              ref={videoRef}
              src={VideoTestimonial1}
              preload="auto"
              className="w-full aspect-video object-cover"
              onTimeUpdate={handleTimeUpdate}
              autoPlay
              muted={isMuted}
              playsInline
            />

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls (On Hover) */}
            <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => seekBy(-10)}
                className="bg-black/60 text-white p-3 rounded-full hover:bg-black/80"
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="bg-black/60 text-white p-3 rounded-full hover:bg-black/80"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                type="button"
                onClick={() => seekBy(10)}
                className="bg-black/60 text-white p-3 rounded-full hover:bg-black/80"
              >
                <RotateCw size={18} />
              </button>
            </div>

            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className="absolute top-6 right-6 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Testimonials;
