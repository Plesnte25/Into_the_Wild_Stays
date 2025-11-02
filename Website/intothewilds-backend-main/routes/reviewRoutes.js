const router = require('express').Router();
const reviewController = require('../controller/reviewController.js');

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get latest 10 reviews
router.get('/latest', reviewController.getLatestReviews);

// Get all reviews for a specific property
router.get('/property/:id', reviewController.getReviewsByProperty);

// ✅ Get review by booking ID
router.get('/booking/:id', reviewController.getReviewByBooking);

// Get review by its own ID
router.get('/review/:id', reviewController.getReviewById);

// Create a review
router.post('/', reviewController.createReview);

// Update review by ID
router.put('/:id', reviewController.updateReview);

// Delete review by ID
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
