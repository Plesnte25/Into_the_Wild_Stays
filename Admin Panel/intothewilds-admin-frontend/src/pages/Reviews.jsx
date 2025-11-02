import { useEffect, useState } from "react";
import {
  Star,
  Search,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building,
  User,
  MessageCircle,
  Reply as ReplyIcon,
  Send,
  X,
  ChevronDown,
} from "lucide-react";
import api from "../lib/axios";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    property: "all",
    rating: "all",
  });

  const [stats, setStats] = useState({
    overall: 0,
    propertyAverages: [],
    total: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [propertyOptions, setPropertyOptions] = useState([
    { _id: "all", name: "All Properties" },
  ]);

  // Hidden reviews dropdown state
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const [hiddenReviews, setHiddenReviews] = useState([]);
  const [hiddenLoading, setHiddenLoading] = useState(false);

  // Local “reply” UI state
  const [replyState, setReplyState] = useState({});

  // ---------- Loaders ----------
  const loadPropertyOptions = async () => {
    try {
      const { data } = await api.get("/properties/options");
      const items = Array.isArray(data?.items) ? data.items : [];
      setPropertyOptions([{ _id: "all", name: "All Properties" }, ...items]);
    } catch (e) {
      console.error("Failed to load property options:", e);
      setPropertyOptions([{ _id: "all", name: "All Properties" }]);
    }
  };

  const loadStats = async () => {
    try {
      const params = {
        search: filters.search,
        property: filters.property,
        rating: filters.rating,
        visibility: "visible", // stats based on visible reviews by default
      };
      const { data } = await api.get("/reviews/stats", { params });
      setStats({
        overall: data?.overall || 0,
        total: data?.total || 0,
        propertyAverages: data?.propertyAverages || [],
        ratingDistribution: data?.ratingDistribution || {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
    } catch (e) {
      console.error("Failed to load stats:", e);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        property: filters.property,
        rating: filters.rating,
        visibility: "visible",
      };
      const response = await api.get("/reviews", { params });
      const items = response.data?.items || [];
      setReviews(items);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / prev.limit),
      }));
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHiddenReviews = async () => {
    setHiddenLoading(true);
    try {
      const { data } = await api.get("/reviews", {
        params: { page: 1, limit: 50, visibility: "hidden" },
      });
      setHiddenReviews(data?.items || []);
    } catch (e) {
      console.error("Failed to load hidden reviews:", e);
    } finally {
      setHiddenLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyOptions();
  }, []);
  useEffect(() => {
    loadReviews();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters]);

  // ---------- Actions ----------
  const hideReview = async (id) => {
    try {
      await api.patch(`/reviews/${id}`, { hidden: true });
      await Promise.all([loadReviews(), loadStats(), loadHiddenReviews()]);
    } catch (error) {
      console.error("Error hiding review:", error);
    }
  };

  const showReview = async (id) => {
    try {
      await api.patch(`/reviews/${id}`, { hidden: false });
      await Promise.all([loadReviews(), loadStats(), loadHiddenReviews()]);
    } catch (error) {
      console.error("Error showing review:", error);
    }
  };

  const deleteReview = async (id) => {
    if (confirm("Delete this review permanently?")) {
      try {
        await api.delete(`/reviews/${id}`);
        await Promise.all([loadReviews(), loadStats(), loadHiddenReviews()]);
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  // ---------- Replies ----------
  const toggleReply = async (reviewId) => {
    setReplyState((prev) => {
      const open = !prev[reviewId]?.open;
      return {
        ...prev,
        [reviewId]: {
          ...(prev[reviewId] || { message: "", replies: [], loading: false }),
          open,
        },
      };
    });

    // Load replies only when opening
    const st = replyState[reviewId];
    if (!st?.open) {
      try {
        const { data } = await api.get(`/reviews/${reviewId}/replies`);
        setReplyState((prev) => ({
          ...prev,
          [reviewId]: { ...(prev[reviewId] || {}), replies: data?.items || [] },
        }));
      } catch (e) {
        console.error("Failed to load replies:", e);
      }
    }
  };

  const sendReply = async (reviewId) => {
    const message = replyState[reviewId]?.message?.trim();
    if (!message) return;

    setReplyState((prev) => ({
      ...prev,
      [reviewId]: { ...(prev[reviewId] || {}), loading: true },
    }));
    try {
      const { data } = await api.post(`/reviews/${reviewId}/replies`, {
        message,
      });
      setReplyState((prev) => ({
        ...prev,
        [reviewId]: {
          open: true,
          message: "",
          loading: false,
          replies: [data, ...(prev[reviewId]?.replies || [])],
        },
      }));
    } catch (e) {
      console.error("Reply failed:", e);
      setReplyState((prev) => ({
        ...prev,
        [reviewId]: { ...(prev[reviewId] || {}), loading: false },
      }));
      alert(e?.response?.data?.message || "Failed to send reply");
    }
  };

  const deleteReply = async (reviewId, replyId) => {
    if (!confirm("Delete this reply?")) return;
    try {
      await api.delete(`/reviews/${reviewId}/replies/${replyId}`);
      setReplyState((prev) => ({
        ...prev,
        [reviewId]: {
          ...(prev[reviewId] || {}),
          replies: (prev[reviewId]?.replies || []).filter(
            (r) => r._id !== replyId
          ),
        },
      }));
    } catch (e) {
      console.error("Failed to delete reply:", e);
      alert(e?.response?.data?.message || "Failed to delete reply");
    }
  };

  // ---------- UI helpers ----------
  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
        }
      />
    ));

  const truncateText = (text, maxLength = 160) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Hidden dropdown handler
  const toggleHiddenPanel = async () => {
    const next = !hiddenOpen;
    setHiddenOpen(next);
    if (next) await loadHiddenReviews();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Reviews</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and monitor property feedback
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all w-full sm:w-64"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.property}
              onChange={(e) => {
                setFilters({ ...filters, property: e.target.value });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none min-w-36"
            >
              {propertyOptions.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={filters.rating}
              onChange={(e) => {
                setFilters({ ...filters, rating: e.target.value });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none min-w-28"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Hidden reviews dropdown trigger */}
            <button
              onClick={toggleHiddenPanel}
              className="inline-flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
              title="Show hidden reviews"
            >
              Hidden ({hiddenReviews.length})
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Rating */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {stats.overall.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600">Overall Rating</div>
              <div className="flex gap-1 mt-1">
                {renderStars(Math.round(stats.overall))}
              </div>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.total} total reviews
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            Rating Distribution
          </h3>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-xs text-gray-600">{rating}</span>
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{
                      width: `${
                        ((stats.ratingDistribution[rating] || 0) /
                          (stats.total || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-6">
                  {stats.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Property Averages (includes properties with no reviews as 3.0) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            Property Averages
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {(stats.propertyAverages || []).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building size={12} className="text-gray-400" />
                  <span className="text-xs font-medium truncate max-w-[160px]">
                    {item.property?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">
                    {(item.average || 0).toFixed(1)}
                  </span>
                  <div className="flex gap-0.5">
                    {renderStars(Math.round(item.average || 0))}
                  </div>
                </div>
              </div>
            ))}
            {(!stats.propertyAverages ||
              stats.propertyAverages.length === 0) && (
              <div className="text-xs text-gray-500 text-center py-1">
                No property data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden reviews dropdown panel */}
      {hiddenOpen && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b bg-gray-50 text-sm font-semibold">
            Hidden Reviews
          </div>
          <div className="p-4">
            {hiddenLoading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : hiddenReviews.length === 0 ? (
              <div className="text-sm text-gray-500">No hidden reviews</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiddenReviews.map((hr) => (
                  <div
                    key={hr._id}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {hr.userName || "Anonymous Guest"}
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(hr.rating)}
                        <span className="text-xs font-semibold text-gray-700">
                          {hr.rating}.0
                        </span>
                      </div>
                    </div>
                    {hr.property?.name && (
                      <div className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                        <Building size={12} />
                        {hr.property.name}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-700">
                      {truncateText(hr.comment || "No comment provided", 140)}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => showReview(hr._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors text-xs font-medium"
                      >
                        <Eye size={12} />
                        Show
                      </button>
                      <button
                        onClick={() => deleteReview(hr._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors text-xs font-medium"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Guest Reviews ({pagination.total})
            </h3>
            {pagination.totalPages > 1 && (
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
                <span className="text-gray-500 text-sm">
                  Loading reviews...
                </span>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <Search className="text-gray-400" size={32} />
                <span className="text-gray-500">No reviews found</span>
                <span className="text-gray-400 text-sm">
                  Try adjusting your filters
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => {
                const st = replyState[review._id] || {
                  open: false,
                  message: "",
                  loading: false,
                  replies: [],
                };
                return (
                  <div
                    key={review._id}
                    className={`border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md ${
                      review.hidden ? "bg-gray-50 opacity-75" : "bg-white"
                    } flex flex-col h-full`} // <-- keep footer fixed
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-teal-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {review.userName || "Anonymous Guest"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm font-semibold text-gray-700">
                            {review.rating}.0
                          </span>
                        </div>
                        {review.hidden && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                            <EyeOff size={10} className="mr-0.5" />
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Property */}
                    {review.property?.name && (
                      <div className="flex items-center gap-2 mb-3">
                        <Building size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 font-medium truncate">
                          {review.property.name}
                        </span>
                      </div>
                    )}

                    {/* Comment */}
                    <div className="mb-4">
                      <div className="flex items-start gap-1 mb-1">
                        <MessageCircle
                          size={14}
                          className="text-gray-400 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {truncateText(
                            review.comment || "No comment provided",
                            160
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS (fixed bottom) */}
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="flex gap-2">
                        {review.hidden ? (
                          <button
                            onClick={() => showReview(review._id)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors text-xs font-medium"
                          >
                            <Eye size={12} />
                            Show
                          </button>
                        ) : (
                          <button
                            onClick={() => hideReview(review._id)}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 transition-colors text-xs font-medium"
                          >
                            <EyeOff size={12} />
                            Hide
                          </button>
                        )}

                        <button
                          onClick={() => deleteReview(review._id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors text-xs font-medium"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>

                        <button
                          onClick={() => toggleReply(review._id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors text-xs font-medium"
                          title="Reply"
                        >
                          <ReplyIcon size={12} />
                          {st.open ? "Hide" : "Reply"}
                        </button>
                      </div>

                      {/* Reply panel */}
                      {st.open && (
                        <div className="mt-3">
                          <div className="flex gap-2">
                            <textarea
                              rows={2}
                              className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                              placeholder="Write a reply to this guest..."
                              value={st.message}
                              onChange={(e) =>
                                setReplyState((prev) => ({
                                  ...prev,
                                  [review._id]: {
                                    ...(prev[review._id] || {}),
                                    message: e.target.value,
                                  },
                                }))
                              }
                            />
                            <button
                              onClick={() => sendReply(review._id)}
                              disabled={st.loading || !st.message?.trim()}
                              className="shrink-0 inline-flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send size={14} />
                              Send
                            </button>
                          </div>

                          {/* Replies list */}
                          <div className="mt-3 space-y-2">
                            {(st.replies || []).map((r) => (
                              <div
                                key={r._id}
                                className="flex items-start justify-between rounded-md bg-gray-50 p-2"
                              >
                                <div>
                                  <div className="text-xs text-gray-500">
                                    {r.createdBy?.name || "Admin"} •{" "}
                                    {new Date(r.createdAt).toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-800">
                                    {r.message}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteReply(review._id, r._id)}
                                  className="text-gray-400 hover:text-red-600"
                                  title="Delete reply"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                            {(!st.replies || st.replies.length === 0) && (
                              <div className="text-xs text-gray-500">
                                No replies yet
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> reviews
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) pageNum = i + 1;
                    else if (pagination.page <= 3) pageNum = i + 1;
                    else if (pagination.page >= pagination.totalPages - 2)
                      pageNum = pagination.totalPages - 4 + i;
                    else pageNum = pagination.page - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          setPagination((p) => ({ ...p, page: pageNum }))
                        }
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pagination.page === pageNum
                            ? "bg-teal-600 text-white"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
