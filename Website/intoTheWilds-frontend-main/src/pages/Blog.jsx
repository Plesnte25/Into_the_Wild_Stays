import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";

const Blog = () => {
  const { blogs } = useAppContext();
  const navigate = useNavigate();
  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50/30">
      <div className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.trvl-media.com/lodging/109000000/108380000/108370800/108370765/28b3dc50.jpg?impolicy=resizecrop&rw=1200&ra=fit')] bg-cover bg-center bg-fixed">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2642]/90 via-[#0F2642]/90 to-[#0F2642]/70 backdrop-blur-[2px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white text-base sm:text-lg md:text-xl font-medium tracking-wider mb-4 sm:mb-6"
          >
            DISCOVER OUR STORIES
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
              Our Blogs
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-lg text-white sm:text-xl text-gray-200 max-w-2xl"
          >
            Explore our collection of travel stories and expert insights
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {blogs?.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              onClick={() => handleBlogClick(blog.id)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full z-10 flex items-center gap-2 shadow-lg">
                  <CalendarDays className="h-4 w-4 text-[#0F2642]" />
                  <span className="text-sm text-[#0F2642] font-medium">
                    {blog.date}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-teal-500/10 text-teal-500">
                  {blog.category}
                </span>
                <h3 className="text-xl font-bold text-[#0F2642] group-hover:text-teal-500 transition-colors duration-300">
                  {blog.title}
                </h3>
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600 group-hover:text-[#0F2642] transition-colors duration-300">
                    Read More →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
