const router = require('express').Router();
const reviewController = require('../controller/reviewController.js');
const { authenticateToken } = require('../middleware/authMiddleware');

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

// Create a review — must be a logged-in user.
router.post('/', authenticateToken, reviewController.createReview);

// Update / delete a review — the author (createReview binds `user` from the
// JWT) or an admin may do this; ownership is checked inside the controller.
router.put('/:id', authenticateToken, reviewController.updateReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
