import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const BlogSection = () => {
  const { blogs } = useAppContext();
  const previewBlogs = blogs.slice(0, 3);

  return (
    <section className="bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100 py-20 px-6  lg:px-32">
      {/* <div className="absolute inset-0 backdrop-blur-md bg-white/40 rounded-3xl"></div> */}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-cyan-800 to-emerald-800 bg-clip-text text-transparent">
              Discover
            </span>{" "}
            Our Latest Blogs
          </motion.h1>
          <p className="text-xl text-gray-900 font-medium mb-8 leading-relaxed max-w-3xl mx-auto">
            Explore insightful articles, industry trends, and expert
            perspectives that can help you stay informed and inspired.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {previewBlogs?.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/blog/${blog.id}`}
                className="block bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl 
                transition-all duration-500 overflow-hidden border border-white/50 
                transform hover:-translate-y-2 group"
              >
                <div className="relative h-72 overflow-hidden rounded-t-3xl">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-[#0F2642] bg-blue-50 px-4 py-2 rounded-full">
                      {blog.category}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      {blog.date}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#0F2642] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {blog.content[0]}
                  </p>
                  <div className="flex items-center text-[#0F2642] font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Read More</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/blog"
            className="group inline-flex items-center space-x-3 bg-[#0F2642] text-white
            px-10 py-4 font-semibold rounded-full hover:bg-[#0F2642]/90
            transition-all duration-500 transform hover:-translate-y-1
            hover:shadow-xl shadow-lg border border-[#0F2642]/20"
          >
            <span className="text-lg">View All Blogs</span>
            <ArrowRight
              className="transition-transform duration-300 group-hover:translate-x-2"
              size={24}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
