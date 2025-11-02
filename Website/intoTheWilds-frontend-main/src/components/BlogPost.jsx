import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useEffect } from "react";

export const BlogPost = () => {
  const { blogs } = useAppContext();
  const { id } = useParams();
  const blog = blogs.find((b) => b.id === Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  
  if (!blog)
    return (
      <div className="container mx-auto py-8">
        <p>Blog not found.</p>
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4 lg:p-32">
      {/* Back Button */}
      {/* <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blogs
      </button> */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Blog Image */}
        <img
          src={blog.image}
          alt={blog.title}
          className="w-[60vw] lg:h-auto max-h-[80vh] object-cover rounded-lg mx-auto mt-32 lg:mt-4"
        />

        {/* Blog Content */}
        <div className="max-w-3xl mx-auto mt-6">
          <h1 className="text-4xl font-bold text-center mb-4">{blog.title}</h1>
          <p className="text-blue-600 font-medium text-center">
            {blog.category}
          </p>
          <div className="prose prose-lg mt-4">
            {blog?.content?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
