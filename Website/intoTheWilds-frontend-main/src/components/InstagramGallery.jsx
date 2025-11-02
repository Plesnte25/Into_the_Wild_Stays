import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, X, Menu } from "lucide-react";
import logo from "../assets/IntotheWildStaysLogo.png";
import Image1 from "../assets/majuli/Property Photo/18PM.jpeg";
import Imageanshi from "../assets/team/AnshiArt&Craftinstructor.jpg";
import Image3 from "../assets/majuli/majuli1.jpeg";
import Image4 from "../assets/SunandSandGoa/52PM.jpeg";
import Image5 from "../assets/itw_rep/itwrep_page-0008.jpg";
import Image6 from "../assets/goa/goa-ggl.jpg";

// Mock data (updated comments to array of objects)
const mockProfileData = {
  username: "intothewildstays",
  fullName: "Into The Wild",
  bio: "Luxury Cottages and Rooms.🏡🛌<br/>Your home in the Wild.🌳🌄<br/>Dhanolti | Rishikesh | Goa | Tehri <br/> Call/whatsapp : 9958838557/9761966485",
  followers: 1039,
  following: 91,
  posts: 93,
  profilePicture: logo,
};

const mockPosts = [
  {
    id: 1,
    imageUrl: Image3,
    likes: 1245,
    comments: [
      { id: 1, text: "Beautiful view!" },
      { id: 2, text: "Amazing place to visit." },
    ],
    caption: "Sunset over the mountains 🏔️ #wanderlust",
    timestamp: "2 days ago",
  },
  {
    id: 2,
    imageUrl: Imageanshi,
    likes: 987,
    comments: [
      { id: 1, text: "Looks so peaceful." },
      { id: 2, text: "I want to go there!" },
    ],
    caption: "Exploring hidden beaches 🏖️ #travelgram",
    timestamp: "5 days ago",
  },
  {
    id: 3,
    imageUrl: Image5,
    likes: 1567,
    comments: [
      { id: 1, text: "Tokyo is amazing!" },
      { id: 2, text: "Great shot!" },
    ],
    caption: "Urban adventures in Tokyo 🇯🇵 #citylife",
    timestamp: "1 week ago",
  },
  {
    id: 4,
    imageUrl: Image6,
    likes: 876,
    comments: [
      { id: 1, text: "Morning coffee vibes ☕" },
      { id: 2, text: "Love this!" },
    ],
    caption: "Morning coffee with a view ☕ #morningmotivation",
    timestamp: "2 weeks ago",
  },
  {
    id: 5,
    imageUrl: Image1,
    likes: 1123,
    comments: [
      { id: 1, text: "Hiking trails are the best!" },
      { id: 2, text: "Great adventure." },
    ],
    caption: "Hiking trails and good vibes 🥾 #outdooradventures",
    timestamp: "3 weeks ago",
  },
  {
    id: 6,
    imageUrl: Image4,
    likes: 945,
    comments: [
      { id: 1, text: "Street photography rocks!" },
      { id: 2, text: "Nice shot!" },
    ],
    caption: "Street photography in New York 🗽 #streetstyle",
    timestamp: "1 month ago",
  },
];

const InstagramGallery = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [commentInput, setCommentInput] = useState("");
  const [posts, setPosts] = useState(mockPosts);
  const [showComments, setShowComments] = useState(false);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowComments(false);
    setCommentInput("");
  };

  const closeModal = () => {
    setSelectedPost(null);
    setShowComments(false);
    setCommentInput("");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      posts[postIndex].likes -= 1;
    } else {
      newLikedPosts.add(postId);
      posts[postIndex].likes += 1;
    }
    setLikedPosts(newLikedPosts);
    setPosts([...posts]);
  };

  const toggleBookmark = (postId) => {
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    if (newBookmarkedPosts.has(postId)) {
      newBookmarkedPosts.delete(postId);
    } else {
      newBookmarkedPosts.add(postId);
    }
    setBookmarkedPosts(newBookmarkedPosts);
  };

  const handleCommentInputChange = (e) => {
    setCommentInput(e.target.value);
  };

  const addComment = () => {
    if (commentInput.trim() === "") return;
    const postIndex = posts.findIndex((p) => p.id === selectedPost.id);
    const newComment = {
      id: posts[postIndex].comments.length + 1,
      text: commentInput.trim(),
    };
    posts[postIndex].comments.push(newComment);
    setPosts([...posts]);
    setCommentInput("");
    setShowComments(true);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const sharePost = () => {
    if (!selectedPost) return;
    const postUrl = window.location.href + "#post-" + selectedPost.id;
    navigator.clipboard.writeText(postUrl).then(() => {
      alert("Post link copied to clipboard!");
    });

    // Open share options in new windows
    const encodedUrl = encodeURIComponent(postUrl);
    const whatsappUrl = `https://wa.me/?text=${encodedUrl}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const instagramUrl = `https://www.instagram.com/`; // Instagram does not support direct share URL

    // Open WhatsApp share
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    // Open Facebook share
    window.open(facebookUrl, "_blank", "noopener,noreferrer");
    // Instagram does not support direct share, so just open Instagram homepage
    window.open(instagramUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className=" bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100 p-4 sm:p-8 lg:p-24">
      <div className="max-w-5xl mx-auto rounded-lg">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center p-6 sm:p-10 rounded-t-lg bg-white border-b border-gray-200 shadow-sm"
        >
          {/* Mobile Menu Toggle */}
{/*           <div className="md:hidden absolute top-4 right-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMobileMenu}
              className="text-gray-600"
            >
              <Menu size={24} />
            </motion.button>
          </div> */}

          {/* Profile Picture */}
          <div className="mb-4 md:mr-8 md:mb-0 flex justify-center w-full md:w-auto">
  <motion.div
    whileHover={{ scale: 1.1 }}
    className="rounded-full"
  >
    <img
      src={mockProfileData.profilePicture}
      alt="Profile"
      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-pink-500 shadow-lg transition-transform"
    />
  </motion.div>
</div>


          {/* Profile Info */}
          <div className="text-center md:text-left w-full md:w-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start mb-3">
              <h2 className="text-2xl sm:text-3xl font-bold mr-0 sm:mr-6 text-gray-800 mb-2 sm:mb-0">
                {mockProfileData.username}
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const instagramUrl = `https://www.instagram.com/${
                    mockProfileData.instagramUsername ||
                    mockProfileData.username
                  }`;
                  window.open(instagramUrl, "_blank", "noopener,noreferrer");
                }}
                className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-4 py-1 sm:px-5 sm:py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center"
              >
                Follow
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-4 sm:space-x-6 mb-3 text-gray-700">
              <span>
                <strong>{mockProfileData.posts}</strong> posts
              </span>
              <span>
                <strong>{mockProfileData.followers}</strong> followers
              </span>
              <span>
                <strong>{mockProfileData.following}</strong> following
              </span>
            </div>

            {/* Bio */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-lg text-gray-900">
                {mockProfileData.fullName}
              </h3>
              <div
                className="text-gray-600 text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: mockProfileData.bio }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Photo Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-1 rounded-b-lg bg-white p-1 sm:p-2 md:p-4"
        >
          {posts?.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="aspect-square overflow-hidden cursor-pointer relative group"
              onClick={() => handlePostClick(post)}
            >
              <img
                src={post.imageUrl}
                alt={`Post ${post.id}`}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center text-white transition-all duration-300">
                <div className="flex space-x-4 opacity-0 group-hover:opacity-100">
                  <span className="flex items-center">
                    <Heart
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(post.id);
                      }}
                      className={`mr-2 cursor-pointer ${
                        likedPosts.has(post.id) ? "text-red-500" : "text-white"
                      }`}
                    />
                    {post.likes}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComments();
                        handlePostClick(post);
                      }}
                      className="mr-2 cursor-pointer"
                    />
                    {post.comments.length}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

     {/* Post Modal */}
     <AnimatePresence>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
              onClick={closeModal}
              tabIndex={-1}
              style={{ outline: "none" }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white w-full max-w-lg sm:max-w-2xl md:max-w-4xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ borderRadius: '0.75rem' }} // Ensure consistent rounded corners
              >
                {/* Image Section */}
                <div className="w-full md:w-3/5 overflow-hidden rounded-tl-xl rounded-bl-xl" tabIndex={-1} style={{ outline: "none" }}> {/* Added overflow-hidden and rounded corners */}
                <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={selectedPost.imageUrl}
                    alt="Selected post"
                    className="w-full h-48 sm:h-64 md:h-[80vh] object-cover rounded-tl-xl rounded-bl-xl"
                    style={{ outline: "none" }} // Added outline: "none" here
                  />
                </div>

                {/* Post Details Section */}
                <div className="w-full md:w-2/5 p-4 md:p-6 flex flex-col">
                  {/* Profile Header */}
                  <div className="flex items-center mb-4">
                    <img
                      src={mockProfileData.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full mr-3 border-2 border-pink-300"
                    />
                    <span className="font-semibold text-base text-gray-800">
                      {mockProfileData.username}
                    </span>
                  </div>

                  {/* Caption */}
                  <div className="flex-grow">
                    <p className="text-gray-700 text-sm md:text-base">
                      {selectedPost.caption}
                    </p>
                  </div>

                  {/* Comments Toggle */}
                  <div className="my-2">
                    <button
                      onClick={toggleComments}
                      className="text-blue-600 hover:underline text-sm font-semibold"
                    >
                      {showComments ? "Hide Comments" : "Show Comments"} (
                      {selectedPost.comments.length})
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments && (
                    <div className="mb-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2 text-gray-700 text-sm space-y-2">
                      {selectedPost.comments.map((comment) => (
                        <p key={comment.id} className="mb-0">
                          {comment.text}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex space-x-2 items-center">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={handleCommentInputChange}
                      className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addComment}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Post
                    </button>
                  </div>

                  {/* Action Icons */}
                  <div className="flex justify-between my-2 md:my-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex space-x-4 text-gray-600"
                    >
                      <Heart
                        onClick={() => toggleLike(selectedPost.id)}
                        className={`cursor-pointer w-5 h-5 ${
                          likedPosts.has(selectedPost.id)
                            ? "text-red-600 fill-red-600"
                            : "text-gray-600"
                        }`}
                      />
                      <MessageCircle
                        onClick={toggleComments}
                        className="cursor-pointer w-5 h-5 hover:text-blue-500"
                      />
                      <Send
                        onClick={sharePost}
                        className="cursor-pointer w-5 h-5 hover:text-green-500"
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Bookmark
                        onClick={() => toggleBookmark(selectedPost.id)}
                        className={`cursor-pointer w-5 h-5 ${
                          bookmarkedPosts.has(selectedPost.id)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    </motion.div>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {selectedPost.timestamp}
                    </p>
                  </div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ rotate: 0 }}
                    onClick={closeModal}
                    className="absolute top-2 left-0 md:top-4 md:right-4 text-gray-600 hover:text-red-500"
                  >
                    <X size={24} md:size={24} />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InstagramGallery;
