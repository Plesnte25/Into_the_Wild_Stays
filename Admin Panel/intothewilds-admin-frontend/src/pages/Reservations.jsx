import { useEffect, useState, Fragment } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Loader2,
  Eye,
  Calendar,
  User,
  Home,
  CreditCard,
  BadgeInfo,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import api from "../lib/axios";

export default function Reservations() {
  const [bookings, setBookings] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sort: "latest",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  // Fetch bookings
  useEffect(() => {
    fetchBookings();
  }, [filters, pagination.page]);

  const toApiSort = (v) =>
    v === "latest"
      ? "createdAt_desc"
      : v === "oldest"
      ? "createdAt_asc"
      : v === "amount_high"
      ? "amount_desc"
      : v === "amount_low"
      ? "amount_asc"
      : "createdAt_desc";

  const normalizeBooking = (b) => ({
    _id: b._id,
    // names / contact
    guestName: b.guest?.name || b.guestName || "Guest",
    email: b.guest?.email || b.email || "",
    phone: b.guest?.phone || b.phone || "",
    // property
    property: {
      name: b.stay?.propertyName || b.propertyName || "Unknown",
    },
    // dates
    checkIn: b.stay?.checkIn || b.checkInDate,
    checkOut: b.stay?.checkOut || b.checkOutDate,
    createdAt: b.createdAt,
    // party
    guests: {
      adults: b.guests?.adults ?? b.adults ?? 0,
      children: b.guests?.children ?? b.children ?? 0,
    },
    // money
    amount: b.price?.netReceivable ?? b.amount ?? 0,
    // misc
    status: (b.status || "confirmed").toLowerCase(),
    source: b.channel || b.platform || b.source || "website",
    transactionId: b.transactionId || b.paymentId || "",
    specialRequests: b.specialRequests || b.notes || "",
  });

  async function fetchBookings() {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: toApiSort(filters.sort),
      };
      // only send status when it's not "all"
      if (filters.status && filters.status !== "all") {
        // support legacy values
        const map = { checkedin: "checked_in", checkedout: "checked_out" };
        params.status = map[filters.status] || filters.status;
      }
      if (filters.search?.trim()) params.search = filters.search.trim();

      const { data } = await api.get("/bookings", { params });
      const items = (data?.items || []).map(normalizeBooking);

      setBookings(items);
      setPagination((prev) => ({
        ...prev,
        total: data?.total || 0,
        totalPages: Math.ceil((data?.total || 0) / prev.limit),
      }));
    } catch (err) {
      console.error("Error loading bookings:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  // Update booking status
  async function updateStatus(id, newStatus) {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      // Update local state immediately
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleRowClick = (id, event) => {
    // Don't trigger if clicking on action buttons
    if (event.target.closest("button") || event.target.closest("a")) {
      return;
    }
    toggleExpand(id);
  };

  const getStatusColor = (statusRaw) => {
    const s = (statusRaw || "").toLowerCase();
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      checked_in: "bg-blue-100 text-blue-800 border-blue-200",
      checkedout: "bg-gray-100 text-gray-800 border-gray-200",
      checked_out: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[s] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Calculate payment breakdown
  const calculatePaymentBreakdown = (amount) => {
    const net = amount * 0.85; // 85% base
    const tax = amount * 0.1; // 10% tax
    const commission = amount * 0.05; // 5% commission
    const profit = net - commission;

    return { net, tax, commission, profit };
  };

  // Generate Invoice
  const generateInvoice = (booking) => {
    const { net, tax, commission } = calculatePaymentBreakdown(booking.amount);
    const invoiceData = {
      bookingId: booking._id,
      guestName: booking.guestName,
      email: booking.email,
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: Math.ceil(
        (new Date(booking.checkOut) - new Date(booking.checkIn)) /
          (1000 * 60 * 60 * 24)
      ),
      property: booking.property?.name,
      adults: booking.guests?.adults || 0,
      children: booking.guests?.children || 0,
      netCost: net,
      tax: tax,
      commission: commission,
      total: booking.amount ?? 0,
      status: booking.status,
      source: booking.source,
      transactionId: booking.transactionId,
      bookingDate: booking.createdAt,
    };

    // Create invoice PDF
    const invoiceWindow = window.open("", "_blank");
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceData.bookingId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .status-${invoiceData.status} { 
              color: ${
                invoiceData.status === "cancelled" ? "#dc2626" : "#059669"
              };
              font-weight: bold;
            }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${
              invoiceData.status === "cancelled"
                ? "BOOKING CANCELLED"
                : "BOOKING CONFIRMATION"
            }</h1>
            <p><strong>Booking Date:</strong> ${new Date(
              invoiceData.bookingDate
            ).toLocaleDateString()}</p>
            <p><strong>Booking ID:</strong> ${invoiceData.bookingId}</p>
          </div>
          
          <div class="section">
            <h3>Guest & Booking Details</h3>
            <table>
              <tr><th>Guest Name</th><td>${invoiceData.guestName}</td></tr>
              <tr><th>Email</th><td>${invoiceData.email || "N/A"}</td></tr>
              <tr><th>Phone</th><td>${invoiceData.phone || "N/A"}</td></tr>
              <tr><th>Check-In</th><td>${new Date(
                invoiceData.checkIn
              ).toLocaleDateString()}</td></tr>
              <tr><th>Check-Out</th><td>${new Date(
                invoiceData.checkOut
              ).toLocaleDateString()}</td></tr>
              <tr><th>Nights</th><td>${invoiceData.nights}</td></tr>
              <tr><th>Guests</th><td>${invoiceData.adults} Adults, ${
      invoiceData.children
    } Children</td></tr>
              <tr><th>Property</th><td>${invoiceData.property}</td></tr>
              <tr><th>Status</th><td class="status-${
                invoiceData.status
              }">${invoiceData.status.toUpperCase()}</td></tr>
            </table>
          </div>

          <div class="section">
            <h3>Payment Breakdown</h3>
            <table>
              <tr><th>Description</th><th>Amount (₹)</th></tr>
              <tr><td>Net Cost</td><td>${invoiceData.netCost.toFixed(
                2
              )}</td></tr>
              <tr><td>Tax (10%)</td><td>${invoiceData.tax.toFixed(2)}</td></tr>
              <tr><td>Commission (5%)</td><td>${invoiceData.commission.toFixed(
                2
              )}</td></tr>
              <tr class="total-row"><td>Total Amount</td><td>${invoiceData.total.toFixed(
                2
              )}</td></tr>
            </table>
          </div>

          <div class="section">
            <p><strong>Transaction ID:</strong> ${
              invoiceData.transactionId || "N/A"
            }</p>
            <p><strong>Source:</strong> ${
              invoiceData.source || "Direct Booking"
            }</p>
          </div>

          <div class="footer">
            <p><em>This is a computer generated invoice and does not require signature.</em></p>
            <p>IntoTheWild Stays • Eco Park, Dhanolii, Uttarakhand 249145, India</p>
          </div>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  // Calculate stats for KPI cards
  const calculateStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const checkedin = bookings.filter((b) => b.status === "checkedin").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    // Calculate total profit (net - commission)
    const totalProfit = bookings.reduce((sum, booking) => {
      const { profit } = calculatePaymentBreakdown(booking.amount);
      return sum + profit;
    }, 0);

    return { total, confirmed, pending, checkedin, cancelled, totalProfit };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all your property bookings
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by ID, Name, Property..."
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
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none min-w-32"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checkedin">Checked-In</option>
              <option value="checkedout">Checked-Out</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none min-w-36"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount High to Low</option>
              <option value="amount_low">Amount Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          {
            label: "Total Bookings",
            value: stats.total,
            color: "bg-blue-50 text-blue-700 border-blue-200",
            icon: "📊",
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            color: "bg-green-50 text-green-700 border-green-200",
            icon: "✅",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "bg-yellow-50 text-yellow-700 border-yellow-200",
            icon: "⏳",
          },
          {
            label: "Checked-In",
            value: stats.checkedin,
            color: "bg-purple-50 text-purple-700 border-purple-200",
            icon: "🏠",
          },
          {
            label: "Cancelled",
            value: stats.cancelled,
            color: "bg-red-50 text-red-700 border-red-200",
            icon: "❌",
          },
          {
            label: "Total Profit",
            value: `₹${stats.totalProfit.toFixed(2)}`,
            color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: "💰",
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${stat.color}`}>
                  {stat.label}
                </div>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700">
                  Booking ID
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  Guest Name
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  Property
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  Check-In
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  Check-Out
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  Guests
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  <div className="flex flex-col">
                    <span>Total Amount</span>
                    <span className="text-xs font-normal text-gray-500">
                      (Tax + Commission)
                    </span>
                  </div>
                </th>
                <th className="p-4 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="p-4 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2
                        className="animate-spin text-teal-600"
                        size={24}
                      />
                      <span className="text-gray-500 text-sm">
                        Loading bookings...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="text-gray-400" size={32} />
                      <span className="text-gray-500">No bookings found</span>
                      <span className="text-gray-400 text-sm">
                        Try adjusting your filters
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const { net, tax, commission } = calculatePaymentBreakdown(
                    booking.amount
                  );

                  return (
                    <Fragment key={booking._id}>
                      <tr
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={(e) => handleRowClick(booking._id, e)}
                      >
                        <td className="p-4 font-mono text-xs text-gray-600">
                          #{booking._id?.slice(-8).toUpperCase() || "N/A"}
                        </td>
                        <td className="p-4 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            {booking.guestName}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Home size={16} className="text-gray-400" />
                            <span className="max-w-[120px] truncate">
                              {booking.property?.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          {booking.guests?.adults || 0}A +{" "}
                          {booking.guests?.children || 0}C
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold flex items-center gap-1">
                              <IndianRupee size={14} />
                              {booking.amount}
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>Tax: ₹{tax.toFixed(2)}</div>
                              <div>Commission: ₹{commission.toFixed(2)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => toggleExpand(booking._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors text-xs font-medium"
                            >
                              <Eye size={14} />
                              {expanded === booking._id ? "Hide" : "View"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                generateInvoice(booking);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-xs font-medium"
                              title="Generate Invoice"
                            >
                              <FileText size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Compact Expanded Details */}
                      {expanded === booking._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="9" className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              {/* Guest Info */}
                              <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <User size={16} />
                                  Guest Info
                                </h3>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-gray-600">
                                      Email:
                                    </span>
                                    <br />
                                    {booking.email || "N/A"}
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Phone:
                                    </span>
                                    <br />
                                    {booking.phone || "N/A"}
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Booked:
                                    </span>
                                    <br />
                                    {new Date(
                                      booking.createdAt
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>

                              {/* Booking Details */}
                              <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <BadgeInfo size={16} />
                                  Booking Details
                                </h3>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-gray-600">
                                      Source:
                                    </span>
                                    <br />
                                    {booking.source || "Website"}
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Nights:
                                    </span>
                                    <br />
                                    {Math.ceil(
                                      (new Date(booking.checkOut) -
                                        new Date(booking.checkIn)) /
                                        (1000 * 60 * 60 * 24)
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Requests:
                                    </span>
                                    <br />
                                    {booking.specialRequests || "None"}
                                  </div>
                                </div>
                              </div>

                              {/* Payment Info */}
                              <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <CreditCard size={16} />
                                  Payment Info
                                </h3>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-gray-600">
                                      Method:
                                    </span>
                                    <br />
                                    {booking.paymentMethod || "N/A"}
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Txn ID:
                                    </span>
                                    <br />
                                    {booking.transactionId || "—"}
                                  </div>
                                  <div>
                                    <span className="text-gray-600">
                                      Status:
                                    </span>
                                    <br />
                                    <span className="text-green-600">Paid</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Update */}
                              <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">
                                  Update Status
                                </h3>
                                <div className="space-y-3">
                                  <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    value={booking.status}
                                    onChange={(e) =>
                                      updateStatus(booking._id, e.target.value)
                                    }
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="checkedin">
                                      Checked-In
                                    </option>
                                    <option value="checkedout">
                                      Checked-Out
                                    </option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                  </select>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateInvoice(booking);
                                      }}
                                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                                    >
                                      <Download size={14} />
                                      Invoice
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpanded(null);
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {bookings.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pageNum,
                            }))
                          }
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            pagination.page === pageNum
                              ? "bg-teal-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
