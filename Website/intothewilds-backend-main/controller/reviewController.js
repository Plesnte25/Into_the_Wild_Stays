const Review = require('../models/Review');
const User = require('../models/User');
const Property = require('../models/Properties'); // Make sure this is the correct model
const Booking = require('../models/Booking'); // Assuming you have this model

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('property', 'title location')
      .populate('booking');
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get latest reviews
exports.getLatestReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('property', 'title location')
      .populate('booking');
    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { user, comment, property, rating, image, booking, stayedAt } = req.body;

    const userExists = await User.findById(user);
    if (!userExists) return res.status(400).json({ error: 'User not found.' });

    const propertyExists = await Property.findById(property);
    if (!propertyExists) return res.status(400).json({ error: 'Property not found.' });

    const bookingExists = await Booking.findById(booking);
    if (!bookingExists) return res.status(400).json({ error: 'Booking not found.' });

    const review = await Review.create({
      user,
      comment,
      property,
      rating,
      image,
      booking,
      stayedAt,
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reviews by property ID
exports.getReviewsByProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const reviews = await Review.find({ property: propertyId })
      .populate('user', 'name avatar email')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews by property:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ New: Get review by booking ID
exports.getReviewByBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const review = await Review.findOne({ booking: bookingId })
      .populate('user', 'name avatar email')
      .populate('property', 'title location');

    if (!review) return res.status(404).json({ success: false, message: 'Review not found for this booking.' });

    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error('Error fetching review by booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get review by review ID
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id)
      .populate('user', 'name avatar email')
      .populate('property', 'title location')
      .populate('booking');

    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.status(200).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, image, stayedAt } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { rating, comment, image, stayedAt },
      { new: true }
    );

    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.status(200).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    res.status(200).json({ success: true, message: 'Review deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
